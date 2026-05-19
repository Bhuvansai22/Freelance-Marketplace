import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff, X } from 'lucide-react';
import useAuthStore, { api } from '../store/authStore';
import toast from 'react-hot-toast';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { user, login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (user) {
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/freelancer-dashboard');
      }
    }
  }, [user, navigate]);

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForgot(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      
      if (response.data.resetUrl) {
        const token = response.data.resetUrl.split('/reset-password/')[1];
        toast.success('Secure reset session initialized! Directing to new password form.');
        setShowForgotModal(false);
        setForgotEmail('');
        navigate(`/reset-password/${token}`);
      } else {
        toast.success('If registered, a reset email will be sent.');
        setShowForgotModal(false);
        setForgotEmail('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger reset flow. Please try again.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      const userObj = JSON.parse(localStorage.getItem('user'));
      if (userObj?.role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/freelancer-dashboard');
      }
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-dark-bg aurora-mesh transition-colors duration-300">
      
      {/* Background visual components */}
      <div className="absolute inset-0 tech-grid pointer-events-none opacity-40 dark:opacity-70" />
      <div className="tech-centerpiece">
        <div className="tech-radar-pulse" />
      </div>
      
      {/* Glow blobs */}
      <div className="glow-blob w-[450px] h-[450px] bg-primary/10 dark:bg-primary/5 top-[-10%] left-[-10%]" />
      <div className="glow-blob w-[500px] h-[500px] bg-secondary/10 dark:bg-secondary/4 bottom-[-15%] right-[-15%]" />
      <div className="glow-blob w-[350px] h-[350px] bg-indigo-500/5 dark:bg-indigo-500/3 top-[30%] right-[5%]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-dark-surface rounded-3xl shadow-xl p-8 z-10 border border-slate-200/60 dark:border-slate-800/80 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Hirenova Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log in to manage active bids, verification exams, and payouts
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-650 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" onChange={clearError}>
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-405 uppercase">Password</label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)} 
                className="text-[11px] text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition bg-transparent border-0 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all duration-300 disabled:opacity-70 hover:scale-[1.01]"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-primary hover:text-primary-dark transition">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface max-w-sm w-full rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail('');
                }}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition bg-transparent border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center space-y-2 mb-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Recovery Assistant
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Forgot Password?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Enter your registered email below, and we will send you a secure AI-generated reset link.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-450 uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingForgot}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-2xl shadow-md text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-70"
                >
                  {isSubmittingForgot ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send Recovery Email'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
