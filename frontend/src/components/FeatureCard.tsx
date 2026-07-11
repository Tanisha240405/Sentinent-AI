import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, LineChart, Zap, Bell, Map } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  'Multi-Source Scraping': <Activity className="w-6 h-6 text-surface" />,
  '6 NLP Algorithms': <Cpu className="w-6 h-6 text-surface" />,
  'Live Emotion Graphs': <LineChart className="w-6 h-6 text-surface" />,
  'Groq AI Insights': <Zap className="w-6 h-6 text-surface" />,
  'Trend Alerts': <Bell className="w-6 h-6 text-surface" />,
  'Geo & Source Map': <Map className="w-6 h-6 text-surface" />,
};

export default function FeatureCard({ title, desc, delay = 0 }: { title: string; desc: string; delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-surface border border-accent/20 rounded-[24px] p-8 shadow-sm transition-all hover:shadow-lg hover:border-patina/50 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-text-main flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110 group-hover:bg-patina group-hover:rotate-3 duration-300">
        {ICONS[title]}
      </div>
      <h3 className="text-2xl font-display font-bold text-text-main mb-4">{title}</h3>
      <p className="text-text-muted text-base leading-relaxed">{desc}</p>
    </motion.div>
  );
}
