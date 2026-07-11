import React, { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const [history, setHistory] = useState<Message[]>([]);
  const [currentStream, setCurrentStream] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SUGGESTIONS = [
    { label: "Score 0.72 — what's that?", query: "What does a sentiment score of 0.72 mean?" },
    { label: "BERT vs VADER?", query: "How does BERT differ from VADER?" },
    { label: "Sudden score drop?", query: "Why might a brand's sentiment suddenly drop?" },
    { label: "Ensemble explained", query: "What is the Ensemble model and why is it most accurate?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, currentStream, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!hasOpened) setHasOpened(true);
  };

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = '40px';
      el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (overrideQuery?: string) => {
    const query = overrideQuery || inputValue.trim();
    if (!query || isStreaming) return;

    const newUserMsg: Message = { role: 'user', content: query };
    const newHistory = [...history, newUserMsg];
    
    setHistory(newHistory);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
    
    setIsStreaming(true);
    setCurrentStream('');

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory.slice(-20) })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                const token = data.choices[0].delta.content;
                fullText += token;
                setCurrentStream(prev => prev + token);
              }
            } catch (e) {
              // Ignore parse errors from partial chunks
            }
          }
        }
      }

      setHistory(prev => [...prev, { role: 'assistant', content: fullText }]);
      setCurrentStream('');
    } catch (error) {
      console.error('Chat error:', error);
      setHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to my neural core. Please try again." }]);
      setCurrentStream('');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="sentient-chatbot-container">
      {/* Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-left">
            <div className="avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="3" fill="#F5F6E6"/>
                <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.92893 4.92893L7.75736 7.75736M16.2426 16.2426L19.0711 19.0711M4.92893 19.0711L7.75736 16.2426M16.2426 7.75736L19.0711 4.92893" stroke="#F5F6E6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="title-group">
              <span className="bot-name">Sentient</span>
              <div className="status-row">
                <div className="live-dot"></div>
                LIVE · Groq AI
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={() => setIsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button className="header-btn" onClick={() => setIsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          <div className="message-wrapper bot" style={{ animationDelay: '350ms' }}>
            <div className="message-bubble">
              Hey 👋 I'm Sentient, your AI assistant.<br/><br/>
              How can I help you today?<br/><br/>
              You can ask me things like:<br/>
              • What does this sentiment score mean?<br/>
              • How does BERT compare to VADER?<br/>
              • Why is my brand score dropping?<br/>
              • What is the Ensemble model?
            </div>
            <span className="timestamp">Just now</span>
          </div>

          {history.length === 0 && (
            <div className="suggestions">
              {SUGGESTIONS.map((sug, i) => (
                <button 
                  key={i} 
                  className="suggestion-chip"
                  onClick={() => handleSend(sug.query)}
                >
                  {sug.label}
                </button>
              ))}
            </div>
          )}

          {history.map((msg, idx) => (
            <div key={idx} className={`message-wrapper ${msg.role}`}>
              <div className="message-bubble">{msg.content}</div>
              <span className="timestamp">Just now</span>
            </div>
          ))}

          {isStreaming && (
            <div className="message-wrapper bot">
              {currentStream ? (
                <div className="message-bubble">{currentStream}</div>
              ) : (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask anything about sentiment…"
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
          />
          <button 
            className="send-btn" 
            onClick={() => handleSend()} 
            disabled={isStreaming || !inputValue.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>

      {/* Trigger */}
      <button className="chatbot-trigger" onClick={handleOpen}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" fill="#F5F6E6"/>
          <path d="M12 2V6M12 18V22M2 12H6M18 12H22M4.92893 4.92893L7.75736 7.75736M16.2426 16.2426L19.0711 19.0711M4.92893 19.0711L7.75736 16.2426M16.2426 7.75736L19.0711 4.92893" stroke="#F5F6E6" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        {!hasOpened && <div className="unread-dot"></div>}
      </button>
    </div>
  );
}
