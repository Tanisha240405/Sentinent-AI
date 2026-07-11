import React from 'react';
import { motion } from 'framer-motion';

const ALGORITHMS = [
  { name: 'VADER', type: 'Lexicon-Based', acc: 85, tag: 'Best for social media slang' },
  { name: 'BERT', type: 'Transformer', acc: 92, tag: 'Context-aware, high accuracy' },
  { name: 'TextBlob', type: 'Rule-Based NLP', acc: 72, tag: 'Fast, lightweight baseline' },
  { name: 'RoBERTa', type: 'Transformer', acc: 95, tag: 'Fine-tuned on 58M tweets' },
  { name: 'Groq AI', type: 'LLM (Llama 3)', acc: 97, tag: 'Nuance, irony, and context' },
  { name: 'Ensemble', type: 'Weighted Blend', acc: 98, tag: 'Best of all models combined' },
];

export default function AlgorithmList() {
  return (
    <div className="space-y-4">
      {ALGORITHMS.map((algo, i) => (
        <motion.div 
          key={algo.name}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col md:flex-row md:items-center bg-surface rounded-xl p-4 md:p-6 border border-accent/20 shadow-sm"
        >
          <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <h4 className="text-xl font-display font-bold text-text-main">{algo.name}</h4>
            <span className="text-xs font-mono text-text-muted/70 uppercase">{algo.type}</span>
          </div>
          
          <div className="w-full md:w-2/4 px-0 md:px-8 mb-4 md:mb-0">
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span>Accuracy</span>
              <span className="font-mono text-text-main">{algo.acc}%</span>
            </div>
            <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${algo.acc}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                className="h-full bg-gradient-to-r from-patina to-sepia rounded-full"
              ></motion.div>
            </div>
          </div>
          
          <div className="w-full md:w-1/4 text-left md:text-right text-sm text-text-muted italic">
            {algo.tag}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
