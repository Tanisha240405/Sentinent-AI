import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from groq import Groq

# Initialize VADER
analyzer = SentimentIntensityAnalyzer()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def score_vader(text: str) -> float:
    # Returns compound score between -1 and 1
    scores = analyzer.polarity_scores(text)
    return scores['compound']

def score_textblob(text: str) -> float:
    # Returns polarity between -1 and 1
    blob = TextBlob(text)
    return blob.sentiment.polarity

def compute_ensemble(text: str) -> dict:
    v = score_vader(text)
    t = score_textblob(text)
    
    # We'll skip HuggingFace for this lightweight real-time demo to save memory,
    # and substitute its weight into VADER and TextBlob.
    ensemble = (v * 0.6) + (t * 0.4)
    
    return {
        "score": ensemble,
        "VADER": v,
        "TextBlob": t
    }

def generate_groq_insights(brand: str, mentions: list) -> str:
    if not GROQ_API_KEY or not mentions:
        return f"Insufficient data or API key to generate insights for {brand}."
    
    client = Groq(api_key=GROQ_API_KEY)
    
    # Combine some mentions to give context to the LLM
    context_texts = [m['text'] for m in mentions[:10]]
    context_str = "\n- ".join(context_texts)
    
    prompt = f"""
    You are an expert brand analyst. Analyze the following recent mentions about '{brand}'.
    Provide a very concise, 2-sentence summary of the current public sentiment, key driving factors, and what competitors might be doing.
    
    Recent Mentions:
    - {context_str}
    
    Return ONLY the 2-sentence summary.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.3,
            max_tokens=150
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        return "Failed to connect to AI Insight engine."
