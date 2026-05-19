import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, MessageSquare, Video, ArrowRight, Star, CheckCircle, Users, Zap } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Landing = () => {
  const { user } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white font-sans overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-dark-bg/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              HN
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hirenova
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to={user.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard'}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition shadow-md shadow-primary/10 flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition shadow-md shadow-primary/10"
                >
                  Join Platform
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-4xl"
        >
          {/* Badge Alert */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold"
          >
            <Zap className="w-3.5 h-3.5" />
            Fresher-First Marketplace with Skills Verification
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white"
          >
            Get Real-World Opportunities with{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-clip-text text-transparent">
              Verified Technical Skills
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            A premium, high-fidelity freelance ecosystem tailored for beginners. Prove your competencies through topic-based assessments, acquire badges, and lock secure milestone contracts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Start Earning Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 transition flex items-center justify-center"
            >
              Hire Certified Freshers
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Counters */}
      <section className="border-y border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-dark-surface/30 py-12 px-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-primary">5,000+</span>
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 block font-semibold uppercase">Verified Freelancers</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-indigo-500">12,000+</span>
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 block font-semibold uppercase">Milestones Released</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-secondary">0%</span>
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 block font-semibold uppercase">Bidding Friction</span>
          </div>
          <div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-emerald-500">99.2%</span>
            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 mt-1 block font-semibold uppercase">Contract Success Rate</span>
          </div>
        </div>
      </section>

      {/* Core Features Cards */}
      <section className="py-20 md:py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Designed for Instant Work Verification
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Eliminating candidate validation bottlenecks using a modern built-in assessment verification suite and secure payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Skill Assessments */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Interactive Assessments</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Prove your skills in core topics like JavaScript, React, and HTML/CSS. Achieve a passing score of 70% and earn verification badges visible directly to clients.
              </p>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs font-bold uppercase">
              Free Verification <CheckCircle className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card 2: Escrow Payments */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Milestone Escrows</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Clients allocate funding securely inside step-by-step milestone structures. Payments are verified and released via integrated Razorpay payment pipelines.
              </p>
            </div>
            <div className="flex items-center gap-1 text-indigo-500 text-xs font-bold uppercase">
              Escrow Guaranteed <CheckCircle className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card 3: Video Meetings & Chat */}
          <motion.div
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Collaborative Classrooms</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                Directly communicate, schedule interview conferences, and collaborate inside our live high-fidelity video call rooms with built-in chat.
              </p>
            </div>
            <div className="flex items-center gap-1 text-secondary text-xs font-bold uppercase">
              WebRTC Integrated <CheckCircle className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-bg py-12 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
              HN
            </div>
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hirenova
            </span>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; 2026 Hirenova Inc. All rights reserved. Made for beginner freelancers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
