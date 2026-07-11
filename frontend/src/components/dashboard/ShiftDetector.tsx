import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShiftDetector({ activeBrand, brandScale = 'enterprise' }: { activeBrand: string, brandScale?: 'enterprise' | 'micro' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock a shift detection for demo purposes 
  useEffect(() => {
    setIsVisible(false);
    setLoading(true);
    
    // Simulate detecting a shift after 3 seconds of viewing a brand
    const timer = setTimeout(() => {
      setIsVisible(true);
      fetchExplanation();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [activeBrand, brandScale]);

  const fetchExplanation = async () => {
    try {
      const isMicro = brandScale === 'micro';
      const promptText = isMicro
        ? `The sentiment score for ${activeBrand} (which is a local micro-brand/small family startup) just shifted from 0.82 to 0.64. In 2–3 sentences, explain in plain English why this likely happened based on these top posts: "We ordered catering but they arrived 45 mins late and forgot the napkins." | "The owner was super friendly but the store layout is tiny." | "Called them twice during open hours but no one answered." Be specific and focus on local business context.`
        : `The sentiment score for ${activeBrand} just shifted from 0.82 to 0.64. In 2–3 sentences, explain in plain English why this likely happened based on these top posts: "The new update completely bricked my device." | "Customer support has been ignoring my tickets." | "Does anyone know how to fix the battery drain issue since yesterday?". Be specific.`;

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
                setExplanation(text);
              }
            } catch(e) {}
          }
        }
      }
    } catch (e) {
      console.error(e);
      setExplanation("Could not fetch explanation at this time.");
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-surface rounded-xl border border-accent/20 border-l-[3px] border-l-yellow-500 p-4 mb-6 shadow-sm relative"
        >
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-text-muted hover:text-text-main"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display font-semibold text-text-main flex items-center gap-2">
              <span className="text-yellow-500">⚡</span> Shift Detected
            </h3>
            <span className="bg-negative/10 text-negative text-xs font-bold px-2 py-0.5 rounded border border-negative/20">
              -0.18
            </span>
          </div>

          <div className="text-sm text-text-main/90 font-body mb-4 min-h-[40px]">
            {loading ? (
              <span className="flex items-center gap-2 text-text-muted">
                <span className="w-3 h-3 border-2 border-accent/30 border-t-patina rounded-full animate-spin"></span>
                Groq AI is analyzing the shift...
              </span>
            ) : (
              explanation
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {brandScale === 'micro' ? (
              <>
                <div className="bg-surface-alt border border-accent/20 rounded-full px-3 py-1 text-[10px] text-text-muted/80 truncate max-w-[200px]" title="We ordered catering but they arrived 45 mins late and forgot the napkins.">
                  "arrived 45 mins late and forgot napkins"
                </div>
                <div className="bg-surface-alt border border-accent/20 rounded-full px-3 py-1 text-[10px] text-text-muted/80 truncate max-w-[200px]" title="The owner was super friendly but the store layout is tiny.">
                  "friendly owner, but store layout is tiny"
                </div>
                <div className="bg-surface-alt border border-accent/20 rounded-full px-3 py-1 text-[10px] text-text-muted/80 truncate max-w-[200px]" title="Called them twice during open hours but no one answered.">
                  "called twice during open hours, no answer"
                </div>
              </>
            ) : (
              <>
                <div className="bg-surface-alt border border-accent/20 rounded-full px-3 py-1 text-[10px] text-text-muted/80 truncate max-w-[200px]">
                  "The new update completely bricked my device."
                </div>
                <div className="bg-surface-alt border border-accent/20 rounded-full px-3 py-1 text-[10px] text-text-muted/80 truncate max-w-[200px]">
                  "Customer support has been ignoring my tickets."
                </div>
                <div className="bg-surface-alt border border-accent/20 rounded-full px-3 py-1 text-[10px] text-text-muted/80 truncate max-w-[200px]">
                  "fix the battery drain issue since yesterday"
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
