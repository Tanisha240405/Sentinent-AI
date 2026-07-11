import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, ResponsiveContainer } from 'recharts';

export default function SentimentFingerprint({ activeBrand }: { activeBrand: string }) {
  const [radarData, setRadarData] = useState<any[]>([]);

  useEffect(() => {
    // Mock emotion data for the active brand
    const todayData = [
      { emotion: 'Joy', val: activeBrand === 'Apple' ? 0.8 : 0.4 },
      { emotion: 'Trust', val: activeBrand === 'Apple' ? 0.7 : 0.3 },
      { emotion: 'Fear', val: activeBrand === 'Tesla' ? 0.6 : 0.2 },
      { emotion: 'Surprise', val: 0.5 },
      { emotion: 'Sadness', val: activeBrand === 'Tesla' ? 0.7 : 0.1 },
      { emotion: 'Disgust', val: activeBrand === 'Tesla' ? 0.5 : 0.1 },
      { emotion: 'Anger', val: activeBrand === 'Tesla' ? 0.8 : 0.2 },
      { emotion: 'Anticipation', val: 0.6 },
    ];

    // Read or init rolling average
    const key = `sentiment-avg-${activeBrand}`;
    let avgData = JSON.parse(localStorage.getItem(key) || 'null');
    
    if (!avgData) {
      avgData = todayData.map(d => ({ emotion: d.emotion, val: Math.max(0, d.val + (Math.random() * 0.4 - 0.2)) }));
      localStorage.setItem(key, JSON.stringify(avgData));
    }

    const merged = todayData.map((d, i) => ({
      emotion: d.emotion,
      today: d.val,
      avg: avgData[i].val
    }));

    setRadarData(merged);
  }, [activeBrand]);

  return (
    <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm h-[400px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-display font-bold text-text-main">Sentiment Fingerprint</h3>
        <p className="text-xs text-text-muted">Today vs 30-day average</p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(44, 108, 115, 0.15)" />
            <PolarAngleAxis dataKey="emotion" tick={{ fill: '#745D3B', fontSize: 11 }} />
            <Radar 
              name="Today" 
              dataKey="today" 
              stroke="#2C6C73" 
              fill="#2C6C73" 
              fillOpacity={0.15} 
              strokeWidth={2} 
            />
            <Radar 
              name="30d avg" 
              dataKey="avg" 
              stroke="#CAA287" 
              fill="none" 
              strokeWidth={1.5} 
              strokeDasharray="4 3" 
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#745D3B', paddingTop: '10px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
