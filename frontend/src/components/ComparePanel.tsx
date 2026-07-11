import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Search } from 'lucide-react';
import EmotionBarChart from './EmotionBarChart';

export default function ComparePanel({ activeBrand, recentBrands = [] }: { activeBrand: string, recentBrands?: any[] }) {
  const [competitor, setCompetitor] = useState('Google');
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCompetitor(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Compare Header */}
      <div className="bg-surface rounded-2xl border border-accent/20 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-patina/10 flex items-center justify-center font-display font-bold text-xl text-patina shrink-0">
            {activeBrand.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-text-muted/70 uppercase">Primary</p>
            <h2 className="text-2xl font-display font-bold text-text-main">{activeBrand}</h2>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center px-4">
          <div className="w-10 h-10 rounded-full bg-surface border border-accent/30 flex items-center justify-center text-patina shadow-sm z-10">
            <GitCompare size={20} />
          </div>
          <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-accent/30 to-transparent absolute"></div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-1 text-right">
            <p className="text-xs font-bold tracking-widest text-text-muted/70 uppercase">Competitor</p>
            {competitor ? (
              <h2 className="text-2xl font-display font-bold text-text-main">{competitor}</h2>
            ) : (
              <div className="flex items-center gap-2 mt-1 justify-end">
                <select 
                  className="bg-surface-alt border border-accent/30 rounded py-1 px-2 text-sm text-text-main focus:outline-none focus:border-patina max-w-[120px]"
                  onChange={(e) => {
                    if (e.target.value) setCompetitor(e.target.value);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select brand...</option>
                  {recentBrands.filter(b => b.name !== activeBrand).map(b => (
                    <option key={b.name} value={b.name}>{b.name}</option>
                  ))}
                </select>
                <span className="text-xs text-text-muted">or</span>
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-24 bg-surface-alt border border-accent/30 rounded py-1 pl-2 pr-6 text-sm text-text-main focus:outline-none focus:border-patina"
                  />
                  <button type="submit" className="absolute right-1 top-1.5 text-text-muted hover:text-patina">
                    <Search size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCompetitor('')}
            className="w-12 h-12 rounded-xl bg-surface border border-accent/30 flex items-center justify-center font-display font-bold text-xl text-text-muted shrink-0 hover:bg-patina/5 hover:text-patina transition-colors"
          >
            {competitor ? competitor.charAt(0) : '?'}
          </button>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompareStat title="Overall Sentiment" val1={0.82} val2={0.42} prefix="+" isScore />
        <CompareStat title="Total Mentions" val1={14205} val2={9840} />
        <CompareStat title="Pos/Neg Ratio" val1="4.2:1" val2="2.1:1" />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <div className="bg-surface rounded-2xl border border-accent/20 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-display font-bold text-text-main mb-6 text-center">{activeBrand} Emotions</h3>
          <div className="flex-1">
            <EmotionBarChart />
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-accent/20 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-display font-bold text-text-main mb-6 text-center">{competitor || "Competitor"} Emotions</h3>
          <div className="flex-1 opacity-90">
            {competitor ? <EmotionBarChart /> : (
              <div className="h-full flex items-center justify-center text-text-muted/60">
                Select a competitor to compare
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function CompareStat({ title, val1, val2, prefix = "", isScore = false }: any) {
  const num1 = typeof val1 === 'number' ? val1 : parseFloat(val1);
  const num2 = typeof val2 === 'number' ? val2 : parseFloat(val2);
  const v1Wins = num1 > num2;

  return (
    <div className="bg-surface rounded-2xl border border-accent/20 p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-widest text-text-muted/70 uppercase mb-4 text-center">{title}</h3>
      <div className="flex justify-between items-center relative">
        <div className="w-px h-12 bg-accent/30 absolute left-1/2 -translate-x-1/2"></div>
        
        <div className="flex-1 text-center pr-4">
          <span className={`text-3xl font-display font-bold ${v1Wins ? 'text-patina' : 'text-text-main'}`}>
            {prefix}{val1}
          </span>
          {isScore && v1Wins && <div className="text-[10px] text-patina mt-1 uppercase tracking-widest">Winner</div>}
        </div>
        
        <div className="flex-1 text-center pl-4">
          <span className={`text-3xl font-display font-bold ${!v1Wins ? 'text-patina' : 'text-text-main'}`}>
            {prefix}{val2}
          </span>
          {isScore && !v1Wins && <div className="text-[10px] text-patina mt-1 uppercase tracking-widest">Winner</div>}
        </div>
      </div>
    </div>
  );
}
