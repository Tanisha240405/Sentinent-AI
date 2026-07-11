import React from 'react';
import { motion } from 'framer-motion';

const EMOTIONS = [
  { name: 'Joy', value: 35, color: 'bg-patina' },
  { name: 'Anticipation', value: 25, color: 'bg-patina' },
  { name: 'Trust', value: 20, color: 'bg-teal' },
  { name: 'Surprise', value: 10, color: 'bg-teal' },
  { name: 'Anger', value: 5, color: 'bg-negative' },
  { name: 'Sadness', value: 3, color: 'bg-negative' },
  { name: 'Disgust', value: 1, color: 'bg-negative' },
  { name: 'Fear', value: 1, color: 'bg-negative' },
];

export default function EmotionBarChart() {
  return (
    <div className="space-y-3 mt-4">
      {EMOTIONS.map((emotion, i) => (
        <div key={emotion.name} className="flex items-center text-sm">
          <div className="w-24 text-text-muted">{emotion.name}</div>
          <div className="flex-1 h-2 bg-accent/20 rounded-full overflow-hidden mx-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${emotion.value}%` }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
              className={`h-full ${emotion.color} rounded-full opacity-80`}
            ></motion.div>
          </div>
          <div className="w-8 text-right font-mono text-xs text-text-muted/60">{emotion.value}%</div>
        </div>
      ))}
    </div>
  );
}
