import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { api } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Briefcase, 
  Globe, 
  BookOpen,  
  Award, 
  Check, 
  Loader2, 
  RefreshCw, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoadingPast, setIsLoadingPast] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const stepsList = [
    'Parsing uploaded PDF resume content...',
    'Scanning technical skills & experience keyword indices...',
    'Comparing profile with freelance market demands...',
    'Analyzing GitHub repositories & portfolio readiness...',
    'Generating hiring readiness and career path details...',
    'Synthesizing final feedback visual metrics...'
  ];

  // Fetch saved resume analysis on mount
  useEffect(() => {
    const fetchPastAnalysis = async () => {
      try {
        const response = await api.get('/ai/resume-analysis');
        if (response.data) {
          setAnalysisData(response.data);
        }
      } catch (error) {
        console.error('Error fetching past resume analysis:', error);
      } finally {
        setIsLoadingPast(false);
      }
    };
    fetchPastAnalysis();
  }, []);

  // Cycle loader steps during analysis
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setAnalysisSteps((prev) => {
          if (prev < stepsList.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2500);
    } else {
      setAnalysisSteps(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF resumes are supported.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    setFile(selectedFile);
    toast.success(`${selectedFile.name} ready for analysis!`);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please select or upload a resume file first.');
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/ai/analyze-resume', formData);
      setAnalysisData(response.data);
      toast.success('Resume analysis completed successfully!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error(
        error.response?.data?.message || 'Error occurred during resume analysis.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisData(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500/30';
    if (score >= 60) return 'text-amber-500 border-amber-500/30';
    return 'text-rose-500 border-rose-500/30';
  };

  const getReadinessBadgeStyle = (readiness) => {
    switch (readiness) {
      case 'Expert':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg tech-grid relative overflow-hidden pb-12">
      {/* Background glowing vectors */}
      <div className="glow-blob bg-primary/10 w-[400px] h-[400px] top-[10%] left-[-10%]" />
      <div className="glow-blob bg-secondary/10 w-[450px] h-[450px] bottom-[15%] right-[-10%]" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 page-fade-in relative z-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-primary w-8 h-8" />
              AI Resume Analyzer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Upload your PDF resume to receive instantaneous feedback, project matches, and market readiness insights.
            </p>
          </div>
          {analysisData && (
            <button
              onClick={handleReset}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Analyze Another
            </button>
          )}
        </div>

        {/* Loading Past Analysis */}
        {isLoadingPast && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Checking profile analysis records...</p>
          </div>
        )}

        {/* Dynamic Screens */}
        {!isLoadingPast && (
          <AnimatePresence mode="wait">
            {/* SCREEN 1: UPLOAD ZONE (No analysis exists) */}
            {!analysisData && !isAnalyzing && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-xl mx-auto"
              >
                <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-8 glass-panel text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload your PDF Resume</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                    We only support PDF files. Max size is 5MB. Let our AI map your technical skills to standard industry standards.
                  </p>

                  {/* Drag and Drop Container */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-file-input').click()}
                    className={`border-2 border-dashed rounded-2xl p-8 mb-6 cursor-pointer transition-all duration-300 ${
                      isDragOver
                        ? 'border-primary bg-primary/5 scale-[0.98]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-primary animate-bounce" />
                        <span className="text-slate-800 dark:text-slate-200 font-bold text-sm truncate max-w-[320px]">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                          Drag and drop your PDF here
                        </p>
                        <p className="text-xs text-slate-400">or click to browse local files</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleAnalyze}
                    disabled={!file}
                    className="w-full py-3.5 bg-gradient-to-tr from-primary to-secondary text-white font-bold rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Start AI Analysis
                  </button>
                </div>
              </motion.div>
            )}

            {/* SCREEN 2: DYNAMIC AI PROCESSOR LOADER */}
            {isAnalyzing && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto py-12"
              >
                <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-8 text-center glass-panel">
                  <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                    {/* Ring Pulse outer */}
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
                    <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-primary/50 animate-spin" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Resume...</h3>
                  <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-bold text-primary">
                    Hirenova Intelligent Parsing
                  </p>

                  {/* Step Checker */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 text-left space-y-3 shadow-inner">
                    {stepsList.map((step, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs font-semibold transition-all duration-300 ${
                          idx < analysisSteps
                            ? 'text-emerald-500'
                            : idx === analysisSteps
                            ? 'text-primary'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {idx < analysisSteps ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        ) : idx === analysisSteps ? (
                          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[9px] flex-shrink-0">
                            {idx + 1}
                          </div>
                        )}
                        <span className={idx === analysisSteps ? 'font-bold' : ''}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCREEN 3: INTERACTIVE REPORT DASHBOARD */}
            {analysisData && !isAnalyzing && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* COLUMN 1: SIDEBAR STAT CARDS */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Score & Badge Card */}
                  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-6 glass-panel relative overflow-hidden text-center">
                    <div className="tech-centerpiece scale-50 opacity-20 absolute top-[-25%] left-[-25%]" />
                    
                    <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-wider mb-4 inline-block">
                      Core Evaluation
                    </span>

                    {/* Circular Score display */}
                    <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          className="stroke-slate-100 dark:stroke-slate-800"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          className={`transition-all duration-1000 ${
                            analysisData.score >= 80
                              ? 'stroke-emerald-500'
                              : analysisData.score >= 60
                              ? 'stroke-amber-500'
                              : 'stroke-rose-500'
                          }`}
                          strokeWidth="8"
                          strokeDasharray={427}
                          strokeDashoffset={427 - (427 * analysisData.score) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                          {analysisData.score}
                        </span>
                        <span className="text-xs text-slate-400 block font-bold mt-1">out of 100</span>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-4">
                      Hiring Readiness Level
                    </h4>
                    
                    <div className="mt-3 flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black capitalize tracking-wide ${getReadinessBadgeStyle(analysisData.hiringReadiness)}`}>
                        <Award className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                        {analysisData.hiringReadiness}
                      </span>
                    </div>

                    <p className="text-slate-450 dark:text-slate-400 text-xs mt-4 px-2 leading-relaxed">
                      {analysisData.hiringReadiness === 'Expert'
                        ? 'Excellent profile! Your resume showcases advanced architectural insights. Highly competitive in the freelance market.'
                        : analysisData.hiringReadiness === 'Intermediate'
                        ? 'Great profile with working competencies. Resolving missing technical badges will skyrocket your matching potential.'
                        : 'Great potential! As a fresher or beginner, building targeted portfolio items is your absolute best path to landing your first job.'}
                    </p>
                  </div>

                  {/* Missing Technical Skills list */}
                  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-6 glass-panel">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      Missing Technical Skills
                    </h3>
                    {analysisData.missingSkills && analysisData.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {analysisData.missingSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-xl font-bold transition-all duration-200 hover:bg-rose-500/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-450 dark:text-slate-400">
                        Awesome! No glaring missing technical skills identified.
                      </p>
                    )}
                  </div>
                </div>

                {/* COLUMN 2: TABBED ANALYSIS SECTIONS */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Tab Navigation Header */}
                  <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-1.5 flex gap-1 shadow-sm overflow-x-auto">
                    {[
                      { id: 'overview', name: 'Improvement Steps', icon: TrendingUp },
                      { id: 'portfolio', name: 'Portfolio Projects', icon: Briefcase },
                      { id: 'profiles', name: 'GitHub & Links', icon: Globe },
                      { id: 'learning', name: 'Learning Path', icon: BookOpen }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 flex-shrink-0 cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content Display */}
                  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-6 glass-panel min-h-[380px]">
                    <AnimatePresence mode="wait">
                      {/* 1. Improvements Tab */}
                      {activeTab === 'overview' && (
                        <motion.div
                          key="improvements"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <TrendingUp className="text-primary w-5 h-5" />
                              Resume Document Improvements
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Actionable modifications to increase applicant tracking system matching score.
                            </p>
                          </div>

                          <div className="space-y-3.5">
                            {analysisData.improvements && analysisData.improvements.length > 0 ? (
                              analysisData.improvements.map((imp, idx) => (
                                <div
                                  key={idx}
                                  className="flex gap-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl text-sm"
                                >
                                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <p className="text-slate-800 dark:text-slate-300 font-bold leading-relaxed">{imp}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400">No suggestions needed. Your layout is top tier.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* 2. Portfolio suggestions Tab */}
                      {activeTab === 'portfolio' && (
                        <motion.div
                          key="portfolio"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <Briefcase className="text-primary w-5 h-5" />
                              Custom Portfolio Projects
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Targeted development projects designed to prove your capability to clients.
                            </p>
                          </div>

                          <div className="space-y-3.5">
                            {analysisData.portfolioSuggestions && analysisData.portfolioSuggestions.length > 0 ? (
                              analysisData.portfolioSuggestions.map((project, idx) => (
                                <div
                                  key={idx}
                                  className="flex gap-3.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl text-sm"
                                >
                                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center text-xs font-black flex-shrink-0 shadow-sm shadow-primary/20">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm mb-1">
                                      Project Suggestion {idx + 1}
                                    </h4>
                                    <p className="text-slate-800 dark:text-slate-350 leading-relaxed font-bold">
                                      {project}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-450">No new portfolio suggestions found.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* 3. Link optimization Tab */}
                      {activeTab === 'profiles' && (
                        <motion.div
                          key="profiles"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <Globe className="text-primary w-5 h-5" />
                              GitHub & Online Profile Optimization
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Tips to optimize linked online records to build automatic client trust.
                            </p>
                          </div>

                          <div className="space-y-3.5">
                            {analysisData.profileLinkSuggestions && analysisData.profileLinkSuggestions.length > 0 ? (
                              analysisData.profileLinkSuggestions.map((tip, idx) => (
                                <div
                                  key={idx}
                                  className="flex gap-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 p-4 rounded-2xl text-sm"
                                >
                                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  </div>
                                  <p className="text-slate-800 dark:text-slate-350 leading-relaxed font-bold">{tip}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-450">Profile configurations look perfect.</p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* 4. Structured learning path Tab */}
                      {activeTab === 'learning' && (
                        <motion.div
                          key="learning"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <BookOpen className="text-primary w-5 h-5" />
                              Recommended Learning Path
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Structured timeline guide to learn target technologies and level up your ranking.
                            </p>
                          </div>

                          {/* Skill recommendation badge line */}
                          <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
                            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-2.5">
                              Technologies to Learn Next
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {analysisData.recommendedSkills && analysisData.recommendedSkills.length > 0 ? (
                                analysisData.recommendedSkills.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-primary/10 text-primary border border-primary/20 text-xs px-2.5 py-1 rounded-xl font-black"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400">Keep refining your core stacks.</span>
                              )}
                            </div>
                          </div>

                          {/* Interactive list path steps */}
                          <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800/80 ml-3">
                            {[
                              {
                                title: 'Step 1: Tackle Missing Market Skills',
                                desc: `Dedicate time to master the recommended technologies (e.g. ${
                                  analysisData.recommendedSkills?.[0] || 'TypeScript'
                                }). Create small prototype projects demonstrating basic integrations.`
                              },
                              {
                                title: 'Step 2: Construct the Recommended Portfolio Projects',
                                desc: 'Develop at least one high-complexity project suggested in your Portfolio Projects tab. Showcase it prominently in your profile.'
                              },
                              {
                                title: 'Step 3: Revise Resume Details',
                                desc: 'Integrate the document layout suggestions. Highlight your newly acquired tools and link your highly polished projects.'
                              },
                              {
                                title: 'Step 4: Pass verification Badges',
                                desc: 'Once ready, navigate to the Assessments Tab and pass verification badges to acquire visual accolades for your public profile.'
                              }
                            ].map((step, idx) => (
                              <div key={idx} className="relative space-y-1">
                                {/* Bullet indicator dot */}
                                <div className="absolute -left-[24.5px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-dark-bg border-2 border-primary flex items-center justify-center shadow-sm">
                                  <ArrowRight className="w-2 h-2 text-primary" />
                                </div>
                                <h4 className="font-black text-slate-900 dark:text-white text-xs leading-none">
                                  {step.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-1 pt-0.5">
                                  {step.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default ResumeAnalyzer;
