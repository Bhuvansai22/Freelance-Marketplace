import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { api } from '../store/authStore';
import toast from 'react-hot-toast';

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 char')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Your password has been reset successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
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
            <Sparkles className="w-3.5 h-3.5" /> Cyber Security
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Choose New Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
            Please type in your new strong password below to secure your Hirenova account.
          </p>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Password Reset Successful!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your security credentials have been updated. Redirecting to sign in page shortly...
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">New Password</label>
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

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition bg-transparent border-0 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary/20 text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all duration-300 disabled:opacity-70 hover:scale-[1.01]"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <span className="flex items-center gap-1.5">
                  Update Password <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
