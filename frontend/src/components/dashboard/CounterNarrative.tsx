import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CounterNarrative({ activeBrand, brandScale = 'enterprise' }: { activeBrand: string, brandScale?: 'enterprise' | 'micro' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [points, setPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fire if the flag isn't set
    const flagKey = `dismissed-cn-${activeBrand}-${new Date().toISOString().slice(0,10)}`;
    if (sessionStorage.getItem(flagKey)) {
      setIsVisible(false);
      return;
    }

    setIsVisible(false);
    setLoading(true);

    // Simulate detection of sustained negative sentiment
    const timer = setTimeout(() => {
      // Mocking that Tesla has high negative sentiment
      if (activeBrand === 'Tesla' || activeBrand === 'Google') {
        setIsVisible(true);
        fetchNarrative();
      }
    }, 4500);
    
    return () => clearTimeout(timer);
  }, [activeBrand, brandScale]);

  const fetchNarrative = async () => {
    try {
      const isMicro = brandScale === 'micro';
      const promptText = isMicro
        ? `The brand ${activeBrand} is a small local business/niche startup. It has had negative sentiment or client complaints recently. Write exactly 3 short, localized customer service tactics or relationship actions (one sentence each, numbered 1–3) that the owner could take to address the complaints directly. Be specific and highly practical (e.g. personal follow-up calls, localized credits, scheduling improvements), not corporate PR talk.`
        : `The brand ${activeBrand} has had negative sentiment above 0.6 for 4+ hours. Write exactly 3 short PR talking points (one sentence each, numbered 1–3) that the brand's communications team could use to shift public perception. Be specific and practical, not generic.`;

      const payload = {
        messages: [
          {
            role: "user",
            content: promptText
          }
        ]
      };

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.body) throw new Error("No stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let text = '';
      setLoading(false);

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
              if (data.choices?.[0]?.delta?.content) {
                text += data.choices[0].delta.content;
                // Parse points
                const parsedPoints = text.split('\n')
                                      .filter(p => p.trim().match(/^[1-3]\./))
                                      .map(p => p.replace(/^[1-3]\.\s*/, '').trim());
                if (parsedPoints.length > 0) {
                  setPoints(parsedPoints);
                } else if (text.length > 20) {
                  // Fallback if not nicely numbered yet
                  setPoints([text]);
                }
              }
            } catch(e) {}
          }
        }
      }
    } catch (e) {
      console.error(e);
      setPoints(["Could not generate talking points at this time."]);
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    const flagKey = `dismissed-cn-${activeBrand}-${new Date().toISOString().slice(0,10)}`;
    sessionStorage.setItem(flagKey, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed right-0 top-1/2 -translate-y-1/2 w-80 bg-canvas border-l border-y border-accent/20 rounded-l-2xl p-5 shadow-2xl z-50"
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-display font-semibold text-text-main flex items-center gap-2">
              <span className="text-xl">🛡️</span> Counter-Narrative
            </h3>
            <button 
              onClick={handleDismiss}
              className="text-text-muted hover:text-text-main"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <p className="text-[11px] text-text-muted italic mb-4">Groq AI suggestions · not financial advice</p>

          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-text-muted p-4">
                <span className="w-4 h-4 border-2 border-accent/30 border-t-patina rounded-full animate-spin"></span>
                Generating PR strategies...
              </div>
            ) : (
              points.map((point, i) => (
                <div key={i} className="bg-surface-alt border border-accent/15 rounded-lg p-3 text-sm text-text-main/90 leading-snug">
                  <span className="font-bold text-patina mr-1.5">{i + 1}.</span> 
                  {point}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
