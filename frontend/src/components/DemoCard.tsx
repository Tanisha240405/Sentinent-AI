import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoCard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<{ pos: number; neu: number; neg: number } | null>(null);
  const [query, setQuery] = useState('');

  const algorithms = ['VADER', 'BERT', 'TextBlob', 'Groq AI', 'RoBERTa', 'Ensemble'];
  const [activeAlgos, setActiveAlgos] = useState(['VADER', 'BERT', 'TextBlob', 'Groq AI']);

  const handleAnalyze = () => {
    if (!query) return;
    setAnalyzing(true);
    // Simulate network delay for now until backend is connected
    setTimeout(() => {
      const pos = Math.floor(Math.random() * 40) + 40; // 40-80
      const neg = Math.floor(Math.random() * 20); // 0-20
      const neu = 100 - pos - neg;
      setResults({ pos, neu, neg });
      setAnalyzing(false);
    }, 1500);
  };

  const toggleAlgo = (algo: string) => {
    setActiveAlgos(prev => 
      prev.includes(algo) ? prev.filter(a => a !== algo) : [...prev, algo]
    );
  };

  return (
    <div className="w-full">
      <div className="w-full bg-surface border border-accent/20 rounded-[32px] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-500">
        {/* Toolbar */}
        <div className="flex items-center px-6 py-4 bg-surface-alt border-b border-accent/20">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-negative/80"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#F0B7A4]/80"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-positive/80"></div>
          </div>
          <div className="mx-auto flex items-center justify-center bg-surface px-6 py-1.5 rounded-md border border-accent/30 shadow-sm">
            <span className="font-mono text-xs text-text-muted font-medium tracking-wider">sentientai.io/analyze</span>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Enter brand, product, or keyword..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="flex-1 bg-surface-alt border-2 border-accent/30 rounded-2xl px-6 py-5 text-text-main font-medium placeholder-text-muted/60 focus:outline-none focus:border-patina focus:shadow-md transition-all"
            />
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-10 py-5 bg-patina text-surface font-bold rounded-2xl hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 transition-transform shadow-md flex items-center justify-center min-w-[160px]"
            >
              {analyzing ? (
                <div className="w-6 h-6 border-4 border-canvas/30 border-t-canvas rounded-full animate-spin"></div>
              ) : 'Analyze Data'}
            </button>
          </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {algorithms.map(algo => (
            <button
              key={algo}
              onClick={() => toggleAlgo(algo)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeAlgos.includes(algo) 
                  ? 'bg-patina text-surface border-transparent shadow-md scale-105' 
                  : 'bg-transparent border-2 border-accent/30 text-text-muted hover:border-patina hover:text-patina'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="h-[180px] flex items-center justify-center bg-surface-alt rounded-[24px] border border-accent/20 overflow-hidden relative shadow-inner">
          <AnimatePresence mode="wait">
            {!results && !analyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-text-muted font-medium tracking-wide"
              >
                Waiting for input...
              </motion.div>
            )}
            
            {analyzing && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-patina font-bold tracking-widest uppercase animate-pulse flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-patina animate-ping"></div>
                Running NLP models...
              </motion.div>
            )}

            {results && !analyzing && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="w-full h-full flex p-8 gap-8"
              >
                <ResultBlock label="Positive" value={results.pos} color="text-patina" bgColor="bg-patina" />
                <ResultBlock label="Neutral" value={results.neu} color="text-text-muted" bgColor="bg-text-muted" />
                <ResultBlock label="Negative" value={results.neg} color="text-negative" bgColor="bg-negative" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  );
}

function ResultBlock({ label, value, color, bgColor }: { label: string; value: number; color: string; bgColor: string }) {
  const bars = Array.from({ length: 14 }, () => Math.random() * 80 + 20);
  
  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="flex justify-between items-end border-b border-accent/20 pb-2">
        <span className="text-text-muted font-bold uppercase tracking-widest text-xs">{label}</span>
        <span className={`text-4xl font-display font-bold ${color}`}>{value}%</span>
      </div>
      <div className="flex items-end gap-1.5 h-12 mt-4">
        {bars.map((h, i) => (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.6, delay: i * 0.04, type: "spring" }}
            className={`flex-1 rounded-sm opacity-80 ${bgColor}`}
          ></motion.div>
        ))}
      </div>
    </div>
  );
}
