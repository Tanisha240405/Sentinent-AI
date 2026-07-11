import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MENTIONS = [
  { 
    id: 1, source: 'Reddit', text: 'The new update completely bricked my device. Very disappointed with the QA process here.', score: -0.84, time: '2m ago',
    algorithmScores: { VADER: -0.6, BERT: -0.9, TextBlob: -0.5, RoBERTa: -0.95, Groq: -0.85 }
  },
  { 
    id: 2, source: 'Twitter', text: 'Absolutely loving the new features in the latest release! Huge step forward.', score: 0.92, time: '5m ago',
    algorithmScores: { VADER: 0.8, BERT: 0.95, TextBlob: 0.7, RoBERTa: 0.98, Groq: 0.9 }
  },
  { 
    id: 3, source: 'News', text: 'Company announces record profits for Q3, exceeding all analyst expectations.', score: 0.65, time: '12m ago',
    algorithmScores: { VADER: 0.3, BERT: 0.7, TextBlob: 0.2, RoBERTa: 0.8, Groq: 0.65 }
  },
  { 
    id: 4, source: 'Reddit', text: 'Does anyone know how to fix the battery drain issue since yesterday?', score: -0.45, time: '15m ago',
    algorithmScores: { VADER: -0.2, BERT: -0.6, TextBlob: 0.0, RoBERTa: -0.5, Groq: -0.4 }
  },
  { 
    id: 5, source: 'HackerNews', text: 'The architecture choices in their open source release are quite interesting.', score: 0.12, time: '22m ago',
    algorithmScores: { VADER: 0.5, BERT: 0.1, TextBlob: 0.4, RoBERTa: 0.0, Groq: 0.2 } // High diff -> Conflicted
  },
  { 
    id: 6, source: 'Twitter', text: 'Customer support has been ignoring my tickets for 3 days now. Unacceptable.', score: -0.91, time: '28m ago',
    algorithmScores: { VADER: -0.7, BERT: -0.9, TextBlob: -0.8, RoBERTa: -0.95, Groq: -0.9 }
  },
];

function MentionRow({ mention }: { mention: any }) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const scores = Object.values(mention.algorithmScores) as number[];
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const isConflicted = (maxScore - minScore) > 0.4;

  const handleExpand = async () => {
    const willExpand = !expanded;
    setExpanded(willExpand);
    
    if (willExpand && !explanation) {
      setLoading(true);
      try {
        const payload = {
          messages: [{
            role: "user",
            content: `In one sentence, why might VADER score this as ${mention.algorithmScores.VADER} but RoBERTa score it as ${mention.algorithmScores.RoBERTa}? The text is: "${mention.text}"`
          }]
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
        setExplanation("Error fetching explanation from Groq.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-surface-alt border border-accent/20 rounded-xl hover:bg-accent/10 transition-colors shadow-sm overflow-hidden">
      <div 
        className={`p-3 flex items-start gap-3 cursor-pointer ${isConflicted ? 'border-l-2 border-l-yellow-500' : ''}`}
        onClick={handleExpand}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              mention.source === 'Reddit' ? 'bg-[#FF4500]/20 text-[#FF4500]' : 
              mention.source === 'Twitter' ? 'bg-[#1DA1F2]/20 text-[#1DA1F2]' : 
              mention.source === 'News' ? 'bg-purple-500/20 text-purple-400' : 
              'bg-orange-500/20 text-orange-400'
            }`}>
              {mention.source}
            </span>
            <span className="text-xs text-text-muted">{mention.time}</span>
            {isConflicted && (
              <span className="bg-yellow-500/12 border border-yellow-500/30 text-yellow-500 font-body text-[10px] font-semibold rounded px-1.5 py-0.5">
                ⚠ Conflicted
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted/90 truncate">{mention.text}</p>
        </div>
        <div className={`font-mono text-sm font-bold flex-shrink-0 ${
          mention.score > 0.5 ? 'text-patina' : mention.score < 0 ? 'text-negative' : 'text-text-muted'
        }`}>
          {mention.score > 0 ? '+' : ''}{mention.score}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-accent/10 px-4 py-3 bg-surface"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-text-main">Algorithm Breakdown</h4>
              <button onClick={(e) => { e.stopPropagation(); setExpanded(false); }} className="text-text-muted hover:text-text-main">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
              {Object.entries(mention.algorithmScores).map(([algo, score]: [string, any]) => (
                <div key={algo} className="flex items-center gap-2 text-xs">
                  <span className="w-16 text-text-muted">{algo}</span>
                  <div className="flex-1 h-1.5 bg-accent/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${score > 0 ? 'bg-patina' : score < 0 ? 'bg-negative' : 'bg-text-muted'}`}
                      style={{ 
                        width: `${Math.abs(score) * 50}%`,
                        marginLeft: score > 0 ? '50%' : `${50 - (Math.abs(score) * 50)}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-text-main">
                    {score > 0 ? '+' : ''}{score}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-surface-alt rounded p-3 text-sm text-text-main/90 border border-accent/20">
              <span className="font-semibold text-patina mr-2">Groq AI:</span>
              {loading ? (
                <span className="inline-flex items-center text-text-muted text-xs gap-1.5">
                  <span className="w-3 h-3 border-2 border-accent/30 border-t-patina rounded-full animate-spin"></span>
                  Analyzing discrepancy...
                </span>
              ) : (
                explanation
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LiveMentionFeed() {
  return (
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3 mt-2">
      {MENTIONS.map((mention) => (
        <MentionRow key={mention.id} mention={mention} />
      ))}
    </div>
  );
}
