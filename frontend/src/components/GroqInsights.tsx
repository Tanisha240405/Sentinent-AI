import React from 'react';

export default function GroqInsights({ brand }: { brand: string }) {
  const isNegative = brand === 'Tesla' || brand === 'Meta';
  
  return (
    <div className="space-y-4 mt-2">
      <div className="bg-surface-alt border border-accent/20 rounded-xl p-4 relative">
        <div className="absolute -top-2 -left-2 bg-surface border border-accent/30 text-[10px] font-bold tracking-widest text-patina px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
          <span className="text-yellow-500">⚡</span> Groq AI
        </div>
        <p className="text-sm text-text-muted mt-2">
          {isNegative 
            ? `Sentiment for ${brand} has declined by 12% in the last 6 hours, primarily driven by customer complaints regarding the recent software update bugs on Reddit.`
            : `Recent announcements have driven a positive spike for ${brand}. Sentiment is up 8% today, with Twitter/X users praising the new feature rollout.`}
        </p>
        <div className="flex gap-2 mt-3">
          <span className="text-[10px] bg-accent/20 text-text-muted px-2 py-1 rounded">product launch</span>
          <span className="text-[10px] bg-accent/20 text-text-muted px-2 py-1 rounded">user feedback</span>
        </div>
      </div>
      
      <div className="bg-surface-alt border border-accent/20 rounded-xl p-4 relative">
        <p className="text-sm text-text-muted">
          {isNegative
            ? `Competitor comparison indicates users are actively suggesting alternatives in 15% of negative mentions.`
            : `Brand loyalty remains strong. 42% of positive mentions contain strong advocacy keywords compared to industry baseline of 28%.`}
        </p>
        <div className="flex gap-2 mt-3">
          <span className="text-[10px] bg-accent/20 text-text-muted px-2 py-1 rounded">competitor gap</span>
          <span className="text-[10px] bg-accent/20 text-text-muted px-2 py-1 rounded">advocacy</span>
        </div>
      </div>
    </div>
  );
}
