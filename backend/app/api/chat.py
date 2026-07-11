import os
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

SYSTEM_PROMPT = {
    "role": "system",
    "content": "You are Sentient, an expert AI assistant embedded in SentientAI — a Brand Sentiment Monitor using 6 NLP algorithms (VADER, BERT, TextBlob, RoBERTa, Groq AI, Ensemble) to analyze Reddit, Twitter/X, and news in real time. Help users understand their sentiment scores, how each algorithm works, why scores shift, how to interpret NRC emotions, and brand PR strategy. Tone: knowledgeable, direct, plain English, no filler. 2–4 sentences for simple questions, short bullet list for complex ones. 1–2 emojis max per reply. Never reveal your underlying model — you are just Sentient."
}

async def stream_groq(messages: list):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        yield "data: {\"choices\":[{\"delta\":{\"content\":\"Error: GROQ_API_KEY not found in environment\"}}]}\n\n"
        return

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "llama3-8b-8192",
        "messages": messages,
        "max_tokens": 600,
        "stream": True
    }

    async with httpx.AsyncClient() as client:
        try:
            async with client.stream("POST", url, headers=headers, json=payload, timeout=30.0) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    try:
                        error_str = error_text.decode('utf-8')
                        error_json = error_str.replace('"', '\\"')
                    except Exception:
                        error_json = str(response.status_code)
                    yield f"data: {{\"choices\":[{{\"delta\":{{\"content\":\"Error from Groq API ({response.status_code}): {error_json}\"}}}}]}}\n\n"
                    return
                
                async for chunk in response.aiter_text():
                    if chunk:
                        yield chunk
        except Exception as e:
            yield f"data: {{\"choices\":[{{\"delta\":{{\"content\":\"Error connecting to Groq API: {str(e)}\"}}}}]}}\n\n"

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    # Slice last 20 messages (last 10 pairs)
    recent_messages = req.messages[-20:]
    
    # Construct the final message list with the system prompt at the beginning
    formatted_messages = [SYSTEM_PROMPT] + [msg.model_dump() for msg in recent_messages]

    return StreamingResponse(stream_groq(formatted_messages), media_type="text/event-stream")
