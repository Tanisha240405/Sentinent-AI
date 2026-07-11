import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, File, X, Info } from 'lucide-react';
import KPICard from '../KPICard';
import SentimentTimeline from '../SentimentTimeline';
import SourceDonut from '../SourceDonut';
import EmotionBarChart from '../EmotionBarChart';
import LiveMentionFeed from '../LiveMentionFeed';
import AlgorithmScoreCard from '../AlgorithmScoreCard';
import GroqInsights from '../GroqInsights';

interface DocumentMeta {
  document_type: string;
  brand_subject: string | null;
  usable_fields: string[];
  skipped_fields: string[];
  language: string;
  estimated_entries: number;
  has_timestamps: boolean;
  has_ratings: boolean;
  quality_score: number;
  missing: Array<{
    field: string;
    severity: string;
    reason: string;
    alternatives: string[];
  }>;
  summary: string;
}

interface TestYourBrandPanelProps {
  activeBrand: string;
  setActiveBrand: (b: string) => void;
  setActiveNav: (n: string) => void;
  recentBrands: Array<{ name: string; score: number }>;
  setRecentBrands: (brands: Array<{ name: string; score: number }>) => void;
}

export default function TestYourBrandPanel({ activeBrand, setActiveBrand, setActiveNav, recentBrands, setRecentBrands }: TestYourBrandPanelProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'diagnosis' | 'ready'>('idle');
  const [processingStage, setProcessingStage] = useState(0);
  const [documentMeta, setDocumentMeta] = useState<DocumentMeta | null>(null);
  const [uploadBrand, setUploadBrand] = useState('');
  
  // Paste State
  const [pasteText, setPasteText] = useState('');
  const [pasteBrand, setPasteBrand] = useState('');
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'processing' | 'diagnosis' | 'ready'>('idle');

  // Shared State
  const [jobId, setJobId] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [algorithms, setAlgorithms] = useState([
    { id: 'Ensemble', active: true },
    { id: 'VADER', active: true },
    { id: 'BERT', active: true },
    { id: 'TextBlob', active: true },
    { id: 'RoBERTa', active: true },
    { id: 'Groq AI', active: true }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Processing Simulation ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uploadStatus === 'processing' || pasteStatus === 'processing') {
      let stage = 0;
      interval = setInterval(() => {
        stage += 1;
        setProcessingStage(stage);
        if (stage >= 5) {
          clearInterval(interval);
        }
      }, 800); // mock timing
    }
    return () => clearInterval(interval);
  }, [uploadStatus, pasteStatus]);

  const toggleAlgorithm = (id: string) => {
    setAlgorithms(algs => algs.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  // --- Handlers ---
  const handleFileChange = async (file: File) => {
    setFileError('');
    if (file.size > 50 * 1024 * 1024) {
      setFileError("File too large. Maximum size is 50MB.");
      return;
    }
    
    setSelectedFile(file);
    setUploadStatus('processing');
    setProcessingStage(1);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('http://localhost:8000/api/test/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        setFileError(data.detail || "Error uploading file.");
        setUploadStatus('idle');
        setSelectedFile(null);
        return;
      }
      
      setDocumentMeta(data.document_meta);
      setJobId(data.job_id);
      setUploadStatus(data.status); // 'diagnosis' or 'ready'
    } catch (err) {
      setFileError("Failed to connect to server.");
      setUploadStatus('idle');
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Helper: add brand to sidebar and redirect to overview
  const addBrandAndRedirect = (brandName: string, score: number) => {
    const normalizedName = brandName.trim();
    if (!normalizedName) return;
    
    // Add or update the brand in the sidebar list
    const exists = recentBrands.find(b => b.name.toLowerCase() === normalizedName.toLowerCase());
    if (exists) {
      // Update the score for existing brand
      setRecentBrands(recentBrands.map(b => 
        b.name.toLowerCase() === normalizedName.toLowerCase() 
          ? { ...b, score } 
          : b
      ));
    } else {
      setRecentBrands([{ name: normalizedName, score }, ...recentBrands].slice(0, 8));
    }
    
    // Set active brand and redirect to overview
    setActiveBrand(normalizedName);
    setActiveNav('overview');
  };

  const handlePasteAnalyze = async () => {
    if (pasteText.length < 20) return;
    setPasteStatus('processing');
    setProcessingStage(1);

    try {
      const res = await fetch('http://localhost:8000/api/test/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText, brand: pasteBrand || null, algorithms: algorithms.filter(a => a.active).map(a => a.id) })
      });
      const data = await res.json();
      if (!res.ok) {
        setPasteStatus('idle');
        return;
      }
      setDocumentMeta(data.document_meta);
      setJobId(data.job_id);
      
      // Auto-run analysis immediately and redirect
      const brandName = pasteBrand || data.document_meta?.brand_subject || 'Custom Analysis';
      const analyzeRes = await fetch('http://localhost:8000/api/test/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_id: data.job_id, 
          brand: pasteBrand || null,
          algorithms: algorithms.filter(a => a.active).map(a => a.id) 
        })
      });
      
      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        addBrandAndRedirect(brandName, analyzeData.overall_score);
      } else {
        setPasteStatus('diagnosis');
      }
    } catch (err) {
      setPasteStatus('idle');
    }
  };

  const runAnalysis = async () => {
    if (!jobId) return;
    setIsAnalyzing(true);
    
    const brandName = activeTab === 'paste' 
      ? (pasteBrand || documentMeta?.brand_subject || 'Custom Analysis') 
      : (uploadBrand || documentMeta?.brand_subject || selectedFile?.name?.replace(/\.[^.]+$/, '') || 'Custom Analysis');
    
    try {
      const res = await fetch('http://localhost:8000/api/test/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_id: jobId, 
          brand: activeTab === 'paste' ? pasteBrand : uploadBrand,
          algorithms: algorithms.filter(a => a.active).map(a => a.id) 
        })
      });
      
      if (!res.ok) {
        setIsAnalyzing(false);
        return;
      }
      
      const data = await res.json();
      
      // Add brand to sidebar and redirect to overview for insights
      addBrandAndRedirect(brandName, data.overall_score);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setDocumentMeta(null);
    setFileError('');
    setUploadBrand('');
  };

  const resetAll = () => {
    resetUpload();
    setPasteText('');
    setPasteBrand('');
    setPasteStatus('idle');
    setJobId(null);
    setAnalysisResults(null);
    setIsAnalyzing(false);
    setUploadBrand('');
  };

  const renderProcessingState = () => {
    const stages = [
      "Starting...",
      "Reading your document...",
      "Understanding structure and content...",
      "Identifying sentiment-bearing text...",
      "Checking for missing information...",
      "Building your analysis preview..."
    ];
    const progress = Math.min((processingStage / 5) * 100, 100);

    return (
      <div className="w-full flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="w-full max-w-md bg-canvas/50 rounded-full h-1.5 mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#54668E] to-[#879EC6] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[#879EC6] text-[13px] font-medium font-inter">
          {stages[processingStage] || stages[5]}
        </p>
      </div>
    );
  };

  const renderDiagnosisCard = (meta: DocumentMeta) => {
    const isGood = meta.quality_score >= 0.4;
    const isAmber = !isGood || (meta.missing && meta.missing.length > 0);

    return (
      <div className={`mt-6 bg-[#21243A] rounded-[14px] border border-l-4 shadow-sm ${isAmber ? 'border-[#FCD34D] border-y-accent/20 border-r-accent/20' : 'border-[#879EC6]/12'}`}>
        <div className="p-6">
          <h3 className="font-display font-bold text-[#F5F6E6] text-xl mb-6">
            {isGood ? "Here's what we found" : "We read your document — here's what we found"}
          </h3>

          {isGood ? (
            <>
              {/* Outcome A: Good Document */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-canvas p-4 rounded-lg border border-accent/10">
                  <p className="text-[10px] font-bold tracking-widest text-text-muted/70 uppercase mb-1">DOCUMENT TYPE</p>
                  <p className="font-display font-bold text-lg text-text-main capitalize">{meta.document_type.replace('_', ' ')}</p>
                  <p className="text-xs text-text-muted mt-1">Detected automatically ▾</p>
                </div>
                <div className="bg-canvas p-4 rounded-lg border border-accent/10">
                  <p className="text-[10px] font-bold tracking-widest text-text-muted/70 uppercase mb-1">ENTRIES FOUND</p>
                  <p className="font-display font-black text-2xl text-text-main">{meta.estimated_entries}</p>
                  <p className="text-xs text-text-muted mt-1">Text units ready for analysis</p>
                </div>
                <div className="bg-canvas p-4 rounded-lg border border-accent/10">
                  <p className="text-[10px] font-bold tracking-widest text-text-muted/70 uppercase mb-1">LANGUAGE</p>
                  <p className="font-display font-bold text-lg text-text-main">{meta.language}</p>
                  <p className="text-xs text-text-muted mt-1">99% confidence</p>
                </div>
                <div className="bg-canvas p-4 rounded-lg border border-accent/10">
                  <p className="text-[10px] font-bold tracking-widest text-text-muted/70 uppercase mb-1">DATA QUALITY</p>
                  <p className={`font-display font-black text-2xl ${meta.quality_score >= 0.75 ? 'text-[#6EE7B7]' : meta.quality_score >= 0.5 ? 'text-[#879EC6]' : 'text-[#FCD34D]'}`}>
                    {Math.round(meta.quality_score * 100)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-text-main mb-2">Fields used:</h4>
                  {meta.usable_fields.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-text-muted mb-1">
                      <CheckCircle size={14} className="text-positive" /> {f}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-main mb-2">Fields skipped:</h4>
                  {meta.skipped_fields.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-text-muted/70 mb-1">
                      <X size={14} className="text-text-muted shrink-0 mt-0.5" /> 
                      <span>{f} <span className="opacity-50"></span></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-l-2 border-[#879EC6] pl-4 py-1 mb-8">
                <p className="italic font-inter text-[13px] text-text-muted/90">{meta.summary}</p>
              </div>

            </>
          ) : (
            <>
              {/* Outcome B: Issues */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-positive shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm text-text-main leading-relaxed">{meta.summary}</p>
                      <p className="text-xs text-text-muted mt-1">Estimated {meta.estimated_entries} text entries across the document</p>
                    </div>
                  </div>
                </div>

                {meta.usable_fields && meta.usable_fields.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="text-positive" size={18} />
                      <span className="text-sm font-medium text-text-main">These parts are ready for analysis:</span>
                    </div>
                    <ul className="pl-7 space-y-2">
                      {meta.usable_fields.map(f => (
                        <li key={f} className="text-xs text-text-muted">
                          <span className="font-semibold text-text-main">{f}</span>
                          <div className="font-mono text-[11px] text-[#879EC6] mt-1 bg-canvas p-2 rounded">
                            Preview content not available in mock...
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {meta.missing && meta.missing.length > 0 && (
                  <div className="border-t border-accent/10 pt-4 space-y-4">
                    {meta.missing.map((m, idx) => (
                      <div key={idx} className="pb-4 border-b border-accent/10 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={m.severity === 'required' ? 'text-negative' : m.severity === 'recommended' ? 'text-[#FCD34D]' : 'text-text-muted'} size={18} />
                          <span className="font-semibold text-sm text-text-main">{m.field}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            m.severity === 'required' ? 'bg-negative/10 text-negative' : 
                            m.severity === 'recommended' ? 'bg-[#FCD34D]/10 text-[#FCD34D]' : 
                            'bg-surface-alt text-text-muted'
                          }`}>{m.severity}</span>
                        </div>
                        <p className="text-sm text-text-muted pl-7 mb-2">{m.reason}</p>
                        {m.alternatives && m.alternatives.length > 0 && (
                          <div className="pl-7">
                            <span className="text-xs font-semibold text-text-main">Alternatives:</span>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                              {m.alternatives.map((alt, i) => (
                                <li key={i} className="text-xs text-text-muted">{alt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4">
                  <button onClick={resetUpload} className="px-4 py-2 rounded-lg border border-accent/30 text-sm font-medium text-text-main hover:bg-surface-alt transition-colors">
                    Upload a different file
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-accent/30 text-sm font-medium text-text-main hover:bg-surface-alt transition-colors">
                    Fill in missing info
                  </button>
                  {(meta.quality_score >= 0.2 && !meta.missing.some(m => m.severity === 'required')) && (
                    <button onClick={runAnalysis} className="px-4 py-2 rounded-lg border border-[#879EC6]/30 text-sm font-medium text-[#879EC6] hover:bg-[#879EC6]/10 transition-colors" title="Results may be limited — some charts will not be available">
                      Continue anyway
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Algorithm Selector for Good Doc */}
          {isGood && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {algorithms.map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => toggleAlgorithm(algo.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      algo.active 
                        ? 'bg-[#54668E] border-[#59598E] text-[#F5F6E6]' 
                        : 'bg-transparent border-[#879EC6]/30 text-[#879EC6] hover:bg-[#879EC6]/10'
                    }`}
                  >
                    {algo.id} {algo.active && <CheckCircle size={12} className="inline ml-1 opacity-70" />}
                  </button>
                ))}
              </div>
              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-3 bg-patina text-[#F5F6E6] rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(45,212,191,0.2)] ${
                  isAnalyzing ? 'opacity-70 cursor-wait' : 'hover:bg-patina/90'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis →'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };


  // --- Render Results View ---
  if (analysisResults) {
    return (
      <div className="w-full animate-fade-in">
        <div className="bg-[#879EC6]/10 border border-[#879EC6]/20 rounded-[10px] w-full p-3 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-[#F5F6E6]">
            <span>{activeTab === 'upload' ? '📂' : '✏️'}</span>
            <span className="font-semibold text-white">Analyzing:</span>
            <span className="text-[#879EC6]">{analysisResults.filename}</span>
            <span className="text-[#879EC6]/50 mx-1">·</span>
            <span className="text-[#879EC6]">{analysisResults.entries} {activeTab === 'upload' ? 'entries' : 'characters'}</span>
            {activeTab === 'upload' && (
              <>
                <span className="text-[#879EC6]/50 mx-1">·</span>
                <span className="text-[#879EC6] capitalize">{analysisResults.document_type.replace('_', ' ')}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={resetAll} className="text-xs font-medium text-[#879EC6] hover:text-[#F5F6E6] transition-colors">
              ← {activeTab === 'upload' ? 'Run a new file' : 'Analyze another'}
            </button>
          </div>
        </div>

        {/* MOCK DASHBOARD RENDER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
          <div><KPICard title="Overall Score" value={analysisResults.score} type="score" brandName="Custom" /></div>
          <div><KPICard title="Entries Analyzed" value={analysisResults.entries} type="count" sub="" /></div>
          <div><KPICard title="Dominant Emotion" value={analysisResults.dominantEmotion} type="emotion" brandName="Custom" /></div>
          <div><KPICard title="Alert Level" value={analysisResults.alertLevel} type="alert" brandName="Custom" /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-accent/20 p-5 flex flex-col relative">
            <h3 className="text-lg font-display font-bold text-text-main mb-4">Sentiment Timeline</h3>
            {!analysisResults.has_timestamps ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm z-10 rounded-2xl border border-accent/20">
                <Info className="text-text-muted mb-2 opacity-50" size={32} />
                <p className="text-sm font-medium text-text-muted">No timestamps in source file — timeline unavailable</p>
              </div>
            ) : null}
            <div className="flex-1 min-h-[240px] w-full"><SentimentTimeline /></div>
          </div>
          <div className="bg-surface rounded-2xl border border-accent/20 p-5"><h3 className="text-lg font-display font-bold text-text-main mb-4">Emotion Breakdown</h3><EmotionBarChart /></div>
        </div>
      </div>
    );
  }

  // --- Render Main View (Upload/Paste) ---
  return (
    <div className="max-w-[800px] mx-auto pt-4 animate-fade-in pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text-main tracking-tight mb-2">Test Your Brand</h1>
        <p className="text-text-muted">Analyze sentiment from your own files or text — same 6-algorithm engine, your data.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex mb-8">
        <div className="flex p-1 border-2 border-[#879EC6]/20 rounded-[10px] relative overflow-hidden bg-transparent">
          {/* Active Slider */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-gradient-to-r from-[#54668E] to-[#59598E] transition-transform duration-200 ease-out`}
            style={{ transform: `translateX(${activeTab === 'upload' ? '0' : '100%'})` }}
          />
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors w-[150px] justify-center ${activeTab === 'upload' ? 'text-[#F5F6E6]' : 'text-[#879EC6] hover:text-[#879EC6]'}`}
          >
            📂 Upload File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors w-[150px] justify-center ${activeTab === 'paste' ? 'text-[#F5F6E6]' : 'text-[#879EC6] hover:text-[#879EC6]'}`}
          >
            ✏️ Paste or Type
          </button>
        </div>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'upload' && (
        <div>
          {/* Upload Dropzone Card */}
          <div className="bg-[#21243A] rounded-[14px] border border-[#879EC6]/12 overflow-hidden shadow-sm">
            {uploadStatus === 'processing' ? (
              renderProcessingState()
            ) : selectedFile && (uploadStatus === 'diagnosis' || uploadStatus === 'ready') ? (
              <div className="p-8 flex items-center justify-between border-b border-[#879EC6]/10 bg-[#21243A]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#879EC6]/10 flex items-center justify-center">
                    <File className="text-[#879EC6]" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-main">{selectedFile.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={resetUpload} className="text-[#879EC6] hover:bg-[#879EC6]/10 p-2 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div 
                  className={`border-2 border-dashed rounded-2xl py-12 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                    isDragging 
                      ? 'border-[#879EC6] bg-[#879EC6]/10 scale-[1.015]' 
                      : 'border-[#879EC6]/35 hover:border-[#879EC6]/50 bg-transparent'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="text-[#879EC6] mb-4 stroke-[1.5]" size={40} />
                  <p className="font-display font-bold text-lg text-[#F5F6E6] mb-2">Drop your file here</p>
                  <p className="text-[13px] font-medium text-[#879EC6] mb-6 font-inter">CSV · Excel · PDF · TXT · DOCX · JSON</p>
                  <button className="px-4 py-2 rounded-lg border border-[#879EC6]/30 text-sm font-medium text-[#879EC6] hover:bg-[#879EC6]/10 transition-colors">
                    or browse files
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv,.xlsx,.xls,.pdf,.txt,.docx,.doc,.json"
                    onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  />
                </div>
                {fileError && <p className="text-[#F87171] text-sm mt-3 text-center">{fileError}</p>}
              </div>
            )}
          </div>

          {/* Brand Name Input for File Upload */}
          {selectedFile && (uploadStatus === 'diagnosis' || uploadStatus === 'ready') && (
            <div className="mt-4 bg-[#21243A] rounded-[14px] border border-[#879EC6]/12 p-5">
              <label className="block font-inter font-medium text-[12px] text-[#879EC6] mb-2">
                What brand is this file about?
              </label>
              <input
                type="text"
                value={uploadBrand}
                onChange={(e) => setUploadBrand(e.target.value)}
                placeholder="Brand or product name (optional — helps with better insights)"
                className="w-full bg-surface border border-accent/30 rounded-lg px-4 py-2 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-patina transition-colors shadow-sm"
              />
            </div>
          )}
          
          {(!selectedFile || uploadStatus === 'idle') && (
            <p className="text-center text-[11px] font-inter text-[#879EC6]/55 mt-4">
              Your file is processed in memory and never stored on our servers. Raw content is discarded immediately after analysis.
            </p>
          )}

          {/* Outcome UI */}
          {(uploadStatus === 'diagnosis' || uploadStatus === 'ready') && documentMeta && (
            renderDiagnosisCard(documentMeta)
          )}
        </div>
      )}

      {activeTab === 'paste' && (
        <div className="bg-[#21243A] rounded-[14px] border border-[#879EC6]/12 shadow-sm p-6">
          {pasteStatus === 'processing' ? (
            renderProcessingState()
          ) : pasteStatus === 'diagnosis' && documentMeta ? (
            renderDiagnosisCard(documentMeta)
          ) : (
            <>
              <label className="block font-inter font-semibold text-[13px] text-[#879EC6] mb-3">
                Paste reviews, feedback, or any text
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="w-full min-h-[220px] bg-white/5 border-[1.5px] border-[#879EC6]/25 rounded-xl p-4 font-inter text-sm text-[#F5F6E6] placeholder-text-muted/50 focus:border-[#879EC6] focus:ring-4 focus:ring-[#879EC6]/10 outline-none resize-y transition-all"
                placeholder="Paste customer reviews, survey responses, feedback emails, social comments, or any text you want to analyze...&#10;&#10;Tip: separate multiple reviews with a blank line for better per-entry scoring."
                maxLength={50000}
              />
              <div className="flex justify-end mt-2 mb-6">
                <span className={`font-inter text-[11px] ${
                  pasteText.length > 49900 ? 'text-[#F87171]' : pasteText.length > 45000 ? 'text-[#FCD34D]' : 'text-[#879EC6]/50'
                }`}>
                  {pasteText.length.toLocaleString()} / 50,000 characters
                </span>
              </div>

              <div className="mb-6">
                <label className="block font-inter font-medium text-[12px] text-[#879EC6] mb-2">
                  What brand is this feedback about?
                </label>
                <input
                  type="text"
                  value={pasteBrand}
                  onChange={(e) => setPasteBrand(e.target.value)}
                  placeholder="Brand or product name (optional — helps Groq give better insights)"
                  className="w-full bg-surface border border-accent/30 rounded-lg px-4 py-2 text-sm text-text-main placeholder-text-muted/40 focus:outline-none focus:border-patina transition-colors shadow-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {algorithms.map(algo => (
                  <button
                    key={algo.id}
                    onClick={() => toggleAlgorithm(algo.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      algo.active 
                        ? 'bg-[#54668E] border-[#59598E] text-[#F5F6E6]' 
                        : 'bg-transparent border-[#879EC6]/30 text-[#879EC6] hover:bg-[#879EC6]/10'
                    }`}
                  >
                    {algo.id} {algo.active && <CheckCircle size={12} className="inline ml-1 opacity-70" />}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePasteAnalyze}
                disabled={pasteText.length < 20}
                className={`w-full py-3 bg-patina text-[#F5F6E6] rounded-xl font-bold transition-all ${
                  pasteText.length < 20 ? 'opacity-40 pointer-events-none' : 'hover:bg-patina/90 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                }`}
              >
                Analyze Text →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
