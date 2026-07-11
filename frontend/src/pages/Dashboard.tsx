import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardTopbar from '../components/DashboardTopbar';
import KPICard from '../components/KPICard';
import SentimentTimeline from '../components/SentimentTimeline';
import SourceDonut from '../components/SourceDonut';
import AlgorithmScoreCard from '../components/AlgorithmScoreCard';
import EmotionBarChart from '../components/EmotionBarChart';
import LiveMentionFeed from '../components/LiveMentionFeed';
import GroqInsights from '../components/GroqInsights';
import AlertsPanel from '../components/AlertsPanel';
import ComparePanel from '../components/ComparePanel';
import ShiftDetector from '../components/dashboard/ShiftDetector';
import ViralityScore from '../components/dashboard/ViralityScore';
import CounterNarrative from '../components/dashboard/CounterNarrative';
import SentimentFingerprint from '../components/dashboard/SentimentFingerprint';
import GoldenHourAlert from '../components/dashboard/GoldenHourAlert';
import TestYourBrandPanel from '../components/dashboard/TestYourBrandPanel';
export default function Dashboard() {
  const [activeBrand, setActiveBrand] = useState('Apple');
  const [activeAlgo, setActiveAlgo] = useState('Ensemble');
  const [activeNav, setActiveNav] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [brandScale, setBrandScale] = useState<'enterprise' | 'micro'>('enterprise');
  
  const [recentBrands, setRecentBrands] = useState([
    { name: 'Apple', score: 0.82 },
    { name: 'Tesla', score: -0.31 },
    { name: 'Nike', score: 0.65 },
    { name: 'OpenAI', score: 0.91 },
    { name: 'Google', score: 0.42 },
  ]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [activeBrand]);

  const handleSearch = (brand: string) => {
    setActiveBrand(brand);
    if (!recentBrands.find(b => b.name.toLowerCase() === brand.toLowerCase())) {
      setRecentBrands([{ name: brand, score: 0.00 }, ...recentBrands].slice(0, 8));
    }
  };

  // Generate consistent mock data based on brand name length & characters
  const generateBrandData = (brand: string) => {
    const hash = brand.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Score between -1.0 and 1.0
    const normalizedHash = (hash % 200) / 100 - 1; 
    let score = brand === 'Tesla' ? -0.31 : brand === 'Apple' ? 0.82 : normalizedHash;
    score = Number(score.toFixed(2));
    
    const mentions = brandScale === 'micro' 
      ? 4 + (hash % 22) 
      : 1000 + (hash * 13 % 25000);
    
    const emotions = ['Joy', 'Surprise', 'Anticipation', 'Trust', 'Anger', 'Fear', 'Sadness', 'Disgust'];
    let dominantEmotion = emotions[hash % emotions.length];
    if (score > 0.5) dominantEmotion = 'Joy';
    if (score < -0.2) dominantEmotion = 'Anger';

    let alertLevel = 'Normal';
    if (score < -0.5) alertLevel = 'Critical';
    else if (score < 0) alertLevel = 'Watch';
    else if (brandScale === 'enterprise' && mentions > 20000) alertLevel = 'Trending';
    else if (brandScale === 'micro' && mentions > 20) alertLevel = 'Active';

    return { score, mentions, dominantEmotion, alertLevel };
  };

  const brandData = generateBrandData(activeBrand);

  return (
    <div className="flex h-screen bg-canvas text-text-main overflow-hidden">
      {!isFocusMode && (
        <Sidebar 
          activeBrand={activeBrand} setActiveBrand={setActiveBrand} 
          activeNav={activeNav} setActiveNav={setActiveNav}
          recentBrands={recentBrands} setRecentBrands={setRecentBrands}
        />
      )}
      
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${isFocusMode ? 'bg-canvas' : ''}`}>
        <DashboardTopbar 
          activeAlgo={activeAlgo} 
          setActiveAlgo={setActiveAlgo}
          onSearch={handleSearch}
          activeNav={activeNav}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          brandScale={brandScale}
          setBrandScale={setBrandScale}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 scrollbar-hide">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-accent/20 border-t-patina rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className={`mx-auto space-y-6 ${isFocusMode ? 'max-w-[1200px]' : 'max-w-[1600px]'}`}>
              {activeNav === 'overview' && (
                <>
                  {/* Global Alerts inside Dashboard */}
                  <CounterNarrative activeBrand={activeBrand} brandScale={brandScale} />
                  <GoldenHourAlert activeBrand={activeBrand} />

                  {/* Shift Detector directly above KPI row */}
                  <ShiftDetector activeBrand={activeBrand} brandScale={brandScale} />

                  {/* Micro-Brand Mode Banner */}
                  {brandScale === 'micro' && (
                    <div className="bg-[#FFFFFF]/70 backdrop-blur border border-[#CAA287]/25 border-l-[3px] border-l-[#2C6C73] rounded-xl p-4 mb-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">💡</span>
                        <div>
                          <h4 className="font-display font-bold text-text-main text-xs uppercase tracking-wider">Micro-Brand Mode Active</h4>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            For startups or local storefronts, web volume may be low. Populate this dashboard with local listings, emails, or surveys using the <button onClick={() => setActiveNav('test-brand')} className="underline text-patina font-semibold hover:text-teal transition-colors">Test Your Brand</button> suite.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KPI Row (Now includes ViralityScore) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                    <div>
                      <KPICard title="Overall Score" value={brandData.score} type="score" brandName={activeBrand} />
                    </div>
                    <div>
                      <KPICard 
                        title="Mentions" 
                        value={brandData.mentions} 
                        sub={brandScale === 'micro' ? "Total tracked feedback" : "Last 24 hours"} 
                        type="count" 
                      />
                    </div>
                    <div>
                      <ViralityScore brandScale={brandScale} />
                    </div>
                    <div>
                      <KPICard title="Dominant Emotion" value={brandData.dominantEmotion} type="emotion" />
                    </div>
                    <div>
                      <KPICard title="Alert Level" value={brandData.alertLevel} type="alert" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="lg:col-span-2 bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                      <h3 className="text-lg font-display font-bold text-text-main mb-4">Sentiment Timeline</h3>
                      <div className="flex-1 min-h-[240px] w-full">
                        <SentimentTimeline />
                      </div>
                    </div>
                    {/* Replaced SourceDonut with SentimentFingerprint on Overview */}
                    <SentimentFingerprint activeBrand={activeBrand} />
                  </div>
                </>
              )}

              {/* Timeline Tab */}
              {activeNav === 'timeline' && (
                <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm h-[600px] flex flex-col">
                  <h3 className="text-lg font-display font-bold text-text-main mb-4">Sentiment Timeline (Expanded)</h3>
                  <div className="flex-1 w-full">
                    <SentimentTimeline />
                  </div>
                </div>
              )}

              {/* Emotions Tab */}
              {activeNav === 'emotions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm">
                    <h3 className="text-lg font-display font-bold text-text-main mb-4">Emotion Breakdown</h3>
                    <EmotionBarChart />
                  </div>
                  <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm flex flex-col">
                    <h3 className="text-lg font-display font-bold text-text-main mb-4 flex items-center gap-2">
                      <span className="text-yellow-500">⚡</span> Emotion Insights
                    </h3>
                    <p className="text-text-muted/80 text-sm mb-4">Deeper analysis of specific emotional triggers. (Connects to Groq AI emotion-specific endpoint)</p>
                    <GroqInsights brand={activeBrand} />
                  </div>
                </div>
              )}

              {/* Sources Tab */}
              {activeNav === 'sources' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-display font-bold text-text-main mb-4">Source Distribution</h3>
                    <div className="flex-1 flex items-center justify-center">
                      <SourceDonut />
                    </div>
                  </div>
                  <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-display font-bold text-text-main mb-4 flex justify-between items-center">
                      Live Feed
                      <span className="flex items-center text-xs font-mono text-positive bg-positive/10 px-2 py-0.5 rounded border border-positive/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-positive mr-1 animate-pulse"></span>
                        LIVE
                      </span>
                    </h3>
                    <LiveMentionFeed />
                  </div>
                </div>
              )}

              {/* Topics / Algorithms Tab */}
              {activeNav === 'topics' && (
                <div className="bg-surface rounded-2xl border border-accent/20 p-5 shadow-sm">
                  <h3 className="text-lg font-display font-bold text-text-main mb-4">Algorithm Scores & Topics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Ensemble", type: "Weighted Blend", score: 0.82, pos: 65, neu: 25, neg: 10, active: activeAlgo === 'Ensemble' },
                      { name: "VADER", type: "Lexicon-Based", score: 0.71, pos: 55, neu: 30, neg: 15, active: activeAlgo === 'VADER' },
                      { name: "BERT", type: "Transformer", score: 0.85, pos: 68, neu: 22, neg: 10, active: activeAlgo === 'BERT' },
                      { name: "TextBlob", type: "Rule-Based", score: 0.62, pos: 50, neu: 35, neg: 15, active: activeAlgo === 'TextBlob' },
                      { name: "RoBERTa", type: "Transformer", score: 0.89, pos: 70, neu: 20, neg: 10, active: activeAlgo === 'RoBERTa' },
                      { name: "Groq AI", type: "LLM (Llama 3)", score: 0.91, pos: 72, neu: 18, neg: 10, active: activeAlgo === 'Groq AI' },
                    ].map((algo) => (
                      <div key={algo.name}>
                        <AlgorithmScoreCard {...algo} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {activeNav === 'alerts' && (
                <AlertsPanel activeBrand={activeBrand} />
              )}

              {/* Compare Tab */}
              {activeNav === 'compare' && (
                <ComparePanel activeBrand={activeBrand} recentBrands={recentBrands} />
              )}

              {/* Test Your Brand Tab */}
              {activeNav === 'test-brand' && (
                <TestYourBrandPanel 
                  activeBrand={activeBrand}
                  setActiveBrand={setActiveBrand}
                  setActiveNav={setActiveNav}
                  recentBrands={recentBrands}
                  setRecentBrands={setRecentBrands}
                />
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
