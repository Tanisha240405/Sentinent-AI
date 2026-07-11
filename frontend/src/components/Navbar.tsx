import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiquidMorphButton from './LiquidMorphButton';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 h-[58px] transition-colors duration-300 ${scrolled ? 'bg-canvas/90 backdrop-blur-md border-b border-accent/20 shadow-sm' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="z-[60] relative">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-patina animate-pulse-dot"></div>
              <span className="font-display font-bold text-xl text-text-main tracking-tight">SentientAI</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            {['Features', 'Algorithms', 'Workflow', 'Stack'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="hover:text-patina transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4 z-[60] relative">
            <div className="hidden sm:block">
              <LiquidMorphButton 
                label="Try Live Demo →"
                onClick={() => navigate('/dashboard')}
                padding="10px 24px"
                backgroundColor="transparent"
                textColor="#2C6C73"
                blobColor="#2C6C73"
                hoverTextColor="#FAF9F6"
              />
            </div>
            <button 
              className="md:hidden text-text-main font-mono text-sm uppercase tracking-widest relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-surface z-[45] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-8">
            {['Features', 'Algorithms', 'Workflow', 'Stack'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-4xl font-display font-bold text-text-main"
              >
                {item}
              </a>
            ))}
            <div className="mt-8">
              <LiquidMorphButton 
                label="Try Live Demo →"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                padding="14px 32px"
                backgroundColor="transparent"
                textColor="#2C6C73"
                blobColor="#2C6C73"
                hoverTextColor="#FAF9F6"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
