import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, Smile, Database, Hash, Bell, GitCompare, Plus, X, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'timeline', label: 'Timeline', icon: <TrendingUp size={18} /> },
  { id: 'emotions', label: 'Emotions', icon: <Smile size={18} /> },
  { id: 'sources', label: 'Sources', icon: <Database size={18} /> },
  { id: 'topics', label: 'Topics', icon: <Hash size={18} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={18} /> },
  { id: 'compare', label: 'Compare', icon: <GitCompare size={18} /> },
  { id: 'test-brand', label: 'Test Your Brand', icon: <FlaskConical size={18} /> },
];

export default function Sidebar({ 
  activeBrand, setActiveBrand,
  activeNav, setActiveNav,
  recentBrands, setRecentBrands
}: { 
  activeBrand: string; setActiveBrand: (b: string) => void;
  activeNav: string; setActiveNav: (n: string) => void;
  recentBrands: any[]; setRecentBrands: (brands: any[]) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newBrand, setNewBrand] = useState('');

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    const brandName = newBrand.trim();
    if (!recentBrands.find(b => b.name.toLowerCase() === brandName.toLowerCase())) {
      setRecentBrands([{ name: brandName, score: 0.00 }, ...recentBrands].slice(0, 8));
    }
    setActiveBrand(brandName);
    setNewBrand('');
    setIsAdding(false);
  };
  return (
    <aside className="w-[220px] bg-surface border-r border-accent/20 flex-col hidden md:flex h-full shadow-sm z-20">
      <div className="h-[58px] flex items-center px-6 border-b border-accent/20">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-2.5 h-2.5 rounded-full bg-patina animate-pulse-dot"></div>
          <span className="font-display font-bold text-lg text-text-main tracking-tight">SentientAI</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8 scrollbar-hide">
        
        {/* Navigation */}
        <div className="px-3">
          <p className="px-3 text-[10px] font-bold tracking-widest text-text-muted/70 uppercase mb-2">Navigation</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.id === activeNav 
                      ? 'bg-patina/10 text-patina border-l-2 border-patina font-semibold' 
                      : 'text-text-muted hover:bg-patina/5 hover:text-patina border-l-2 border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Brands */}
        <div className="px-3">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold tracking-widest text-text-muted/70 uppercase">Recent Brands</p>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="text-text-muted hover:text-patina transition-colors p-1"
            >
              {isAdding ? <X size={14} /> : <Plus size={14} />}
            </button>
          </div>
          
          {isAdding && (
            <form onSubmit={handleAddBrand} className="px-2 mb-2">
              <input 
                type="text" 
                autoFocus
                placeholder="Brand name..." 
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                className="w-full bg-surface-alt border border-accent/30 rounded py-1 px-2 text-xs text-text-main focus:outline-none focus:border-patina placeholder-text-muted/50"
              />
            </form>
          )}

          <ul className="space-y-1">
            {recentBrands.map((brand) => (
              <li key={brand.name}>
                <button 
                  onClick={() => setActiveBrand(brand.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeBrand === brand.name 
                      ? 'bg-patina/10 text-patina font-semibold' 
                      : 'text-text-muted hover:bg-patina/5 hover:text-patina'
                  }`}
                >
                  <span className="truncate max-w-[100px] text-left">{brand.name}</span>
                  <span className={`font-mono text-xs shrink-0 ${
                    brand.score > 0.5 ? 'text-positive' : brand.score < 0 ? 'text-negative' : 'text-text-muted'
                  }`}>
                    {brand.score > 0 ? '+' : ''}{(brand.score || 0).toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* User profile / Settings mock */}
      <div className="p-4 border-t border-accent/20">
        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-surface-alt transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-patina to-teal flex items-center justify-center text-white font-bold text-xs">
            U
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-text-main truncate">User Account</p>
            <p className="text-[10px] text-text-muted truncate">Free Plan</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
