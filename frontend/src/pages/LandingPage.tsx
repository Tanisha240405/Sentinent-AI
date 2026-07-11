import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroBadge from '../components/HeroBadge';
import DemoCard from '../components/DemoCard';
import LiquidMorphButton from '../components/LiquidMorphButton';
import FeatureCard from '../components/FeatureCard';
import AlgorithmList from '../components/AlgorithmList';
import ParticleText from '../components/ParticleText';
import { motion } from 'framer-motion';
import { FaApple, FaAmazon, FaMicrosoft } from 'react-icons/fa';
import { SiTesla, SiNike, SiOpenai, SiMeta, SiGoogle } from 'react-icons/si';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const headlineText = "Brand\\nSentiment Intelligence,\\nReal-Time.";

  return (
    <div className="min-h-screen bg-canvas overflow-hidden selection:bg-positive/30">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-patina/10 rounded-full blur-[120px] animate-orb"></div>
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-sepia/20 rounded-full blur-[100px] animate-orb"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-canvas/90 pointer-events-none z-0"></div>

      <Navbar />

      <main className="relative z-10">
        <section className="pt-32 pb-24 px-6 flex flex-col items-center text-center relative">
          
          {/* Floating Background Brand Blobs (Screen-wide container) */}
          <div className="absolute inset-0 pointer-events-none z-0 hidden md:block overflow-hidden">
            {/* Apple */}
            <motion.div 
              className="absolute top-[30%] left-[5%] xl:left-[10%] w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-text-main/80"
              style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
              animate={{ 
                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"], 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaApple size={28} />
            </motion.div>

            {/* Tesla */}
            <motion.div 
              className="absolute top-[25%] right-[5%] xl:right-[15%] w-20 h-20 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-negative/80"
              style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
              animate={{ 
                borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 70% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%"], 
                y: [0, 20, 0],
                rotate: [0, -10, 5, 0] 
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <SiTesla size={36} />
            </motion.div>
            
            {/* Nike */}
            <motion.div 
              className="absolute bottom-[20%] left-[8%] xl:left-[18%] w-14 h-14 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-patina/80"
              style={{ borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%" }}
              animate={{ 
                borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "80% 20% 50% 50% / 75% 20% 80% 25%", "50% 50% 20% 80% / 25% 80% 20% 75%"], 
                y: [0, -25, 0],
                rotate: [0, 15, -15, 0] 
              }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <SiNike size={24} />
            </motion.div>

            {/* OpenAI */}
            <motion.div 
              className="absolute bottom-[30%] right-[10%] xl:right-[8%] w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-positive/80"
              style={{ borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%" }}
              animate={{ 
                borderRadius: ["70% 30% 50% 50% / 30% 30% 70% 70%", "30% 70% 50% 50% / 70% 70% 30% 30%", "70% 30% 50% 50% / 30% 30% 70% 70%"], 
                y: [0, 15, 0],
                rotate: [0, -5, 10, 0] 
              }}
              transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <SiOpenai size={28} />
            </motion.div>

            {/* Meta */}
            <motion.div 
              className="absolute top-[50%] left-[2%] xl:left-[5%] w-24 h-24 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#2C6C73]/70"
              style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
              animate={{ 
                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"], 
                y: [0, -20, 0],
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <SiMeta size={42} />
            </motion.div>

            {/* Amazon */}
            <motion.div 
              className="absolute bottom-[10%] right-[2%] xl:right-[20%] w-18 h-18 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#FF9900]/70"
              style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
              animate={{ 
                borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"], 
                y: [0, 25, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            >
              <FaAmazon size={32} />
            </motion.div>

            {/* Google */}
            <motion.div 
              className="absolute top-[10%] left-[20%] xl:left-[25%] w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#4285F4]/80"
              style={{ borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%" }}
              animate={{ 
                borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "80% 20% 50% 50% / 75% 20% 80% 25%", "50% 50% 20% 80% / 25% 80% 20% 75%"], 
                y: [0, -10, 0],
                rotate: [0, 15, -15, 0] 
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            >
              <SiGoogle size={20} />
            </motion.div>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
            <div>
              <HeroBadge />
            </div>
            
            <div className="relative mt-4 group flex justify-center w-full max-w-6xl mx-auto px-2 sm:px-6 h-[220px] sm:h-[280px] md:h-[320px] lg:h-[350px]">
              <h1 className="sr-only">
                Brand Sentiment Intelligence, Real-Time.
              </h1>
              <ParticleText 
                text={headlineText} 
                className="w-full h-full cursor-crosshair z-10" 
                particleColor="#2C6C73" 
                fontSize={110}
                particleDensity={3}
                particleSize={2}
                mouseRadius={120}
                returnSpeed={0.06}
              />
            </div>
            
            <p className="mt-4 text-lg sm:text-xl text-text-muted max-w-2xl font-medium">
              Monitor what the internet says about any brand, product, or topic — with multi-algorithm NLP, live emotion dashboards, and Groq-accelerated AI insights.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-50">
              <LiquidMorphButton 
                label="Analyze a Brand →"
                onClick={() => navigate('/dashboard')}
                backgroundColor="transparent"
                textColor="#2C6C73"
                blobColor="#2C6C73"
                hoverTextColor="#FAF9F6"
              />
              <LiquidMorphButton 
                label="See How It Works"
                onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
                backgroundColor="transparent"
                textColor="#7A7A7A"
                blobColor="#102221"
                hoverTextColor="#FAF9F6"
                padding="16px 32px"
              />
            </div>
          </div>
        </section>

        <div className="w-full overflow-hidden border-y border-accent/20 bg-surface/80 backdrop-blur-md py-4 relative z-20 group">
          <div className="flex whitespace-nowrap animate-marquee group-hover:paused-slow transition-all duration-300">
            {[
              { b: 'Apple', s: '+0.82', c: 'text-patina' },
              { b: 'Tesla', s: '-0.31', c: 'text-negative' },
              { b: 'Nike', s: '+0.65', c: 'text-patina' },
              { b: 'OpenAI', s: '+0.91', c: 'text-patina' },
              { b: 'Google', s: '+0.42', c: 'text-patina' },
              { b: 'Meta', s: '-0.12', c: 'text-negative' },
            ].map((item, i) => (
              <div key={i} className="mx-10 flex items-center font-mono text-sm tracking-wide transition-all duration-200 group-hover:scale-[1.04]">
                <span className={`w-2 h-2 rounded-full mr-3 ${item.s.startsWith('+') ? 'bg-patina' : 'bg-negative'}`}></span>
                <span className="text-text-main mr-2 font-bold">{item.b}:</span>
                <span className={`${item.c} font-bold`}>{item.s}</span>
                <div className="ml-10 w-px h-4 bg-accent/20 opacity-10 group-hover:opacity-40 transition-opacity"></div>
              </div>
            ))}
            {[
              { b: 'Apple', s: '+0.82', c: 'text-patina' },
              { b: 'Tesla', s: '-0.31', c: 'text-negative' },
              { b: 'Nike', s: '+0.65', c: 'text-patina' },
              { b: 'OpenAI', s: '+0.91', c: 'text-patina' },
              { b: 'Google', s: '+0.42', c: 'text-patina' },
              { b: 'Meta', s: '-0.12', c: 'text-negative' },
            ].map((item, i) => (
              <div key={'dup'+i} className="mx-10 flex items-center font-mono text-sm tracking-wide transition-all duration-200 group-hover:scale-[1.04]">
                <span className={`w-2 h-2 rounded-full mr-3 ${item.s.startsWith('+') ? 'bg-patina' : 'bg-negative'}`}></span>
                <span className="text-text-main mr-2 font-bold">{item.b}:</span>
                <span className={`${item.c} font-bold`}>{item.s}</span>
                <div className="ml-10 w-px h-4 bg-accent/20 opacity-10 group-hover:opacity-40 transition-opacity"></div>
              </div>
            ))}
          </div>
          
          <div className="w-full h-px bg-accent/10 my-1"></div>
          
          <div className="flex whitespace-nowrap animate-marquee opacity-35">
            {[
              { b: 'Microsoft', s: '+0.68', c: 'text-patina' },
              { b: 'Netflix', s: '-0.21', c: 'text-negative' },
              { b: 'Amazon', s: '+0.55', c: 'text-patina' },
              { b: 'Spotify', s: '+0.71', c: 'text-patina' },
              { b: 'Twitter', s: '-0.42', c: 'text-negative' },
              { b: 'Disney', s: '+0.12', c: 'text-patina' },
            ].map((item, i) => (
              <div key={'row2'+i} className="mx-10 flex items-center font-mono text-sm tracking-wide">
                <span className={`w-2 h-2 rounded-full mr-3 ${item.s.startsWith('+') ? 'bg-patina' : 'bg-negative'}`}></span>
                <span className="text-text-main mr-2 font-bold">{item.b}:</span>
                <span className={`${item.c} font-bold`}>{item.s}</span>
              </div>
            ))}
             {[
              { b: 'Microsoft', s: '+0.68', c: 'text-patina' },
              { b: 'Netflix', s: '-0.21', c: 'text-negative' },
              { b: 'Amazon', s: '+0.55', c: 'text-patina' },
              { b: 'Spotify', s: '+0.71', c: 'text-patina' },
              { b: 'Twitter', s: '-0.42', c: 'text-negative' },
              { b: 'Disney', s: '+0.12', c: 'text-patina' },
            ].map((item, i) => (
              <div key={'row2dup'+i} className="mx-10 flex items-center font-mono text-sm tracking-wide">
                <span className={`w-2 h-2 rounded-full mr-3 ${item.s.startsWith('+') ? 'bg-patina' : 'bg-negative'}`}></span>
                <span className="text-text-main mr-2 font-bold">{item.b}:</span>
                <span className={`${item.c} font-bold`}>{item.s}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="py-32 px-6 flex justify-center relative">
          <div className="w-full max-w-5xl">
            <DemoCard />
          </div>
        </section>

        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto w-full px-6 mb-12">
            <div className="text-left">
              <div className="flex items-center mb-3">
                <div className="w-10 h-px bg-steel-blue mr-3 origin-left"></div>
                <h4 className="text-patina font-bold tracking-widest text-sm uppercase">Core Capabilities</h4>
              </div>
              <h2 className="text-5xl font-display font-bold text-text-main mb-6 flex flex-wrap">
                Everything you need to track sentiment
              </h2>
              <p className="text-text-muted text-xl max-w-2xl">From raw social data to actionable intelligence in seconds.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard title="Multi-Source Scraping" desc="Pull mentions from Reddit, News APIs, and HackerNews simultaneously with deduplication and spam filtering." />
            <FeatureCard title="6 NLP Algorithms" desc="VADER, BERT, TextBlob, RoBERTa, Groq LLM, and an Ensemble model — compare scores side-by-side or use the combined signal." />
            <FeatureCard title="Live Emotion Graphs" desc="Animated Recharts showing sentiment over time, by source, by keyword cluster, with drill-down capability." />
            <FeatureCard title="Groq AI Insights" desc="Ultra-fast Groq inference summarises why sentiment shifted, key topics driving it, and what competitors are doing." />
            <FeatureCard title="Trend Alerts" desc="Set thresholds and get notified when sentiment drops, a topic spikes, or a negative cluster grows beyond a set level." />
            <FeatureCard title="Geo & Source Map" desc="See where sentiment originates geographically and by community — which subreddits, which news outlets." />
          </div>
        </section>

        <section id="workflow" className="py-32 bg-canvas relative">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6">How It Works</h2>
              <p className="text-text-muted text-xl max-w-2xl mx-auto">From raw data to actionable intelligence.</p>
            </div>

            <div className="relative">
              <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-accent/20 md:-translate-x-1/2 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-b from-patina via-sepia to-patina"></div>
              </div>

              <div className="space-y-16 relative">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                  <div className="w-full md:w-1/2 md:text-right pl-12 md:pl-0">
                    <h3 className="text-2xl font-bold text-text-main mb-3">1. Data Ingestion</h3>
                    <p className="text-text-muted">We continuously scrape Reddit, X, and News APIs for your keywords.</p>
                  </div>
                  <div className="absolute left-[20px] md:left-1/2 w-4 h-4 bg-patina rounded-full -translate-x-1/2 shadow-[0_0_15px_rgba(110,231,183,0.5)]"></div>
                  <div className="w-full md:w-1/2 pl-12 md:pl-0">
                    <div className="bg-surface p-6 rounded-2xl border border-accent/20 shadow-sm"><div className="font-mono text-sm text-text-muted">Fetching 10k+ posts/min</div></div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
                  <div className="w-full md:w-1/2 md:text-left pl-12 md:pl-0">
                    <h3 className="text-2xl font-bold text-text-main mb-3">2. Multi-Model Scoring</h3>
                    <p className="text-text-muted">Data passes through our 6-model NLP pipeline for sentiment scoring.</p>
                  </div>
                  <div className="absolute left-[20px] md:left-1/2 w-4 h-4 bg-sepia rounded-full -translate-x-1/2 shadow-[0_0_15px_rgba(240,183,164,0.5)]"></div>
                  <div className="w-full md:w-1/2 pl-12 md:pl-0 md:text-right">
                     <div className="bg-surface p-6 rounded-2xl border border-accent/20 shadow-sm"><div className="font-mono text-sm text-text-muted">VADER, BERT, Groq...</div></div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                  <div className="w-full md:w-1/2 md:text-right pl-12 md:pl-0">
                    <h3 className="text-2xl font-bold text-text-main mb-3">3. Actionable Insights</h3>
                    <p className="text-text-muted">Get real-time alerts and deep-dive Groq AI summaries of the "why".</p>
                  </div>
                  <div className="absolute left-[20px] md:left-1/2 w-4 h-4 bg-patina rounded-full -translate-x-1/2 shadow-[0_0_15px_rgba(110,231,183,0.5)]"></div>
                  <div className="w-full md:w-1/2 pl-12 md:pl-0">
                    <div className="bg-surface p-6 rounded-2xl border border-accent/20 shadow-sm"><div className="font-mono text-sm text-text-muted">Alert: Brand Sentiment Dropping</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="algorithms" className="py-32 bg-surface border-y border-accent/20 shadow-sm">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20 flex flex-col items-center">
              <div className="flex items-center mb-3">
                <div className="w-10 h-px bg-steel-blue mr-3 origin-left"></div>
                <h4 className="text-patina font-bold tracking-widest text-sm uppercase">Multi-Algorithm Engine</h4>
              </div>
              <h2 className="text-5xl font-display font-bold text-text-main mb-6 flex flex-wrap justify-center">
                Six Ways to Read a Signal
              </h2>
              <p className="text-text-muted text-xl">Compare models, blend them, or let the Ensemble decide.</p>
            </div>
            
            <AlgorithmList />
          </div>
        </section>

        <section className="py-40 px-6 flex justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 via-canvas to-canvas pointer-events-none"></div>
          <div className="relative max-w-4xl w-full">
            <div className="absolute inset-0 bg-patina/10 blur-[100px] rounded-full"></div>
            <div className="relative bg-surface border border-accent/30 rounded-[40px] p-16 text-center shadow-lg backdrop-blur-xl">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6">Start Tracking Your Brand</h2>
              <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto">Get instant alerts, real-time emotion tracking, and Groq-powered AI insights across all major platforms.</p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button onClick={() => navigate('/dashboard')} className="px-10 py-5 bg-patina text-surface font-bold text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                    Open Live Dashboard →
                  </button>
              </div>
            </div>
          </div>
        </section>

      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .shape-outside-circle {
          shape-outside: circle(50%);
        }
      `}} />
    </div>
  );
}
