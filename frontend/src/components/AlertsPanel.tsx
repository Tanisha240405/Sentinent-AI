import React, { useState } from 'react';
import { Bell, Plus, AlertTriangle, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const springAnim: any = { delay: 0.1, type: "spring", stiffness: 100, damping: 20 };

export default function AlertsPanel({ activeBrand }: { activeBrand: string }) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'drop', brand: activeBrand, message: `Sentiment dropped by 15% in the last 2 hours.`, time: '10 mins ago', severity: 'high' },
    { id: 2, type: 'spike', brand: 'OpenAI', message: `Mention volume spiked 300% on HackerNews.`, time: '2 hours ago', severity: 'medium' },
    { id: 3, type: 'emotion', brand: activeBrand, message: `"Anger" emotion metric exceeded threshold of 20%.`, time: 'Yesterday', severity: 'low' }
  ]);

  const [rules, setRules] = useState([
    { id: 1, name: 'Sentiment Freefall', condition: 'Score drops > 10% in 1hr', active: true },
    { id: 2, name: 'Viral Spike', condition: 'Mentions > 500/hr', active: true },
    { id: 3, name: 'Negative PR', condition: 'Negative ratio > 30%', active: false },
  ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Alert Feed */}
      <div className="lg:col-span-2 bg-surface rounded-2xl border border-accent/20 p-6 shadow-sm flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold text-text-main flex items-center gap-2">
            <Bell size={20} className="text-patina" /> 
            Active Alerts
          </h3>
          <button className="text-xs font-bold text-text-muted hover:text-patina">MARK ALL READ</button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springAnim, delay: i * 0.1 }}
                className={`p-4 rounded-xl border flex items-start gap-4 ${
                  alert.severity === 'high' 
                    ? 'bg-red-50 border-red-200' 
                    : alert.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-teal-50 border-teal-200'
                }`}
              >
                <div className={`mt-1 p-2 rounded-lg ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-teal-100 text-teal-600'
                }`}>
                  {alert.type === 'drop' && <ArrowDown size={18} />}
                  {alert.type === 'spike' && <ArrowUp size={18} />}
                  {alert.type === 'emotion' && <Activity size={18} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-text-main">{alert.brand}</h4>
                    <span className="text-xs font-mono text-text-muted">{alert.time}</span>
                  </div>
                  <p className="text-sm text-text-muted/80 mt-1">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-surface rounded-2xl border border-accent/20 p-6 shadow-sm flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-display font-bold text-text-main">Alert Rules</h3>
          <button className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center hover:bg-patina hover:text-surface transition-colors text-text-muted">
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 bg-canvas/40 rounded-xl border border-accent/20 flex items-center justify-between">
              <div>
                <p className="font-bold text-text-main text-sm">{rule.name}</p>
                <p className="text-xs text-text-muted mt-1 font-mono">{rule.condition}</p>
              </div>
              <button 
                onClick={() => {
                  const newRules = [...rules];
                  const idx = newRules.findIndex(r => r.id === rule.id);
                  newRules[idx].active = !newRules[idx].active;
                  setRules(newRules);
                }}
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${rule.active ? 'bg-patina' : 'bg-accent/30'}`}
              >
                <motion.div 
                  className="w-3 h-3 bg-surface rounded-full shadow-sm"
                  animate={{ x: rule.active ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 rounded-xl bg-teal-50 border border-teal-100">
          <h4 className="font-bold text-patina text-sm flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-patina" /> Webhooks
          </h4>
          <p className="text-xs text-text-muted leading-relaxed mb-3">
            Connect your alerts to external services like Slack, Discord, or generic Webhooks.
          </p>
          <button className="w-full py-2 bg-surface rounded-lg text-xs font-bold text-text-main border border-accent/20 hover:border-patina transition-colors">
            Configure Integrations
          </button>
        </div>
      </div>

    </div>
  );
}
