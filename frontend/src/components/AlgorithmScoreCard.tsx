import React from 'react';

export default function AlgorithmScoreCard({ name, type, score, pos, neu, neg, active }: { name: string, type: string, score: number, pos: number, neu: number, neg: number, active: boolean }) {
  
  let colorClass = 'text-text-main';
  let gradientClass = 'from-patina to-sepia';
  
  if (score > 0.55) {
    colorClass = 'text-patina';
    gradientClass = 'from-patina/70 to-patina';
  } else if (score < 0.35) {
    colorClass = 'text-negative';
    gradientClass = 'from-negative/70 to-negative';
  }

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${active ? 'bg-surface-alt border-accent/40 shadow-md scale-[1.02]' : 'bg-surface border-accent/20 hover:border-accent/40'}`}>
      <span className="text-[10px] font-mono font-bold tracking-widest text-text-muted uppercase">{type}</span>
      <h4 className="text-xl font-display font-bold text-text-main mt-1 mb-3">{name}</h4>
      
      <div className="flex items-end justify-between mb-2">
        <span className={`text-2xl font-bold font-mono ${colorClass}`}>{score}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-accent/20 rounded-full overflow-hidden mb-4 relative">
        <div 
          className={`h-full bg-gradient-to-r ${gradientClass} rounded-full`}
          style={{ width: `${score * 100}%` }}
        ></div>
      </div>

      {/* Breakdown Chips */}
      <div className="flex gap-2 text-[10px] font-mono">
        <div className="flex-1 bg-teal-50 text-teal-600 py-1 px-2 rounded flex justify-between border border-teal-200">
          <span>POS</span><span>{pos}%</span>
        </div>
        <div className="flex-1 bg-surface-alt text-text-muted py-1 px-2 rounded flex justify-between border border-accent/30">
          <span>NEU</span><span>{neu}%</span>
        </div>
        <div className="flex-1 bg-red-50 text-red-600 py-1 px-2 rounded flex justify-between border border-red-200">
          <span>NEG</span><span>{neg}%</span>
        </div>
      </div>
    </div>
  );
}
