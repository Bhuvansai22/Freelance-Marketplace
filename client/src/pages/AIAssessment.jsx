import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import useAuthStore, { api } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Cpu, 
  BookOpen, 
  Code, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  FileCheck,
  Zap,
  HelpCircle,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  Activity
} from 'lucide-react';

const AIAssessment = () => {
  const { user } = useAuthStore();
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [history, setHistory] = useState([]);
  const [skills, setSkills] = useState([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedSkillToTest, setSelectedSkillToTest] = useState('');
  
  // UI Flow States: 'landing' | 'generating' | 'testing' | 'submitting' | 'result'
  const [flowState, setFlowState] = useState('landing');
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: userAnswer }
  const [gradingResult, setGradingResult] = useState(null);
  
  // Toggle states for results panel
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const generationSteps = [
    'Parsing profile skills and resume matrices...',
    'Synthesizing specialized engineering prompts...',
    'Drafting 5 Easy, 5 Moderate & 5 Expert difficulty questions...',
    'Injecting coding compilers and system design scenarios...',
    'Assembling your secure testing workspace...'
  ];

  const gradingSteps = [
    'Compiling submitted code structures...',
    'Cross-referencing syntax templates & correctness...',
    'Scoring open-ended theory explanations...',
    'Analyzing problem-solving patterns on scenario cases...',
    'Synthesizing skill matrices and constructive feedback...'
  ];

  useEffect(() => {
    fetchActiveAssessment();
    fetchHistory();
  }, []);

  useEffect(() => {
    let interval;
    if (flowState === 'generating' || flowState === 'submitting') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 5);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [flowState]);

  const fetchActiveAssessment = async () => {
    try {
      const response = await api.get('/ai-assessments/active');
      if (response.data) {
        setActiveAssessment(response.data);
        setSkills(response.data.skills);
        const prefilledAnswers = {};
        if (response.data.answers) {
          response.data.answers.forEach(ans => {
            prefilledAnswers[ans.questionIndex] = ans.userAnswer;
          });
        }
        setAnswers(prefilledAnswers);
        setFlowState('testing');
      } else {
        const profileSkills = Array.isArray(user?.skills) ? user.skills : [];
        const recommendedSkills = Array.isArray(user?.resumeAnalysis?.recommendedSkills) 
          ? user.resumeAnalysis.recommendedSkills 
          : [];
        const combined = [...profileSkills, ...recommendedSkills]
          .map(s => s.trim())
          .filter((v, i, self) => v && self.indexOf(v) === i);
        setSkills(combined.length > 0 ? combined : ['JavaScript', 'React', 'Node.js']);
      }
    } catch (error) {
      console.error('Error fetching active assessment:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/ai-assessments/history');
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleGenerate = async () => {
    setFlowState('generating');
    try {
      const response = await api.post('/ai-assessments/generate', { selectedSkill: selectedSkillToTest });
      setActiveAssessment(response.data);
      setSkills(response.data.skills);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setFlowState('testing');
      toast.success(selectedSkillToTest ? `AI ${selectedSkillToTest} Assessment generated successfully!` : 'AI Assessment generated successfully!');
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast.error(error.response?.data?.message || 'Could not generate assessment. Please try again.');
      setFlowState('landing');
    }
  };

  const handleAnswerSelect = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredIndices = [];
    activeAssessment.questions.forEach((q, idx) => {
      if (answers[idx] === undefined || answers[idx] === '') {
        unansweredIndices.push(idx + 1);
      }
    });

    if (unansweredIndices.length > 0) {
      toast.error(`Please answer all questions first. Unanswered: ${unansweredIndices.join(', ')}`);
      return;
    }

    setFlowState('submitting');
    
    const formattedAnswers = Object.entries(answers).map(([key, val]) => ({
      questionIndex: parseInt(key),
      userAnswer: val.toString()
    }));

    try {
      const response = await api.post('/ai-assessments/submit', {
        assessmentId: activeAssessment._id,
        answers: formattedAnswers
      });
      setGradingResult(response.data);
      setFlowState('result');
      fetchHistory();
      toast.success(response.data.passed ? 'Congratulations! You passed the assessment!' : 'Assessment completed!');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Grading failed. Please re-submit.');
      setFlowState('testing');
    }
  };

  const toggleQuestionExpand = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'moderate': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'expert': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getFormatBadge = (type) => {
    switch (type) {
      case 'mcq': return { label: 'MCQ Choice', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'theory': return { label: 'Theory Concept', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'coding': return { label: 'Coding IDE', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'scenario': return { label: 'System Design', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
      default: return { label: 'Technical Item', color: 'text-slate-400 bg-slate-500/10' };
    }
  };

  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== '').length;
  const progressPercentage = activeAssessment ? Math.round((answeredCount / activeAssessment.questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white">
      <Navbar />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative">
        {/* Dynamic visual aura mesh blobs */}
        <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <AnimatePresence mode="wait">
          
          {/* STATE 1: PREMIUM SPLIT-PANEL LANDING SCREEN */}
          {flowState === 'landing' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Split Layout Container */}
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                
                {/* Left Side: Brand presentation and features */}
                <div className="lg:col-span-7 space-y-8 text-left">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-300 border border-indigo-500/20 shadow-inner">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" /> AI Skill Verification Center
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                      Prove Your Competence. <br />
                      <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Get Client Trust Instantly.</span>
                    </h1>
                    <p className="text-slate-450 text-base sm:text-lg leading-relaxed max-w-2xl">
                      A smart, adaptive examination system that scans your resume skills and generates dynamic coding, scenario, and conceptual questions. Pass to acquire official verified checkmark badges visible directly on your marketplace profile.
                    </p>
                  </div>

                  {/* Feature Highlights List */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">Resume Adaptive Generator</h4>
                        <p className="text-xs text-slate-450 leading-normal">Tailored questions targeting your exact development tools.</p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 shrink-0">
                        <Code className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">Full Coding & Design Modules</h4>
                        <p className="text-xs text-slate-450 leading-normal">Solve algorithmic inputs, theory briefs, and system architectures.</p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/20 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">Verified Gilded Badging</h4>
                        <p className="text-xs text-slate-450 leading-normal">Pass 70% threshold to obtain checkmarks on your profile.</p>
                      </div>
                    </div>

                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-white">Comprehensive AI Critique</h4>
                        <p className="text-xs text-slate-450 leading-normal">Receive detailed analytical feedback to master your stack.</p>
                      </div>
                    </div>
                  </div>

                  {/* Targeted Skill Verification Deck */}
                  <div className="space-y-4 pt-6 border-t border-slate-900">
                    <div className="flex flex-col space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block font-mono">Certification Hub</span>
                      <h3 className="text-base font-extrabold text-white">Select a specific skill to verify and earn its badge</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        Click on any technical skill detected from your resume or profile below. We will compile a targeted exam focusing specifically on that tool!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {skills.map((skill, idx) => {
                        const isVerified = Array.isArray(user?.verifiedBadges) && user.verifiedBadges.some(b => b.toLowerCase().trim() === skill.toLowerCase().trim() || b.toLowerCase().trim().includes(skill.toLowerCase().trim()));
                        const isSelected = selectedSkillToTest === skill;
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedSkillToTest(isSelected ? '' : skill)}
                            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-2 select-none relative overflow-hidden group ${
                              isSelected 
                                ? 'bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 border-indigo-550 shadow-md shadow-indigo-500/5' 
                                : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <span className="text-xs font-black text-white group-hover:text-indigo-300 transition-colors">{skill}</span>
                              {isVerified ? (
                                <span className="p-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  <Award className="w-3.5 h-3.5 text-amber-500" />
                                </span>
                              ) : (
                                <span className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                  isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-800 bg-slate-950'
                                } flex items-center justify-center`}>
                                  {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold">
                              {isVerified ? (
                                <span className="text-amber-400 flex items-center gap-1">💎 VERIFIED</span>
                              ) : (
                                <span className={isSelected ? 'text-indigo-400' : 'text-slate-500 font-medium'}>
                                  {isSelected ? 'READY TO START' : 'UNVERIFIED'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Futuristic Terminal Launch Console */}
                <div className="lg:col-span-5">
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px] group">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="space-y-6">
                      {/* Console Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-indigo-400" />
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">CONTROL CONSOLE</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">ONLINE</span>
                        </div>
                      </div>

                      {/* Stats Overview Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total length</span>
                          <div className="text-lg font-black text-white flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-indigo-400" /> 15 Questions
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Evaluation Modules</span>
                          <div className="text-lg font-black text-white flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-violet-400" /> 4 Formats
                          </div>
                        </div>

                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60 col-span-2 space-y-1">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Adaptive Syllabus</span>
                          <div className="text-xs font-bold text-slate-350 leading-relaxed">
                            Includes 5 Easy, 5 Moderate, and 5 Expert questions across coding & architecture.
                          </div>
                        </div>
                      </div>

                      {/* Mock Shell Terminal */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 font-mono text-[11px] text-slate-400 space-y-2 leading-relaxed select-none">
                        <div className="text-indigo-400">&gt; scan --target freelancer_profile</div>
                        <div>... complete. {skills.length} technical skills found.</div>
                        <div className="text-indigo-400">&gt; verify --threshold --require</div>
                        <div>... 70% passing parameter required for gilded badging.</div>
                        <div className="text-violet-400">&gt; system ready to initialize...</div>
                      </div>
                    </div>

                    {/* Launch Trigger */}
                    <div className="pt-6">
                      <button
                        onClick={handleGenerate}
                        className="relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-600 font-bold text-sm text-white shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer overflow-hidden group flex items-center justify-center gap-2"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Cpu className="w-4.5 h-4.5 animate-pulse" /> {selectedSkillToTest ? `Start ${selectedSkillToTest} Exam` : 'Start Mixed Skill Exam'}
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* Completed History List */}
              {history.length > 0 && (
                <div className="max-w-5xl mx-auto space-y-6 pt-12 border-t border-slate-900/60">
                  <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-5.5 h-5.5 text-indigo-450" /> Completed Verification Runs
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {history.map((h, idx) => (
                      <div key={idx} className="bg-slate-900/30 backdrop-blur-sm p-6 rounded-3xl border border-slate-900/80 flex items-center justify-between hover:border-slate-800/80 hover:bg-slate-900/40 transition-all group">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">Assessment Attempt #{history.length - idx}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                              h.passed 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {h.passed ? 'PASSED & VERIFIED' : 'COMPLETED'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-450">
                            Run on {new Date(h.completedAt).toLocaleDateString()} &bull; Score: <span className="font-bold text-white">{h.totalScore}%</span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setGradingResult(h);
                            setFlowState('result');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
                        >
                          Review Sheet
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STATE 2: GENERATING LOADER */}
          {flowState === 'generating' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-8 py-24"
            >
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-fuchsia-500 animate-spin" />
                <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                  <Cpu className="w-10 h-10 text-indigo-400 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center space-y-4 w-full">
                <h3 className="text-2xl font-black text-white">Synthesizing Exam Papers</h3>
                <p className="text-slate-400 text-sm h-6 transition-all duration-500 font-medium">
                  {generationSteps[loadingStep]}
                </p>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-indigo-550 via-violet-550 to-fuchsia-550 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(loadingStep + 1) * 20}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 3: INTERACTIVE TESTING WIZARD */}
          {flowState === 'testing' && activeAssessment && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Question Workspace Panel (Left col) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Status Bar */}
                <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-sm border border-indigo-500/20">
                      {currentQuestionIndex + 1}
                    </span>
                    <div className="space-y-0.5 text-left">
                      <div className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Verification Workspace</div>
                      <div className="text-xs font-black text-white">
                        Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      getDifficultyColor(activeAssessment.questions[currentQuestionIndex].difficulty)
                    }`}>
                      {activeAssessment.questions[currentQuestionIndex].difficulty}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      getFormatBadge(activeAssessment.questions[currentQuestionIndex].type).color
                    }`}>
                      {getFormatBadge(activeAssessment.questions[currentQuestionIndex].type).label}
                    </span>
                  </div>
                </div>

                {/* Main Question Card */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 md:p-8 shadow-xl min-h-[420px] flex flex-col justify-between space-y-6 text-left">
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Technical Prompt</span>
                      <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                        {activeAssessment.questions[currentQuestionIndex].questionText}
                      </h2>
                    </div>

                    {/* RENDER DYNAMIC ANSWER FORMATS */}
                    <div className="w-full pt-2">
                      
                      {/* MCQ */}
                      {activeAssessment.questions[currentQuestionIndex].type === 'mcq' && (
                        <div className="grid gap-3">
                          {activeAssessment.questions[currentQuestionIndex].options.map((option, optIdx) => {
                            const isSelected = answers[currentQuestionIndex] === optIdx.toString();
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerSelect(optIdx.toString())}
                                className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${
                                  isSelected 
                                    ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-lg' 
                                    : 'bg-slate-950/40 border-slate-800/80 text-slate-350 hover:bg-slate-900/80 hover:border-slate-700 hover:text-white'
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                                    isSelected 
                                      ? 'bg-indigo-500 text-white' 
                                      : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800 group-hover:text-slate-300'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  {option}
                                </span>
                                {isSelected && <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* THEORY */}
                      {activeAssessment.questions[currentQuestionIndex].type === 'theory' && (
                        <div className="space-y-2">
                          <textarea
                            value={answers[currentQuestionIndex] || ''}
                            onChange={(e) => handleAnswerSelect(e.target.value)}
                            placeholder="Write your explanation here..."
                            rows={8}
                            className="w-full p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm font-medium text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all leading-relaxed"
                          />
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" /> Answer will be graded on clarity and accuracy.
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {(answers[currentQuestionIndex] || '').length} characters
                            </span>
                          </div>
                        </div>
                      )}

                      {/* CODING */}
                      {activeAssessment.questions[currentQuestionIndex].type === 'coding' && (
                        <div className="space-y-3">
                          <div className="rounded-2xl border border-slate-805 overflow-hidden bg-slate-950 flex flex-col shadow-inner">
                            {/* IDE Header */}
                            <div className="bg-slate-900/60 px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">editor console</span>
                              <Code className="w-4.5 h-4.5 text-slate-600" />
                            </div>

                            {/* IDE Area */}
                            <div className="relative flex min-h-[240px]">
                              {/* Line Numbers */}
                              <div className="w-10 bg-slate-950 text-right pr-2 select-none border-r border-slate-900 py-3 font-mono text-xs text-slate-700 leading-relaxed">
                                {Array.from({ length: 10 }).map((_, i) => <div key={i}>{i+1}</div>)}
                              </div>
                              {/* Editor */}
                              <textarea
                                value={answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : activeAssessment.questions[currentQuestionIndex].codeSnippet}
                                onChange={(e) => handleAnswerSelect(e.target.value)}
                                placeholder="// Write your code snippet here..."
                                className="flex-1 p-3 bg-transparent text-white font-mono text-xs leading-relaxed focus:outline-none resize-none"
                              />
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-550 flex items-center gap-1 px-1">
                            <HelpCircle className="w-3.5 h-3.5" /> Ensure code syntax matches requirements and handles edge cases.
                          </span>
                        </div>
                      )}

                      {/* SCENARIO */}
                      {activeAssessment.questions[currentQuestionIndex].type === 'scenario' && (
                        <div className="space-y-2">
                          <textarea
                            value={answers[currentQuestionIndex] || ''}
                            onChange={(e) => handleAnswerSelect(e.target.value)}
                            placeholder="Detail your system design strategy, tools selected, and analytical approach..."
                            rows={8}
                            className="w-full p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-sm font-medium text-white placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all leading-relaxed"
                          />
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5" /> Graded on scaling constraints, architecture choice, and security factors.
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {(answers[currentQuestionIndex] || '').length} characters
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Navigation Panel */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-6">
                    <button
                      onClick={handlePrev}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        currentQuestionIndex === 0 
                          ? 'border-slate-850 text-slate-600 cursor-not-allowed' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                      }`}
                    >
                      <ArrowLeft className="w-4 h-4" /> Previous
                    </button>

                    {currentQuestionIndex === activeAssessment.questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-600 text-white shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
                      >
                        Submit Test <Zap className="w-4.5 h-4.5 animate-pulse text-yellow-300" />
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>

              </div>

              {/* Sidebar Navigator (Right col) */}
              <div className="space-y-6">
                
                {/* Info Card */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 space-y-4 text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-4.5 h-4.5 text-indigo-400" /> Progress Status
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-450">
                      <span>Questions Answered</span>
                      <span className="text-white">{answeredCount} / {activeAssessment.questions.length}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-900 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-500 leading-relaxed space-y-1.5 border-t border-slate-800/85">
                    <p>&bull; Make sure to evaluate your answers completely before submitting.</p>
                    <p>&bull; Empty fields will not compile and fail the grading check.</p>
                  </div>
                </div>

                {/* Dynamic Questions Navigation Grid */}
                <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 space-y-4 text-left">
                  <h3 className="text-sm font-bold text-white">Questions Tracker</h3>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {activeAssessment.questions.map((q, idx) => {
                      const isCurrent = idx === currentQuestionIndex;
                      const hasAnswer = answers[idx] !== undefined && answers[idx] !== '';
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer border ${
                            isCurrent 
                              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 scale-110 shadow-lg' 
                              : hasAnswer 
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:border-indigo-500/30' 
                                : 'bg-slate-950 border-slate-850 text-slate-550 hover:border-slate-700 hover:text-slate-350'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* STATE 4: SUBMITTING / GRADING LOADER */}
          {flowState === 'submitting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-8 py-24"
            >
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-fuchsia-500 animate-spin" />
                <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                  <Zap className="w-10 h-10 text-indigo-400 animate-bounce" />
                </div>
              </div>
              
              <div className="text-center space-y-4 w-full">
                <h3 className="text-2xl font-black text-white">AI Grading Engine Active</h3>
                <p className="text-slate-400 text-sm h-6 transition-all duration-500 font-medium">
                  {gradingSteps[loadingStep]}
                </p>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-fuchsia-550 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(loadingStep + 1) * 20}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 5: DETAILED RESULTS REPORT CARD */}
          {flowState === 'result' && gradingResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Scorecard Summary Panel */}
              <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-850 p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  
                  {/* SVG score meter with glowing drop shadow */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="relative w-28 h-28 shrink-0 drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle 
                          cx="50" cy="50" r="42" 
                          className="stroke-slate-850 fill-none" 
                          strokeWidth="8"
                        />
                        <circle 
                          cx="50" cy="50" r="42" 
                          className={`fill-none transition-all duration-1000 ${
                            gradingResult.passed ? 'stroke-emerald-400' : 'stroke-rose-400'
                          }`}
                          strokeWidth="8"
                          strokeDasharray="263.89"
                          strokeDashoffset={263.89 - (263.89 * (gradingResult.totalScore || 0)) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">{gradingResult.totalScore}%</span>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">score</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-2xl font-black text-white">Skill Verification Sheet</h2>
                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          gradingResult.passed 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/5' 
                            : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                        }`}>
                          {gradingResult.passed ? 'PASSED & VERIFIED' : 'COMPLETED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                        {gradingResult.passed 
                          ? 'Exceptional! You have crossed our threshold parameter. Your targeted resume skills have been successfully verified and checkmark status tags have been added directly to your profile badge list.' 
                          : 'Run completed. You did not cross the 70% threshold required for instant badging. Review the feedback breakdown and run the test again when ready.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0 md:pl-8">
                    {gradingResult.passed && (
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="flex-1 md:flex-none py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-4 h-4 text-yellow-350" /> View Certificate
                      </button>
                    )}
                    <button
                      onClick={() => setFlowState('landing')}
                      className="flex-1 md:flex-none py-3.5 px-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white hover:bg-slate-800/80 transition-all cursor-pointer text-center shadow-md"
                    >
                      Console Hub
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="flex-1 md:flex-none py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-600 text-xs font-black text-white shadow-lg hover:scale-[1.02] active:scale-98 transition-all cursor-pointer text-center"
                    >
                      New Test Run
                    </button>
                  </div>

                </div>

                {/* verified skill checklist if passed */}
                {gradingResult.passed && (
                  <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-wrap items-center gap-3 text-left">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 animate-bounce" /> Profile badges awarded:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 shadow-sm">
                          <Check className="w-3.5 h-3.5" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-Panel: Tech Ratings & Suggestions */}
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Tech Ratings Panel (Left col) */}
                <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/85 p-6 space-y-4 text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Cpu className="w-4.5 h-4.5 text-indigo-400" /> Technology Ratings
                  </h3>
                  <div className="space-y-3">
                    {gradingResult.skillRatings && gradingResult.skillRatings.map((sr, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">{sr.skill}</span>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                          sr.rating === 'Expert' 
                            ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' 
                            : sr.rating === 'Intermediate' 
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {sr.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expandable Question-by-Question breakdown (Right col) */}
                <div className="lg:col-span-2 space-y-4 text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
                    <HelpCircle className="w-4.5 h-4.5 text-indigo-400" /> Detailed Code Review
                  </h3>
                  
                  <div className="space-y-3">
                    {activeAssessment?.questions.map((q, idx) => {
                      const evalItem = gradingResult.evaluation && gradingResult.evaluation.find(e => e.questionIndex === idx);
                      const isExpanded = !!expandedQuestions[idx];
                      const uAns = gradingResult.answers && gradingResult.answers.find(a => a.questionIndex === idx)?.userAnswer || '';
                      
                      return (
                        <div 
                          key={idx} 
                          className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden"
                        >
                          {/* Accordion Header */}
                          <button
                            onClick={() => toggleQuestionExpand(idx)}
                            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/60 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-xs font-bold ${
                                evalItem?.isCorrect 
                                  ? 'bg-emerald-500/10 text-emerald-400' 
                                  : 'bg-rose-500/10 text-rose-450'
                              }`}>
                                {evalItem?.isCorrect ? <Check className="w-4.5 h-4.5" /> : <X className="w-4.5 h-4.5" />}
                              </span>
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Question {idx + 1} &bull; {q.difficulty}</span>
                                <p className="text-xs font-bold text-slate-200 line-clamp-1 max-w-sm sm:max-w-md">{q.questionText}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-black text-slate-400">{evalItem?.score || 0} / 100</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                            </div>
                          </button>

                          {/* Accordion Body */}
                          {isExpanded && (
                            <div className="p-4 bg-slate-950/40 border-t border-slate-850 space-y-4 text-xs">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-450 uppercase text-[9px] tracking-wider block">Question:</span>
                                <p className="text-slate-350 leading-relaxed">{q.questionText}</p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-450 uppercase text-[9px] tracking-wider block">Your Submission:</span>
                                {q.type === 'mcq' ? (
                                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold max-w-lg">
                                    {q.options[parseInt(uAns)] || `Option Index ${uAns}`}
                                  </div>
                                ) : q.type === 'coding' ? (
                                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner">{uAns}</pre>
                                ) : (
                                  <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-350 leading-relaxed">{uAns}</p>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-450 uppercase text-[9px] tracking-wider block">Ideal Solution:</span>
                                {q.type === 'coding' ? (
                                  <pre className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 text-slate-400 font-mono text-[11px] overflow-x-auto leading-relaxed">{q.idealAnswer}</pre>
                                ) : (
                                  <p className="p-3 rounded-xl bg-slate-900/40 border border-slate-850 text-slate-400 leading-relaxed">{q.idealAnswer}</p>
                                )}
                              </div>

                              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
                                <span className="font-black text-indigo-400 uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                                  <Cpu className="w-3.5 h-3.5" /> Evaluator Critique:
                                </span>
                                <p className="text-slate-300 leading-relaxed font-medium">{evalItem?.feedback || 'No feedback compiled.'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Certificate of Competence Modal Overlay */}
          {showCertificate && gradingResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative max-w-4xl w-full rounded-3xl p-1 bg-gradient-to-tr from-amber-500/30 via-slate-800 to-indigo-500/30 shadow-2xl overflow-hidden print-page"
              >
                {/* Print media custom CSS rules */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    .print-page, .print-page * {
                      visibility: visible;
                    }
                    .print-page {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                      border: none;
                      background: white !important;
                      color: black !important;
                    }
                    .print-hide {
                      display: none !important;
                    }
                  }
                `}} />

                {/* Gilded Inner Border Frame */}
                <div className="bg-slate-950 p-8 sm:p-12 rounded-[22px] border border-slate-900/60 relative overflow-hidden flex flex-col items-center text-center space-y-8 select-none">
                  
                  {/* Visual Certificate Watermark Seal */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-indigo-500/[0.015] border border-indigo-500/[0.03] rounded-full pointer-events-none flex items-center justify-center">
                    <Cpu className="w-44 h-44 text-indigo-500/[0.03]" />
                  </div>

                  {/* Top Crest */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-md">
                      <Award className="w-9 h-9 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Official Verification Credential</span>
                      <h1 className="text-xl sm:text-2.5xl font-black text-white uppercase tracking-wider font-serif">Certificate of Technical Excellence</h1>
                    </div>
                  </div>

                  {/* Verification Statement */}
                  <div className="space-y-4 max-w-2xl relative z-10">
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">This document certifies that</p>
                    <h2 className="text-2.5xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent py-1">{user?.name || 'Professional Developer'}</h2>
                    <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-indigo-500 mx-auto rounded-full" />
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      has successfully validated technical capabilities in software architecture, design patterns, and programming implementations. By passing the AI-driven resume adaptive evaluation module, the candidate has proved proficiency to work on high-value client projects.
                    </p>
                  </div>

                  {/* Score & Skill Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-xl relative z-10">
                    <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Grading Grade</span>
                      <div className="text-lg font-black text-white flex items-center justify-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" /> {gradingResult.totalScore}% Score
                      </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4 space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Credential Status</span>
                      <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> VERIFIED
                      </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4 space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Verified On</span>
                      <div className="text-xs font-bold text-slate-305 py-1">
                        {new Date(gradingResult.completedAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Verified Skills Tag Deck */}
                  <div className="space-y-2.5 max-w-lg z-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-550 block">Verified Stack</span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[9px] font-black text-amber-400 shadow-sm flex items-center gap-1">
                          <Check className="w-3 h-3 text-amber-500" /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Signature Seals Block */}
                  <div className="flex justify-between items-end w-full border-t border-slate-900 pt-8 mt-4 gap-6 text-left max-w-2xl relative z-10">
                    <div className="space-y-1">
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Verification ID:</div>
                      <div className="font-mono text-xs font-bold text-slate-400 select-all">CERT-AI-{gradingResult._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-0.5">
                        <div className="font-black text-xs text-white">Antigravity AI Engine</div>
                        <div className="text-[9px] text-slate-400 font-semibold">Verification Seal System</div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-indigo-500/30 bg-indigo-500/5 flex items-center justify-center text-indigo-400 font-mono text-[10px] font-black">
                        AG
                      </div>
                    </div>
                  </div>

                  {/* Print & Close Control Buttons */}
                  <div className="flex justify-center items-center gap-3 w-full border-t border-slate-900/60 pt-6 mt-2 print-hide z-20">
                    <button
                      onClick={() => window.print()}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-xs font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Download Certificate / Print PDF
                    </button>
                    <button
                      onClick={() => setShowCertificate(false)}
                      className="py-2.5 px-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIAssessment;
