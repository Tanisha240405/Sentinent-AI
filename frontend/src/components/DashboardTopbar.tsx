import React, { useState } from 'react';
import { Search, ChevronDown, Menu, Maximize2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardTopbar({ 
  activeAlgo, 
  setActiveAlgo, 
  onSearch, 
  activeNav, 
  isFocusMode = false, 
  setIsFocusMode = () => {},
  brandScale = 'enterprise',
  setBrandScale = () => {}
}: { 
  activeAlgo: string, 
  setActiveAlgo: (a: string) => void, 
  onSearch: (s: string) => void, 
  activeNav?: string, 
  isFocusMode?: boolean, 
  setIsFocusMode?: (b: boolean) => void,
  brandScale?: 'enterprise' | 'micro',
  setBrandScale?: (scale: 'enterprise' | 'micro') => void
}) {
  const [query, setQuery] = useState('');
  const algos = ['Ensemble', 'VADER', 'BERT', 'TextBlob', 'RoBERTa', 'Groq AI'];

  const handleExportCSV = () => {
    // Mock export logic based on prompt requirements
    const headers = "timestamp,source,text,vader_score,bert_score,textblob_score,roberta_score,groq_score,ensemble_score,dominant_emotion,virality_flag\n";
    const row = `${new Date().toISOString()},"Reddit","Mock text for export",0.5,0.6,0.4,0.7,0.8,0.75,"Joy","false"\n`;
    const csvString = headers + row;

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sentientai-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[58px] bg-canvas/80 backdrop-blur-md border-b border-accent/20 flex items-center justify-between px-4 md:px-6 z-20">
      <div className="flex items-center gap-4">
        {!isFocusMode && (
          <button className="md:hidden text-text-muted hover:text-patina">
            <Menu size={20} />
          </button>
        )}
        
        {/* Search */}
        {!isFocusMode && (
          <div 
            className="relative group flex items-center gap-4"
            title={activeNav === 'test-brand' ? "Using custom input — click Overview to return to web search" : undefined}
          >
            <div className={`relative ${activeNav === 'test-brand' ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-text-muted/70 group-focus-within:text-patina" />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    onSearch(query.trim());
                  }
                }}
                placeholder="Analyze brand..." 
                className="w-full md:w-[220px] pl-10 pr-4 py-1.5 bg-surface border border-accent/30 rounded-full text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-patina transition-colors shadow-sm"
              />
            </div>

            {/* Brand Footprint Selector */}
            <div className="hidden lg:flex items-center bg-surface-alt/75 border border-accent/20 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setBrandScale('enterprise')}
                className={`px-2.5 py-1 text-[11px] font-display font-semibold rounded-md transition-all ${
                  brandScale === 'enterprise'
                    ? 'bg-patina text-white shadow-sm'
                    : 'text-text-muted hover:text-patina'
                }`}
                title="Global Online Footprint"
              >
                🌐 Enterprise
              </button>
              <button
                onClick={() => setBrandScale('micro')}
                className={`px-2.5 py-1 text-[11px] font-display font-semibold rounded-md transition-all ${
                  brandScale === 'micro'
                    ? 'bg-patina text-white shadow-sm'
                    : 'text-text-muted hover:text-patina'
                }`}
                title="Local / Micro-Brand Footprint"
              >
                📍 Micro-Brand
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Live Badge */}
        {!isFocusMode && (
          activeNav === 'test-brand' ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#879EC6]/10 border border-[#879EC6] rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#879EC6] shadow-[0_0_8px_rgba(135,158,198,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-bold text-[#879EC6] tracking-widest uppercase">TEST MODE</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-positive/10 border border-positive/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-positive shadow-[0_0_8px_rgba(110,231,183,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-bold text-positive tracking-widest uppercase">LIVE</span>
            </div>
          )
        )}

        {/* Algo Dropdown (mocked as simple select or button for now) */}
        {!isFocusMode && (
          <div className="relative hidden sm:block shadow-sm">
            <select 
              value={activeAlgo}
              onChange={(e) => setActiveAlgo(e.target.value)}
              className="appearance-none bg-surface border border-accent/30 text-text-main text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-patina cursor-pointer"
            >
              {algos.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/70 pointer-events-none" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 border-l border-accent/20 pl-4 md:pl-6">
          <button 
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-text-muted hover:text-patina transition-colors text-[13px] font-medium"
            title="Export Scored Data"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          
          {isFocusMode ? (
            <button 
              onClick={() => setIsFocusMode(false)}
              className="flex items-center gap-1.5 text-text-muted hover:text-patina transition-colors text-[13px] font-medium"
            >
              <span className="hidden sm:inline">Exit Focus</span>
            </button>
          ) : (
            <button 
              id="focus-mode-btn"
              onClick={() => setIsFocusMode(true)}
              className="flex items-center gap-1.5 text-text-muted hover:text-patina transition-colors text-[13px] font-medium"
              title="Enter Focus Mode"
            >
              <Maximize2 size={15} />
              <span className="hidden sm:inline">Focus</span>
            </button>
          )}

          {!isFocusMode && (
            <Link to="/" className="text-[13px] font-medium text-text-muted hover:text-patina transition-colors ml-2">
              ← Back
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
