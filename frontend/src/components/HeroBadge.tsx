import React from 'react';
import { motion } from 'framer-motion';

export default function HeroBadge() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-steel-blue/10 border border-steel-blue/20 backdrop-blur-sm"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-positive shadow-[0_0_8px_rgba(110,231,183,0.8)]"></div>
      <span className="text-[11px] font-bold tracking-widest text-steel-blue uppercase">
        Powered by BERT · VADER · Groq AI
      </span>
    </motion.div>
  );
}
