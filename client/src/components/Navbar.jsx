import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LogOut, User, Briefcase, PlusCircle, CheckCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-dark-surface/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Hirenova
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {user.role === 'client' ? (
                <>
                  <Link to="/client-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                  <Link to="/post-project" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" /> Post Project
                  </Link>
                  <Link to="/chat" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Chat</Link>
                </>
              ) : (
                <>
                  <Link to="/freelancer-dashboard" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                  <Link to="/browse-projects" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> Browse Projects
                  </Link>
                  <Link to="/skills-assessment" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Assessments
                  </Link>
                  <Link to="/chat" className="text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Chat</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded capitalize">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-primary p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-slate-800">
          {user.role === 'client' ? (
            <>
              <Link to="/client-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Dashboard</Link>
              <Link to="/post-project" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Post Project</Link>
              <Link to="/chat" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Chat</Link>
            </>
          ) : (
            <>
              <Link to="/freelancer-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Dashboard</Link>
              <Link to="/browse-projects" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Browse Projects</Link>
              <Link to="/skills-assessment" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Assessments</Link>
              <Link to="/chat" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Chat</Link>
            </>
          )}
          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center px-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-medium text-slate-800 dark:text-white">{user.name}</div>
                <div className="text-sm font-medium text-slate-500">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
