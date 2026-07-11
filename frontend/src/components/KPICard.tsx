import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

export default function KPICard({ title, value, type, sub, brandName = "Brand" }: { title: string, value: string | number, type: 'score' | 'count' | 'emotion' | 'alert', sub?: string, brandName?: string }) {
  
  // Color logic
  let colorClass = 'text-text-main';
  if (type === 'score' && typeof value === 'number') {
    if (value > 0.55) colorClass = 'text-patina';
    else if (value > 0.35) colorClass = 'text-text-muted';
    else colorClass = 'text-negative';
  } else if (type === 'alert') {
    if (value === 'Normal') colorClass = 'text-patina';
    else if (value === 'Watch') colorClass = 'text-yellow-600';
    else colorClass = 'text-negative';
  } else if (type === 'emotion') {
    if (value === 'Joy' || value === 'Trust') colorClass = 'text-patina';
    else if (value === 'Anger' || value === 'Fear' || value === 'Disgust') colorClass = 'text-negative';
    else colorClass = 'text-text-muted';
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = document.getElementById('share-card');
    if (el) {
      el.style.display = 'flex';
      html2canvas(el, { scale: 1, useCORS: true, backgroundColor: null })
        .then(canvas => {
          el.style.display = 'none';
          const a = document.createElement('a');
          a.download = `sentientai-${brandName}-${Date.now()}.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        }).catch(err => {
          el.style.display = 'none';
          console.error("Export failed", err);
        });
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-text-muted text-sm font-medium">{title}</h3>
        {type === 'score' && (
          <button 
            onClick={handleShare}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-text-muted hover:text-patina hover:border-patina/30"
            title="Share Insight Card"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
          </button>
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className={`text-4xl font-display font-bold ${colorClass}`}>
          {type === 'score' && typeof value === 'number' && value > 0 ? '+' : ''}
          {value}
        </span>
        {type === 'alert' && value !== 'Normal' && (
          <span className="text-xl mb-1">⚠</span>
        )}
      </div>
      
      {sub && <p className="text-xs text-text-muted/60 mt-2 font-mono uppercase">{sub}</p>}

      {/* Hidden Share Card */}
      {type === 'score' && (
        <div 
          id="share-card" 
          style={{ 
            position: 'absolute', 
            top: '-9999px', 
            left: '-9999px', 
            width: '1200px', 
            height: '630px', 
            background: 'linear-gradient(135deg, #1E2035, #2D3153)',
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          <div style={{ position: 'absolute', top: '40px', left: '40px', fontSize: '36px', fontWeight: 700, color: '#879EC6' }}>
            SentientAI
          </div>
          
          <div style={{ fontSize: '72px', fontWeight: 800, color: '#F5F6E6', marginBottom: '20px' }}>
            {brandName}
          </div>
          
          <div style={{ 
            fontSize: '120px', 
            fontWeight: 800, 
            color: typeof value === 'number' && value > 0.5 ? '#6EE7B7' : typeof value === 'number' && value < 0 ? '#F87171' : '#EAB308',
            lineHeight: 1
          }}>
            {typeof value === 'number' && value > 0 ? '+' : ''}{value}
          </div>
          
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '24px', fontWeight: 500, color: '#879EC6', marginTop: '20px' }}>
            Overall Sentiment Score
          </div>

          <div style={{ position: 'absolute', bottom: '40px', left: '40px', background: 'rgba(135,158,198,0.1)', padding: '12px 24px', borderRadius: '30px', color: '#F5F6E6', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Dominant Emotion: <span style={{ fontWeight: 'bold' }}>Joy</span>
          </div>

          <div style={{ position: 'absolute', bottom: '40px', right: '40px', fontFamily: "'Inter', sans-serif", fontSize: '20px', color: '#879EC6', textAlign: 'right' }}>
            <div>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div style={{ marginTop: '8px' }}>sentientai.io</div>
          </div>
        </div>
      )}
    </div>
  );
}
