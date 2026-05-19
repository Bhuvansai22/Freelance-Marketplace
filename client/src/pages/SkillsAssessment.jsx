import { useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, XCircle, ChevronRight, Clock, Star, Loader2 } from 'lucide-react';

const topics = [
  { id: 'javascript', name: 'JavaScript Core', desc: 'Variables, loops, functions, scopes, closures, arrays and OOP principles.', reward: 'JavaScript Verified Badge' },
  { id: 'react', name: 'React.js Fundamentals', desc: 'Virtual DOM, state management, components lifecycle, hooks, context API.', reward: 'React Developer Badge' },
  { id: 'html-css', name: 'HTML & CSS Design', desc: 'Semantic tags, SEO foundation, Box model, Flexbox, Grid, Responsive web design.', reward: 'Web Stylist Badge' },
];

const SkillsAssessment = () => {
  const [activeTopic, setActiveTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedIndex }
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const startQuiz = async (topicId) => {
    setIsLoading(true);
    setActiveTopic(topicId);
    setResult(null);
    setCurrentIdx(0);
    setSelectedAnswers({});
    try {
      const response = await api.get(`/assessments/${topicId}`);
      setQuestions(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch assessment questions.');
      setActiveTopic(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIdx,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = questions.map(q => ({
        questionId: q._id,
        selectedOptionIndex: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : -1,
      }));

      const response = await api.post(`/assessments/${activeTopic}/submit`, {
        answers: answersPayload,
      });
      setResult(response.data);
    } catch (error) {
      alert('Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-primary w-8 h-8" />
            Skills Verification Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Pass these topic quizzes with 70%+ score to earn instant verification badges for your profile!</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Main Dashboard Topics */}
          {!activeTopic && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {topics.map((topic) => (
                <div key={topic.id} className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                      <Star className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{topic.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{topic.desc}</p>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mb-4 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                      <span className="font-semibold block text-slate-500 dark:text-slate-300">Reward:</span>
                      {topic.reward}
                    </div>
                    <button
                      onClick={() => startQuiz(topic.id)}
                      className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-1"
                    >
                      Take Quiz <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Quiz Screen */}
          {activeTopic && !result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-primary w-8 h-8" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Preparing assessment questions...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white capitalize">{activeTopic.replace('-', ' ')} Assessment</h3>
                      <p className="text-xs text-slate-400">Total Questions: {questions.length}</p>
                    </div>
                    <button
                      onClick={() => setActiveTopic(null)}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Exit Test
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-8">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question */}
                  {questions[currentIdx] && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        <span className="text-primary mr-1">Q{currentIdx + 1}.</span> {questions[currentIdx].question}
                      </h4>

                      <div className="grid grid-cols-1 gap-3">
                        {questions[currentIdx].options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(questions[currentIdx]._id, oIdx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm flex items-center justify-between ${
                              selectedAnswers[questions[currentIdx]._id] === oIdx
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs">
                              {selectedAnswers[questions[currentIdx]._id] === oIdx && '✓'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      disabled={currentIdx === 0}
                      onClick={handlePrev}
                      className="px-5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {currentIdx < questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit Assessment'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Result Screen */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 max-w-md mx-auto"
            >
              <div className="flex justify-center">
                {result.passed ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full">
                    <CheckCircle className="w-16 h-16" />
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full">
                    <XCircle className="w-16 h-16" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {result.passed ? 'Congratulations!' : 'Test Failed'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {result.passed 
                    ? `You passed the assessment with a score of ${result.score}%!`
                    : `You scored ${result.score}%, but you need at least 70% to pass.`
                  }
                </p>
              </div>

              <div className="py-4 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-around text-sm font-semibold">
                <div>
                  <span className="text-slate-400 text-xs block uppercase">Correct Answers</span>
                  <span className="text-lg text-slate-900 dark:text-white">{result.correctCount} / {result.totalQuestions}</span>
                </div>
                <div className="border-l border-slate-200 dark:border-slate-800" />
                <div>
                  <span className="text-slate-400 text-xs block uppercase">Status</span>
                  <span className={`text-lg uppercase ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTopic(null)}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition"
              >
                Back to Verification Center
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SkillsAssessment;
