# SentientAI 🧠 — Real-Time Brand Sentiment Monitor

SentientAI is a real-time brand monitoring and intelligence dashboard. It aggregates content across multiple web sources (including Reddit, Twitter/X, and News APIs) and runs them through a six-algorithm NLP sentiment analysis pipeline to deliver clear, actionable brand metrics and AI-driven insights in a single, high-fidelity user interface.

---

## 🚀 Core Features

* **Multi-Source Ingestion:** Scrapes Reddit, Twitter/X, and News outlets in parallel.
* **6-Algorithm NLP Engine:** Computes and compares sentiment scores side-by-side:
  * **VADER:** Lexicon-based model optimized for social media slang.
  * **BERT:** Transformer-based context-aware model.
  * **TextBlob:** Rule-based lightweight baseline.
  * **RoBERTa:** Fine-tuned Transformer model optimized for social media sentiment.
  * **Groq AI (Llama 3):** Handles complex nuance, irony, and conversational context.
  * **Ensemble:** A weighted blend of all models combined for maximum precision.
* **Live Emotion Diagnostics:** Uses the NRC emotion lexicon to map mentions into 8 core human emotions (Joy, Trust, Anticipation, Surprise, Fear, Anger, Sadness, Disgust).
* **AI-Generated Action Plans:** Groq LLM summarizes why sentiment shifted and generates concrete PR recommendation cards.
* **"Test Your Brand" File Upload:** Drop in customer reviews, survey exports, or PDFs (supporting CSV, Excel, PDF, TXT, DOCX, JSON). Evaluates data structure, flags missing fields, and runs the full sentiment pipeline.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Lucide Icons
* **Backend:** FastAPI (Python), Uvicorn
* **Data & Queues:** PostgreSQL, Redis, Celery (supports parallel web-scraping workers)
* **AI & NLP Engine:** HuggingFace Transformers, Groq Cloud API (`llama-3.1-70b`, `llama3-8b`)
* **Environment & Deployment:** Docker, Docker Compose

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Environment Variables
Create a `.env` file in the `backend/` directory and add your credentials:
```env
# AI Models
GROQ_API_KEY=your_groq_api_key

# Web Scraping Keys (Optional)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
NEWS_API_KEY=your_news_api_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Infrastructure Configs
DATABASE_URL=postgresql://postgres:postgres@db:5432/sentientai
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your_jwt_signing_key
```

### Launching the Stack
Run the following command at the root of the project to build and spin up the frontend, backend, database, queue, and cache services:
```bash
docker-compose up --build
```

The services will be available at:
* **Frontend:** `http://localhost:5173`
* **FastAPI Backend (API Docs):** `http://localhost:8000/docs`

---

## 📂 Repository Structure

```
├── backend/
│   ├── app/
│   │   ├── api/            # API Router endpoints (chat, test upload)
│   │   ├── core/           # Celery configurations
│   │   ├── models/         # Database models
│   │   └── services/       # NLP analysis pipeline, web scrapers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Visual charts, feed, command palette, chatbot
│   │   ├── pages/          # Dashboard & Landing page
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```
