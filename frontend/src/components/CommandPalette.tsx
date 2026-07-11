import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';

interface Command {
  id: string;
  label: string;
  hint: string;
  action: (query?: string) => void;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS: Command[] = [
    { id: 'analyze',  label: 'Analyze a brand',      hint: 'Type brand name after',  action: (q) => console.log('Analyze:', q) },
    { id: 'vader',    label: 'Switch to VADER',       hint: 'Algorithm',              action: () => console.log('Switch VADER') },
    { id: 'bert',     label: 'Switch to BERT',        hint: 'Algorithm',              action: () => console.log('Switch BERT') },
    { id: 'roberta',  label: 'Switch to RoBERTa',     hint: 'Algorithm',              action: () => console.log('Switch RoBERTa') },
    { id: 'groq',     label: 'Switch to Groq AI',     hint: 'Algorithm',              action: () => console.log('Switch Groq') },
    { id: 'ensemble', label: 'Switch to Ensemble',    hint: 'Algorithm',              action: () => console.log('Switch Ensemble') },
    { id: 'overview', label: 'Go to Overview',        hint: 'Dashboard section',      action: () => console.log('Go Overview') },
    { id: 'timeline', label: 'Go to Timeline',        hint: 'Dashboard section',      action: () => console.log('Go Timeline') },
    { id: 'emotions', label: 'Go to Emotions',        hint: 'Dashboard section',      action: () => console.log('Go Emotions') },
    { id: 'topics',   label: 'Go to Topics',          hint: 'Dashboard section',      action: () => console.log('Go Topics') },
    { id: 'export',   label: 'Export CSV',            hint: 'Download scored data',   action: () => document.getElementById('export-csv-btn')?.click() },
    { id: 'focus',    label: 'Enter Focus Mode',      hint: 'Fullscreen presentation',action: () => document.getElementById('focus-mode-btn')?.click() },
    { id: 'share',    label: 'Share insight card',    hint: 'Download PNG',           action: () => console.log('Share') },
  ];

  const fuse = new Fuse(COMMANDS, { keys: ['label', 'hint'], threshold: 0.3 });
  
  // Extract search term if action is "analyze"
  const isAnalyzeCommand = query.toLowerCase().startsWith('analyze ');
  const cleanQuery = isAnalyzeCommand ? 'analyze' : query;
  
  const results = cleanQuery ? fuse.search(cleanQuery).map(r => r.item) : COMMANDS;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleExecute = (index: number) => {
    const cmd = results[index];
    if (cmd) {
      let param = '';
      if (cmd.id === 'analyze' && isAnalyzeCommand) {
        param = query.substring(8).trim();
      }
      cmd.action(param);
      setIsOpen(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute(selectedIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[10000] flex items-start justify-center pt-[15vh]">
      <div 
        className="absolute inset-0" 
        onClick={() => setIsOpen(false)}
      ></div>
      <div 
        className="relative w-[90%] max-w-[560px] bg-canvas border border-accent/25 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-5 border-b border-accent/20">
          <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none text-text-main font-body text-base py-4 px-3 focus:outline-none focus:ring-0"
            placeholder="Search commands..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <span className="text-xs font-mono bg-surface-alt border border-accent/20 text-text-muted px-1.5 py-0.5 rounded">ESC</span>
        </div>
        
        <div className="max-h-[380px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">
              No results found.
            </div>
          ) : (
            results.map((cmd, idx) => (
              <div 
                key={cmd.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer ${idx === selectedIndex ? 'bg-surface border border-accent/20 shadow-sm' : 'hover:bg-accent/5'}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => handleExecute(idx)}
              >
                <span className={`text-sm ${idx === selectedIndex ? 'text-text-main font-medium' : 'text-text-main/80'}`}>
                  {cmd.label}
                  {cmd.id === 'analyze' && isAnalyzeCommand && (
                    <span className="ml-2 text-patina truncate">"{query.substring(8).trim()}"</span>
                  )}
                </span>
                <span className={`text-xs ${idx === selectedIndex ? 'text-patina' : 'text-text-muted'}`}>
                  {cmd.hint}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
