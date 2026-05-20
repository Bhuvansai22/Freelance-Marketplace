import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  LogOut, 
  User, 
  Briefcase, 
  PlusCircle, 
  CheckCircle, 
  Menu, 
  X, 
  Sun, 
  Moon,
  LayoutDashboard,
  MessageSquare,
  Bell,
  ChevronDown,
  Sparkles,
  Award,
  Cpu
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout, hasUnreadMessages, setHasUnreadMessages } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Track any theme updates applied elsewhere
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-dark-surface/90 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20">
                HN
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Hirenova
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {user.role === 'client' ? (
                <>
                  <Link 
                    to="/client-dashboard" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/client-dashboard') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
                  </Link>
                  <Link 
                    to="/post-project" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/post-project') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-355 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-4.5 h-4.5" /> Post Project
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/chat') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4.5 h-4.5" /> Chat
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/freelancer-dashboard" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/freelancer-dashboard') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
                  </Link>
                  <Link 
                    to="/freelancer-dashboard?tab=browse" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      location.search.includes('tab=browse')
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Briefcase className="w-4.5 h-4.5" /> Browse Projects
                  </Link>
                  <Link 
                    to="/resume-analyzer" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/resume-analyzer') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4.5 h-4.5 text-primary" /> Resume Analyzer
                  </Link>
                  <Link 
                    to="/ai-assessment" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/ai-assessment') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Cpu className="w-4.5 h-4.5 text-indigo-500 animate-pulse" /> AI Skill Verification
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive('/chat') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-655 dark:text-slate-350 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4.5 h-4.5" /> Chat
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors border border-slate-200/50 dark:border-white/5"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notification Alert Bell */}
            <Link 
              to="/chat" 
              onClick={() => setHasUnreadMessages(false)}
              className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors border border-slate-200/50 dark:border-white/5 relative inline-block"
            >
              <Bell className="w-4.5 h-4.5" />
              {hasUnreadMessages && (
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 block ring-2 ring-white dark:ring-dark-surface animate-pulse" />
              )}
            </Link>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors border border-slate-200/60 dark:border-white/5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm shadow-sm shadow-primary/10">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-none">{user.name}</p>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg capitalize font-bold mt-1 inline-block tracking-wider">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-surface border border-slate-200/60 dark:border-slate-800/80 shadow-2xl rounded-2xl p-2 z-50">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate(user.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <User className="w-4 h-4 text-slate-405" /> My Workspace
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold text-red-650 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Bar Controls */}
          <div className="flex items-center md:hidden gap-1.5">
            {/* Mobile notification bell */}
            <Link
              to="/chat"
              onClick={() => setHasUnreadMessages(false)}
              className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-white/5 relative"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadMessages && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 block ring-2 ring-white dark:ring-dark-surface animate-pulse" />
              )}
            </Link>
            <button
              onClick={toggleTheme}
              className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-white/5"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-505 dark:text-slate-300 hover:text-primary p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-white/5"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-3 pt-2 pb-4 space-y-1.5 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-slate-800 shadow-lg">
          {user.role === 'client' ? (
            <>
              <Link 
                to="/client-dashboard" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
              </Link>
              <Link 
                to="/post-project" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <PlusCircle className="w-4.5 h-4.5" /> Post Project
              </Link>
              <Link 
                to="/chat" 
                onClick={() => { setIsOpen(false); setHasUnreadMessages(false); }} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="relative">
                  <MessageSquare className="w-4.5 h-4.5" />
                  {hasUnreadMessages && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 block animate-pulse" />}
                </div>
                Chat
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/freelancer-dashboard" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
              </Link>
              <Link 
                to="/freelancer-dashboard?tab=browse" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Briefcase className="w-4.5 h-4.5" /> Browse Projects
              </Link>
              <Link 
                to="/resume-analyzer" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" /> Resume Analyzer
              </Link>
              <Link 
                to="/ai-assessment" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <Cpu className="w-4.5 h-4.5 text-indigo-500 animate-pulse" /> AI Skill Verification
              </Link>
              <Link 
                to="/chat" 
                onClick={() => { setIsOpen(false); setHasUnreadMessages(false); }} 
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="relative">
                  <MessageSquare className="w-4.5 h-4.5" />
                  {hasUnreadMessages && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 block animate-pulse" />}
                </div>
                Chat
              </Link>
            </>
          )}
          <div className="pt-3 pb-1 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center px-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm mr-3">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-500/10"
            >
              <LogOut className="w-4.5 h-4.5 mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
