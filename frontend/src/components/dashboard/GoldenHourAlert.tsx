import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoldenHourAlert({ activeBrand }: { activeBrand: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<number | null>(null);

  useEffect(() => {
    const flagKey = `golden-hour-${activeBrand}-${new Date().toISOString().slice(0,10)}`;
    if (sessionStorage.getItem(flagKey)) {
      setIsVisible(false);
      return;
    }

    setIsVisible(false);

    // Simulate sustained positive sentiment
    triggerRef.current = setTimeout(() => {
      if (activeBrand === 'Apple' || activeBrand === 'OpenAI') {
        setIsVisible(true);
      }
    }, 5000);

    return () => {
      if (triggerRef.current) clearTimeout(triggerRef.current as number);
    };
  }, [activeBrand]);

  useEffect(() => {
    let hideTimer: number | ReturnType<typeof setTimeout>;
    if (isVisible) {
      hideTimer = setTimeout(() => {
        handleDismiss();
      }, 12000);
    }
    return () => clearTimeout(hideTimer as number);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    const flagKey = `golden-hour-${activeBrand}-${new Date().toISOString().slice(0,10)}`;
    sessionStorage.setItem(flagKey, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ x: '-110%' }}
          animate={{ x: 0 }}
          exit={{ x: '-110%' }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-7 left-7 z-[9000] w-80 max-w-[320px] bg-surface border border-patina/30 border-l-[3px] border-l-patina rounded-xl p-3.5 shadow-xl overflow-hidden"
        >
          <h4 className="font-display font-semibold text-sm text-patina flex items-center gap-2 mb-1">
            🌟 Golden hour
          </h4>
          <p className="text-[13px] text-text-main/90 font-body mb-3 leading-snug">
            {activeBrand} sentiment is peaking — great time to post or launch.
          </p>
          <div className="flex items-center justify-between">
            <button 
              className="text-xs font-semibold text-patina hover:underline"
              onClick={handleDismiss}
            >
              Open dashboard →
            </button>
            <button 
              onClick={handleDismiss}
              className="text-text-muted hover:text-text-main p-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 h-[3px] bg-patina rounded-bl-xl origin-left" 
               style={{ width: '100%', animation: 'deplete 12s linear forwards' }}>
          </div>
          <style>{`
            @keyframes deplete {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
