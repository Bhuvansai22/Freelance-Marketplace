import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../store/authStore';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  Sparkles, 
  Briefcase, 
  User, 
  Award,
  ShieldCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIChatbotWidget = ({ userRole = 'freelancer', onProjectClick, onFreelancerClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: userRole === 'freelancer' 
        ? "Hello! I am your AI Career Assistant. 🚀 I scan our live project database to match you with top clients. Ask me anything or try one of the quick suggestions below!"
        : "Hello! I am your AI Recruitment Coordinator. 💎 I scan our certified expert registry to find verified developers. Ask me anything or use our quick prompt shortcuts!",
      suggestions: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickPrompts = userRole === 'freelancer' 
    ? [
        { label: "Find React projects 🚀", text: "Show me open projects requiring React" },
        { label: "List Node.js jobs 🟢", text: "Show me open projects requiring Node.js" },
        { label: "How to earn verified badge? 🏆", text: "How do I earn a verified skill badge?" }
      ]
    : [
        { label: "Find React experts 🚀", text: "Show me verified freelancers with React skills" },
        { label: "Node.js developers 🟢", text: "Find verified freelancers with Node.js skills" },
        { label: "How does verification work? 💎", text: "How does the freelancer verification system work?" }
      ];

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    if (!textToSend) setInputValue('');

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chatbot', { message: query });
      const botReply = response.data;

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botReply.reply || "I'm having trouble analyzing the data. Please try another query!",
        suggestions: botReply.suggestions || []
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('AI Assistant is temporarily busy.');
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Apologies! I encountered a momentary connection hiccup. Please ask again in a second!",
        suggestions: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="glass-card mb-4 w-[360px] sm:w-[400px] h-[520px] rounded-[30px] border border-slate-200/50 dark:border-slate-800/80 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary via-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-[-50%] left-[-20%] w-[100px] h-[100px] bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-2.5 z-10">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-md">
                  <Bot className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <h3 className="font-bold text-xs leading-none tracking-wide flex items-center gap-1">
                    Hirenova AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" />
                  </h3>
                  <span className="text-[9px] text-emerald-300 font-extrabold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Database Connected
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition border border-white/10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {messages.map((msg, index) => (
                <div key={index} className="space-y-2">
                  <div className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[78%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-800/50'
                      }`}
                    >
                      {/* Simple markdown parsing fallback inside render */}
                      <div className="whitespace-pre-wrap">
                        {msg.text.split('\n').map((line, i) => {
                          let formattedLine = line;
                          // Bold match **text**
                          if (formattedLine.includes('**')) {
                            const parts = formattedLine.split('**');
                            return (
                              <span key={i} className="block mt-0.5">
                                {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-slate-950 dark:text-white">{p}</strong> : p)}
                              </span>
                            );
                          }
                          // Bullet points
                          if (formattedLine.trim().startsWith('* ')) {
                            return (
                              <span key={i} className="block pl-3 relative mt-0.5">
                                <span className="absolute left-0 top-[6px] w-1 h-1 rounded-full bg-primary"></span>
                                {formattedLine.trim().slice(2)}
                              </span>
                            );
                          }
                          return <span key={i} className="block mt-0.5">{formattedLine}</span>;
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pl-9 flex gap-3 overflow-x-auto py-1 scrollbar-none snap-x snap-mandatory">
                      {msg.suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (item.type === 'project' && onProjectClick) {
                              onProjectClick(item.id);
                            } else if (item.type === 'freelancer' && onFreelancerClick) {
                              onFreelancerClick(item.id, item.title);
                            }
                          }}
                          className="snap-start shrink-0 w-[200px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer text-left space-y-2 relative group overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-indigo-500"></div>
                          
                          <div className="flex items-center gap-1.5">
                            {item.type === 'project' ? (
                              <Briefcase className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-indigo-500" />
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {item.type === 'project' ? 'Project Match' : 'Verified Expert'}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate group-hover:text-primary transition">
                            {item.title}
                          </h4>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {item.tags?.slice(0, 2).map((tag, tIdx) => (
                              <span key={tIdx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase border border-slate-200/50 dark:border-slate-700/50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl rounded-tl-none border border-slate-200/30 dark:border-slate-800/50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AI is analyzing database...</span>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>

            {/* Quick Prompts Container */}
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-t border-slate-150 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20 scrollbar-none shrink-0">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(prompt.text)}
                  disabled={isLoading}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-extrabold rounded-full transition shadow-sm"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            {/* Footer Input */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={userRole === 'freelancer' ? 'Find Client projects by skill...' : 'Search verified specialists...'}
                disabled={isLoading}
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary/20 focus:ring-1 focus:ring-primary/20 rounded-2xl px-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none transition"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="w-9 h-9 rounded-2xl bg-primary hover:bg-primary/95 text-white flex items-center justify-center transition disabled:opacity-40 shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-500 text-white flex items-center justify-center shadow-2xl relative border border-white/20 transition-all focus:outline-none group overflow-hidden"
      >
        {/* Glow effect */}
        <span className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition duration-300"></span>
        <span className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-full blur opacity-40 animate-pulse group-hover:opacity-60 z-[-1]"></span>
        
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbotWidget;
