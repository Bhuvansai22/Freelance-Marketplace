import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, Loader2, UserCheck, Briefcase, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['freelancer', 'client'], { required_error: 'Please select a role' }),
});

const Signup = () => {
  const navigate = useNavigate();
  const { user, register: registerUser, isLoading, error, clearError } = useAuthStore();

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

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'freelancer'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      const userObj = await registerUser(data);
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
        className="w-full max-w-lg bg-white dark:bg-dark-surface rounded-3xl shadow-xl p-8 z-10 border border-slate-200/60 dark:border-slate-800/80 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Hirenova Ecosystem
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join the verified platform connecting professionals and enterprise clients
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-650 dark:text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" onChange={clearError}>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${selectedRole === 'freelancer'
                ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                : 'border-slate-205 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
              }`}>
              <input type="radio" value="freelancer" {...register('role')} className="hidden" />
              <UserCheck className="w-6 h-6" />
              <span className="font-bold text-xs">I'm a Freelancer</span>
            </label>

            <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${selectedRole === 'client'
                ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                : 'border-slate-205 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
              }`}>
              <input type="radio" value="client" {...register('role')} className="hidden" />
              <Briefcase className="w-6 h-6" />
              <span className="font-bold text-xs">I'm a Client</span>
            </label>
          </div>
          {errors.role && <p className="text-xs text-red-500 text-center font-semibold">{errors.role.message}</p>}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <UserIcon className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                {...register('name')}
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-white/5 rounded-2xl bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.name.message}</p>}
          </div>

          {/* Email Address */}
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
            <label className="block text-xs font-bold text-slate-405 uppercase mb-1.5">Password</label>
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
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
