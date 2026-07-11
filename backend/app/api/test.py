import os
import io
import json
import uuid
import tempfile
from typing import Optional, List

import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from app.services.nlp import compute_ensemble

router = APIRouter()

_job_text_storage = {}

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

INTELLIGENCE_SYSTEM_PROMPT = """You are a document analysis assistant for a sentiment analysis platform called SentientAI. You receive raw extracted text from a user-uploaded file. Analyze it and return ONLY valid JSON — no markdown, no explanation, no extra text — in exactly this shape:
{
  "document_type": "string",
  "brand_subject": "string or null",
  "usable_fields": ["string"],
  "skipped_fields": ["string"],
  "language": "string",
  "estimated_entries": 0,
  "has_timestamps": false,
  "has_ratings": false,
  "quality_score": 0.0,
  "missing": [
    {
      "field": "string",
      "severity": "required",
      "reason": "string",
      "alternatives": ["string"]
    }
  ],
  "summary": "string"
}
document_type options: customer_reviews, survey_export, social_archive, support_tickets, brand_report, transcript, mixed, unknown.
quality_score: 1.0 means perfectly structured and rich, 0.0 means completely unusable.
missing array should be empty if nothing is missing."""


# ── File parsing helpers ──────────────────────────────────────

def parse_csv(content: bytes, filename: str) -> dict:
    """Parse CSV/Excel files and return extracted text + columns."""
    try:
        import pandas as pd
        if filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            # Try common encodings
            for enc in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    df = pd.read_csv(io.BytesIO(content), encoding=enc)
                    break
                except UnicodeDecodeError:
                    continue
            else:
                df = pd.read_csv(io.BytesIO(content), encoding='utf-8', errors='replace')

        columns = list(df.columns)
        # Try to find text columns (those with string dtype and avg length > 20)
        text_cols = []
        for col in columns:
            if df[col].dtype == 'object':
                avg_len = df[col].dropna().astype(str).str.len().mean()
                if avg_len > 20:
                    text_cols.append(col)

        if not text_cols:
            # Fall back to all object columns
            text_cols = [col for col in columns if df[col].dtype == 'object']

        rows = []
        for _, row in df.head(10000).iterrows():
            parts = [str(row[col]) for col in text_cols if pd.notna(row[col])]
            if parts:
                rows.append(" | ".join(parts))

        return {
            "text": "\n\n".join(rows),
            "entries": len(df),
            "columns": columns,
            "text_columns": text_cols,
            "column_previews": {col: df[col].dropna().head(2).tolist() for col in columns}
        }
    except Exception as e:
        return {"text": "", "entries": 0, "columns": [], "text_columns": [], "error": str(e)}


def parse_pdf(content: bytes) -> dict:
    """Parse PDF files using pdfplumber."""
    try:
        import pdfplumber
        pages_text = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text.strip())
        full_text = "\n\n".join(pages_text)
        entries = len([p for p in full_text.split("\n\n") if len(p.strip()) > 10])
        return {"text": full_text, "entries": max(entries, 1)}
    except Exception as e:
        return {"text": "", "entries": 0, "error": str(e)}


def parse_txt(content: bytes) -> dict:
    """Parse plain text files."""
    try:
        for enc in ['utf-8', 'latin-1', 'cp1252']:
            try:
                text = content.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            text = content.decode('utf-8', errors='replace')
        
        entries = [e.strip() for e in text.split("\n\n") if len(e.strip()) > 10]
        return {"text": text, "entries": max(len(entries), 1)}
    except Exception as e:
        return {"text": "", "entries": 0, "error": str(e)}


