import os
import requests
from newsapi import NewsApiClient

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def fetch_hackernews(query: str):
    # Search HN via Algolia API (public, no auth needed)
    try:
        url = f"https://hn.algolia.com/api/v1/search?query={query}&tags=story&hitsPerPage=10"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        results = []
        for hit in data.get('hits', []):
            text = hit.get('title', '')
            if text:
                results.append({"source": "HackerNews", "text": text})
        return results
    except Exception as e:
        print(f"HN Scrape Error: {e}")
        return []

def fetch_reddit_anonymous(query: str):
    # Fetch reddit posts anonymously using the json endpoint
    try:
        # Use a custom user agent to avoid basic blocks
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        url = f"https://www.reddit.com/search.json?q={query}&sort=new&limit=10"
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        results = []
        for child in data.get('data', {}).get('children', []):
            post = child.get('data', {})
            text = post.get('title', '') + " " + post.get('selftext', '')
            if text.strip():
                results.append({"source": "Reddit", "text": text[:500]}) # truncate long posts
        return results
    except Exception as e:
        print(f"Reddit Scrape Error: {e}")
        return []

def fetch_newsapi(query: str):
    if not NEWS_API_KEY:
        return []
    try:
        newsapi = NewsApiClient(api_key=NEWS_API_KEY)
        all_articles = newsapi.get_everything(q=query, sort_by='publishedAt', language='en', page_size=10)
        results = []
        for article in all_articles.get('articles', []):
            text = article.get('title', '') + " - " + str(article.get('description', ''))
            results.append({"source": "News", "text": text})
        return results
    except Exception as e:
        print(f"NewsAPI Scrape Error: {e}")
        return []

def gather_all_mentions(query: str):
    mentions = []
    mentions.extend(fetch_hackernews(query))
    mentions.extend(fetch_reddit_anonymous(query))
    mentions.extend(fetch_newsapi(query))
    return mentions
