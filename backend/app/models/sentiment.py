from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class SentimentResult(Base):
    __tablename__ = "sentiment_results"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    overall_score = Column(Float)
    mentions_count = Column(Integer)
    dominant_emotion = Column(String)
    sources_breakdown = Column(JSON)
    emotions_breakdown = Column(JSON)
    algorithms_scores = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