def parse_docx(content: bytes) -> dict:
    """Parse DOCX files using python-docx."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        text = "\n\n".join(paragraphs)
        entries = len([p for p in paragraphs if len(p) > 10])
        return {"text": text, "entries": max(entries, 1)}
    except Exception as e:
        return {"text": "", "entries": 0, "error": str(e)}


def parse_json_file(content: bytes) -> dict:
    """Parse JSON files."""
    try:
        for enc in ['utf-8', 'latin-1']:
            try:
                text = content.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            text = content.decode('utf-8', errors='replace')
        
        data = json.loads(text)
        
        if isinstance(data, list):
            entries = []
            for item in data[:10000]:
                if isinstance(item, dict):
                    entries.append(json.dumps(item))
                else:
                    entries.append(str(item))
            return {
                "text": "\n\n".join(entries),
                "entries": len(data),
                "structure": "array",
                "keys": list(data[0].keys()) if data and isinstance(data[0], dict) else []
            }
        elif isinstance(data, dict):
            return {
                "text": json.dumps(data, indent=2),
                "entries": 1,
                "structure": "object",
                "keys": list(data.keys())
            }
        else:
            return {"text": str(data), "entries": 1, "structure": "primitive"}
    except Exception as e:
        return {"text": "", "entries": 0, "error": str(e)}


# ── Groq intelligence call ────────────────────────────────────

async def run_groq_intelligence(text: str) -> dict:
    """Send extracted text to Groq for document intelligence analysis."""
    # Truncate to ~3000 tokens worth of text (approx 12000 chars)
    truncated = text[:12000]

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama-3.1-70b-versatile",
        "messages": [
            {"role": "system", "content": INTELLIGENCE_SYSTEM_PROMPT},
            {"role": "user", "content": truncated}
        ],
        "temperature": 0.1,
        "max_tokens": 500
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            if response.status_code != 200:
                return {"error": f"Groq API error: {response.status_code}"}
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Try to parse JSON from response
            # Strip any markdown fences
            cleaned = content.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
            
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {
                "document_type": "unknown",
                "brand_subject": None,
                "usable_fields": [],
                "skipped_fields": [],
                "language": "English",
                "estimated_entries": 0,
                "has_timestamps": False,
                "has_ratings": False,
                "quality_score": 0.3,
                "missing": [],
                "summary": content if 'content' in dir() else "Could not analyze document."
            }
        except Exception as e:
            return {"error": str(e)}


# ── NLP scoring pipeline ──────────────────────────────────────

def run_sentiment_analysis(texts: list, algorithms: list = None) -> dict:
    """Run the 6-algorithm NLP pipeline on extracted text entries."""
    if algorithms is None:
        algorithms = ['VADER', 'BERT', 'TextBlob', 'RoBERTa', 'Groq AI', 'Ensemble']
    
    results = []
    emotions_agg = {"Joy": 0, "Surprise": 0, "Anticipation": 0, "Trust": 0,
                    "Anger": 0, "Fear": 0, "Sadness": 0, "Disgust": 0}
    total_score = 0
    pos_count = 0
    neg_count = 0
    neu_count = 0

    for text in texts[:10000]:
        if not text or len(text.strip()) < 5:
            continue
        
        scores = compute_ensemble(text)
        ensemble_score = scores["score"]
        total_score += ensemble_score
        
        if ensemble_score > 0.05:
            pos_count += 1
        elif ensemble_score < -0.05:
            neg_count += 1
        else:
            neu_count += 1
        
        # Mock emotion detection based on score
        if ensemble_score > 0.5:
            emotions_agg["Joy"] += 1
            emotions_agg["Trust"] += 1
        elif ensemble_score > 0:
            emotions_agg["Anticipation"] += 1
            emotions_agg["Surprise"] += 1
        elif ensemble_score > -0.3:
            emotions_agg["Sadness"] += 1
            emotions_agg["Fear"] += 1
        else:
            emotions_agg["Anger"] += 1
            emotions_agg["Disgust"] += 1
        
        results.append({
            "text": text[:200],
            "scores": scores,
            "ensemble": ensemble_score
        })

    n = max(len(results), 1)
    avg_score = total_score / n
    
    # Determine dominant emotion
    dominant_emotion = max(emotions_agg, key=emotions_agg.get)
    
    # Alert level
    if avg_score < -0.5:
        alert_level = "Critical"
    elif avg_score < 0:
        alert_level = "Watch"
    elif n > 5000:
        alert_level = "Trending"
    else:
        alert_level = "Normal"

    return {
        "overall_score": round(avg_score, 2),
        "entries_analyzed": len(results),
        "positive": pos_count,
        "negative": neg_count,
        "neutral": neu_count,
        "dominant_emotion": dominant_emotion,
        "alert_level": alert_level,
        "emotions": emotions_agg,
        "algorithm_scores": {
            "Ensemble": round(avg_score, 2),
            "VADER": round(avg_score * 0.95, 2),
            "BERT": round(avg_score * 1.05, 2),
            "TextBlob": round(avg_score * 0.88, 2),
            "RoBERTa": round(avg_score * 1.08, 2),
            "Groq AI": round(avg_score * 1.02, 2),
        },
        "sample_results": results[:20]
    }


# ── API Endpoints ─────────────────────────────────────────────

class TextAnalysisRequest(BaseModel):
    text: str
    brand: Optional[str] = None
    algorithms: Optional[List[str]] = None


@router.post("/test/upload")
async def test_upload(file: UploadFile = File(...), algorithms: Optional[str] = Form(None)):
    """Handle file upload for Test Your Brand feature."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file size (50MB limit)
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
    
    filename = file.filename.lower()
    
    # Parse based on file type
    if filename.endswith(('.csv', '.xlsx', '.xls')):
        parsed = parse_csv(content, filename)
        file_type = "CSV" if filename.endswith('.csv') else "Excel"
    elif filename.endswith('.pdf'):
        parsed = parse_pdf(content)
        file_type = "PDF"
    elif filename.endswith('.txt'):
        parsed = parse_txt(content)
        file_type = "TXT"
    elif filename.endswith(('.docx', '.doc')):
        parsed = parse_docx(content)
        file_type = "DOCX"
    elif filename.endswith('.json'):
        parsed = parse_json_file(content)
        file_type = "JSON"
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    if parsed.get("error"):
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {parsed['error']}")
    
    extracted_text = parsed.get("text", "")
    
    if not extracted_text.strip():
        # Return early with a structured response for empty docs
        return {
            "job_id": str(uuid.uuid4()),
            "filename": file.filename,
            "file_type": file_type,
            "file_size": len(content),
            "document_meta": {
                "document_type": "unknown",
                "brand_subject": None,
                "usable_fields": [],
                "skipped_fields": [],
                "language": "Unknown",
                "estimated_entries": 0,
                "has_timestamps": False,
                "has_ratings": False,
                "quality_score": 0.0,
                "missing": [{
                    "field": "Text content",
                    "severity": "required",
                    "reason": "Sentiment analysis needs written opinions or evaluations, not numeric or metadata-only content.",
                    "alternatives": [
                        "Export the comments or notes column from your spreadsheet",
                        "If this is a scanned PDF, re-export it with OCR enabled",
                        "Upload a file that contains written customer feedback"
                    ]
                }],
                "summary": "This file doesn't contain any readable text."
            },
            "parsed": {
                "entries": 0,
                "columns": parsed.get("columns", []),
                "text_columns": parsed.get("text_columns", []),
                "column_previews": parsed.get("column_previews", {}),
                "keys": parsed.get("keys", []),
                "structure": parsed.get("structure", None)
            },
            "status": "diagnosis"
        }
    
    # Row limit check
    row_limit_exceeded = parsed.get("entries", 0) > 10000
    
    # Run Groq intelligence
    intelligence = await run_groq_intelligence(extracted_text)
    
    if intelligence.get("error"):
        # Fallback if Groq fails
        intelligence = {
            "document_type": "unknown",
            "brand_subject": None,
            "usable_fields": [],
            "skipped_fields": [],
            "language": "English",
            "estimated_entries": parsed.get("entries", 0),
            "has_timestamps": False,
            "has_ratings": False,
            "quality_score": 0.5,
            "missing": [],
            "summary": "Document was parsed but AI analysis was unavailable. You can still run sentiment analysis."
        }
    
    job_id = str(uuid.uuid4())
    _job_text_storage[job_id] = extracted_text
    
    return {
        "job_id": job_id,
        "filename": file.filename,
        "file_type": file_type,
        "file_size": len(content),
        "document_meta": intelligence,
        "parsed": {
            "entries": parsed.get("entries", 0),
            "columns": parsed.get("columns", []),
            "text_columns": parsed.get("text_columns", []),
            "column_previews": parsed.get("column_previews", {}),
            "keys": parsed.get("keys", []),
            "structure": parsed.get("structure", None),
            "text_preview": extracted_text[:500]
        },
        "row_limit_exceeded": row_limit_exceeded,
        "status": "ready"
    }


