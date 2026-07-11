import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ViralityScore({ brandScale = 'enterprise' }: { brandScale?: 'enterprise' | 'micro' }) {
  const [score, setScore] = useState(0);
  const targetScore = brandScale === 'micro' ? 24 : 78;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.ceil((targetScore - current) / 10) || 1;
      if (current >= targetScore) {
        setScore(targetScore);
        clearInterval(interval);
      } else {
        setScore(current);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [targetScore]);

  const getColorClass = (val: number) => {
    if (val < 30) return 'text-patina';
    if (val <= 65) return 'text-yellow-500';
    return 'text-negative';
  };
  
  const getBorderClass = (val: number) => {
    if (val < 30) return 'border-t-patina';
    if (val <= 65) return 'border-t-yellow-500';
    return 'border-t-negative';
  };

  const colorClass = getColorClass(score);
  const borderClass = getBorderClass(score);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={`bg-surface rounded-2xl border border-accent/20 border-t-[3px] ${borderClass} p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
      title={brandScale === 'micro' ? "Local reach: 12% | Source: Word-of-mouth | Direct weight: 0.85" : "Velocity: 80% | Source spread: 3.6 sources | Negative weight: 0.64"}
    >
      <div>
        <h3 className="text-xs font-bold tracking-widest text-text-muted/70 uppercase">
          {brandScale === 'micro' ? 'Local Impact Risk' : 'Virality Risk'}
        </h3>
      </div>
      <div className="flex items-baseline mt-4">
        <span className={`text-4xl font-display font-bold ${colorClass}`}>
          {score}
        </span>
        <span className="text-xs text-text-muted/50 ml-1 font-mono">/100</span>
      </div>
    </motion.div>
  );
}
