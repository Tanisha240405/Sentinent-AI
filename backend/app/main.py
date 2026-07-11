from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.api.chat import router as chat_router
from app.api.test import router as test_router, run_sentiment_analysis
from app.services.scraper import gather_all_mentions

app = FastAPI(title="SentientAI Backend", version="1.0.0")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(test_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "live": True}

@app.post("/api/analyze")
async def analyze_brand(payload: dict):
    brand = payload.get("brand", "Apple")
    algorithms = payload.get("algorithms")
    
    # Trigger real-time scraper
    mentions = gather_all_mentions(brand)
    
    if not mentions:
        # Fallback dataset if no real-time mentions found
        return {
            "overall_score": 0.35,
            "entries_analyzed": 0,
            "positive": 1,
            "negative": 0,
            "neutral": 1,
            "dominant_emotion": "Trust",
            "alert_level": "Normal",
            "emotions": {"Joy": 2, "Surprise": 1, "Anticipation": 3, "Trust": 5, "Anger": 0, "Fear": 0, "Sadness": 0, "Disgust": 0},
            "algorithm_scores": {
                "Ensemble": 0.35,
                "VADER": 0.38,
                "BERT": 0.32,
                "TextBlob": 0.40,
                "RoBERTa": 0.28,
                "Groq AI": 0.36,
            },
            "sample_results": [
                {
                    "text": f"Discussing latest updates regarding {brand} products.",
                    "scores": {"Ensemble": 0.35, "VADER": 0.38, "BERT": 0.32, "TextBlob": 0.40, "RoBERTa": 0.28, "Groq AI": 0.36},
                    "ensemble": 0.35,
                    "source": "Web",
                    "time": "Just now"
                }
            ]
        }

    texts = [m["text"] for m in mentions]
    results = run_sentiment_analysis(texts, algorithms)
    
    # Map sources and timestamps back to results
    sample_results = results.get("sample_results", [])
    for i, sample in enumerate(sample_results):
        if i < len(mentions):
            sample["source"] = mentions[i]["source"]
            sample["time"] = "Just now"
            
    return results

@app.get("/api/history")
async def get_history():
    return {
        "history": [
            {"name": "Apple", "score": 0.82},
            {"name": "Tesla", "score": -0.31},
            {"name": "Nike", "score": 0.65},
            {"name": "OpenAI", "score": 0.91},
            {"name": "Google", "score": 0.42},
        ]
    }

@app.websocket("/ws/results/{job_id}")
async def websocket_results(websocket: WebSocket, job_id: str):
    await websocket.accept()
    # Mock stream for now
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except Exception:
        pass