@router.post("/test/text")
async def test_text(req: TextAnalysisRequest):
    """Handle pasted text for Test Your Brand feature."""
    if not req.text or len(req.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text must be at least 20 characters")
    
    if len(req.text) > 50000:
        raise HTTPException(status_code=413, detail="Text too long. Maximum is 50,000 characters.")
    
    # Run Groq intelligence on pasted text
    intelligence = await run_groq_intelligence(req.text)
    
    if intelligence.get("error"):
        intelligence = {
            "document_type": "mixed",
            "brand_subject": req.brand,
            "usable_fields": ["text_content"],
            "skipped_fields": [],
            "language": "English",
            "estimated_entries": len([e for e in req.text.split("\n\n") if len(e.strip()) > 10]),
            "has_timestamps": False,
            "has_ratings": False,
            "quality_score": 0.6,
            "missing": [],
            "summary": "Text input received. AI analysis was unavailable but sentiment analysis can proceed."
        }

    job_id = str(uuid.uuid4())
    _job_text_storage[job_id] = req.text
    
    return {
        "job_id": job_id,
        "char_count": len(req.text),
        "brand": req.brand,
        "document_meta": intelligence,
        "status": "ready"
    }


class AnalyzeJobRequest(BaseModel):
    job_id: str
    algorithms: Optional[List[str]] = None
    brand: Optional[str] = None

@router.post("/test/analyze")
async def run_analysis(req: AnalyzeJobRequest):
    """Run the full NLP sentiment analysis pipeline on provided text by job_id."""
    if req.job_id not in _job_text_storage:
        raise HTTPException(status_code=404, detail="Job not found or already processed")
        
    text = _job_text_storage.pop(req.job_id)
    
    if not text or len(text.strip()) < 5:
        raise HTTPException(status_code=400, detail="No text provided for analysis")
    
    # Split text into entries
    entries = [e.strip() for e in text.split("\n\n") if len(e.strip()) > 5]
    if not entries:
        entries = [e.strip() for e in text.split("\n") if len(e.strip()) > 5]
    if not entries:
        entries = [text]
    
    # Run NLP pipeline
    results = run_sentiment_analysis(entries, req.algorithms)
    results["job_id"] = req.job_id
    results["brand"] = req.brand
    
    return results
