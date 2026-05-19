import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  ShieldCheck, 
  MessageSquare, 
  Video, 
  ArrowRight, 
  Star, 
  CheckCircle, 
  Users, 
  Zap, 
  Sun, 
  Moon,
  Laptop,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  Mail,
  Send
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useState, useEffect } from 'react';

const Landing = () => {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
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

  const developers = [
    { name: "Aravind S.", role: "React specialist", score: "94%", badge: "Gold badge", color: "text-primary bg-primary/10 border-primary/20" },
    { name: "Priya Sen", role: "NodeJS Developer", score: "91%", badge: "Silver badge", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    { name: "Kunal Das", role: "Fullstack Architect", score: "98%", badge: "Platinum badge", color: "text-secondary bg-secondary/10 border-secondary/20" }
  ];

  const faqs = [
    {
      q: "How does the skills verification process work?",
      a: "Specialists take interactive, multiple-choice, and coding-based assessments generated on the platform. To earn a qualification badge and bid on active client listings, they must pass with a minimum score of 70%."
    },
    {
      q: "How are milestone payments secured?",
      a: "We use an integrated milestone escrow container. Before kick-off, clients deposit the agreed milestone funds into a secure platform vault. Payouts are released automatically once the freelancer submits work and the client approves it."
    },
    {
      q: "Is there any cost to test skills or post contracts?",
      a: "Testing and skill verification are 100% free for developers. Clients can list projects and review verified talent profiles at zero cost. We only charge a small platform processing fee upon successful contract payout."
    },
    {
      q: "Can we conduct video interviews inside Hirenova?",
      a: "Yes! The platform includes integrated chat rooms and direct WebRTC video calling channels. Both parties can start face-to-face discussions, review codes, and schedule milestones without leaving the workspace."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white font-sans overflow-x-hidden bg-grid-pattern transition-colors duration-300 relative">
      
      {/* Visual background gradient lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-[-100px] w-[600px] h-[600px] bg-secondary/10 dark:bg-secondary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-dark-bg/85 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black shadow-lg shadow-primary/25">
              HN
            </div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Hirenova
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors border border-slate-200/50 dark:border-white/5"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <Link
                to={user.role === 'client' ? '/client-dashboard' : '/freelancer-dashboard'}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-primary/25 hover:scale-[1.02] flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-primary transition px-3 py-2 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-primary/25 hover:scale-[1.02]"
                >
                  Join Platform
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero split layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Copy Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Fresher Talent & Verified Skills
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
              Hire talent based on <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-clip-text text-transparent">
                verifiable proof.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-550 dark:text-slate-400 max-w-xl leading-relaxed font-semibold">
              The first open marketplace matching beginner engineers with client teams based on verified assessment performance instead of empty resume lines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                to="/signup"
                className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-800/85 transition flex items-center justify-center gap-2"
              >
                Hire Specialists
              </Link>
            </div>

            {/* Quick stats inline */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-slate-200/60 dark:border-slate-800/80">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">₹0</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Vetting fee</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">70%</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pass benchmark</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">100%</p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Milestone escrow</p>
              </div>
            </div>
          </div>

          {/* Interactive Showcase Mockup Column */}
          <div className="lg:col-span-5 relative">
            
            {/* Visual design ring behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl blur-2xl -z-10 pointer-events-none scale-105" />

            {/* Mock Dashboard Shell */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/70 dark:border-slate-800/80 shadow-2xl p-5 space-y-4 relative overflow-hidden">
              
              {/* Fake window head */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/90 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/90 block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/90 block" />
                </div>
                <div className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                  Live Vetting Console
                </div>
              </div>

              {/* Showcase items */}
              <div className="space-y-3">
                
                {/* Mock item 1: Active assessment status */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-805/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Topic Assessment</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-md text-[9px] font-extrabold uppercase">Verified</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      JS
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">React & Core JavaScript Test</h4>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-white shrink-0 ml-1">88%</span>
                  </div>
                </div>

                {/* Mock item 2: Verified candidate pitch */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
                        A
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Aravind S.</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Frontend Developer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-450 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider">
                      <Award className="w-3 h-3" /> Gold Badge
                    </div>
                  </div>
                </div>

                {/* Mock item 3: Locked escrow status */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">Escrow Payment Locked</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Milestone 1 Release</p>
                    </div>
                  </div>
                  <span className="font-black text-xs text-emerald-600 dark:text-emerald-455 shrink-0">₹15,000</span>
                </div>
              </div>
            </div>

            {/* Decorative floaters */}
            <div className="absolute -top-6 -right-6 bg-white dark:bg-dark-surface border border-slate-200/50 dark:border-white/5 shadow-lg rounded-2xl p-2.5 flex items-center gap-2 rotate-6">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block shrink-0" />
              <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">100% Secure</span>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-dark-surface border border-slate-200/50 dark:border-white/5 shadow-lg rounded-2xl p-2.5 flex items-center gap-2 -rotate-6">
              <span className="w-3.5 h-3.5 rounded-full bg-primary block shrink-0" />
              <span className="text-[9px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">React Badge</span>
            </div>
          </div>

        </div>
      </main>

      {/* Partners Wall logo grid */}
      <section className="py-8 bg-white/30 dark:bg-dark-surface/10 border-y border-slate-200/50 dark:border-slate-850/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-around gap-8 opacity-50 dark:opacity-40">
          {["Vercel", "Slack", "Stripe", "Figma", "Linear"].map((brand, idx) => (
            <span key={idx} className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* Step by Step workflow pipeline */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            How Hirenova Works
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 max-w-lg mx-auto font-semibold">
            We follow a clean, four-stage technical pipeline to guarantee professional alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 relative">
          {[
            { step: "01", title: "Test & Qualify", desc: "Take standardized evaluation assessments. Achieve 70% or more to verify skillset badges." },
            { step: "02", title: "Pitch & Propose", desc: "Browse open developer listings. Submit proposals directly matching your verified expertise." },
            { step: "03", title: "Lock Escrow", desc: "Before work starts, the client deposits project milestones directly into secure escrow containers." },
            { step: "04", title: "Release Funds", desc: "Submit milestones, collaborate via WebRTC video, and claim funds on successful approval." }
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-dark-surface border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-3 relative">
              <span className="absolute top-4 right-6 text-3xl font-black text-slate-200 dark:text-slate-800/50">{item.step}</span>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Profile showcase */}
      <section className="py-20 bg-white/40 dark:bg-dark-surface/30 border-y border-slate-200/50 dark:border-slate-850/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Top Verified Specialists
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-450 max-w-lg mx-auto font-semibold">
              Meet top freshers who achieved outstanding scores in core coding evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {developers.map((dev, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-xs">
                      {dev.name.charAt(0)}
                    </div>
                    <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${dev.color}`}>
                      {dev.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dev.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{dev.role}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3.5">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Assessment</span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">Passed {dev.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold">
            Everything you need to know about vetting, contract security, and evaluation.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpened = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpened ? null : idx)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-805 dark:text-slate-200">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-350 ${isOpened ? 'rotate-180' : ''}`} />
                </button>
                {isOpened && (
                  <div className="px-6 pb-5 pt-1 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Banner Panel */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-tr from-primary to-indigo-650 dark:from-primary/90 dark:to-indigo-900/90 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3 max-w-xl text-left">
            <h2 className="text-3xl font-black tracking-tight leading-none">Ready to Hire Certified Specialists?</h2>
            <p className="text-xs text-white/80 leading-relaxed font-semibold">
              Join thousands of technical clients getting projects done without self-reported resume friction. Create your profile instantly.
            </p>
          </div>
          <Link
            to="/signup"
            className="px-8 py-3.5 bg-white text-primary hover:bg-slate-100 font-bold rounded-2xl transition shadow-lg shrink-0 flex items-center gap-1.5"
          >
            Start Projects Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-dark-bg transition-colors pt-16 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Newsletter card */}
          <div className="p-6 bg-slate-50 dark:bg-dark-surface/40 rounded-3xl border border-slate-200/50 dark:border-slate-850/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Subscribe to platform updates</h4>
              <p className="text-[10px] text-slate-400 font-semibold">Get email notifications on active assessments, job bids, and escrow releases.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto max-w-sm">
              <input
                type="email"
                placeholder="name@email.com"
                className="bg-white dark:bg-white/5 border border-slate-205 dark:border-white/5 px-4 py-2 rounded-2xl text-xs flex-1 outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
              />
              <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-bold transition flex items-center gap-1">
                Subscribe <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Links structure */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Logo details */}
            <div className="space-y-4 md:col-span-1 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                  HN
                </div>
                <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Hirenova
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                An active vetting marketplace matching beginner specialists with enterprise project requirements.
              </p>
              
              {/* Social icons */}
              <div className="flex gap-3 pt-2">
                <a href="#" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-550 dark:text-slate-400 hover:text-primary transition" aria-label="GitHub">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-550 dark:text-slate-400 hover:text-primary transition" aria-label="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
                <a href="#" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-550 dark:text-slate-400 hover:text-primary transition" aria-label="Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
              </div>
            </div>

            {/* Link group 1 */}
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                <li><Link to="/signup" className="hover:text-primary transition flex items-center gap-0.5"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /> Find Job Bids</Link></li>
                <li><Link to="/login" className="hover:text-primary transition flex items-center gap-0.5"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /> Search Candidates</Link></li>
                <li><Link to="/skills-assessment" className="hover:text-primary transition flex items-center gap-0.5"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /> Test Assessments</Link></li>
              </ul>
            </div>

            {/* Link group 2 */}
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Security</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
                <li><span className="hover:text-primary transition flex items-center gap-0.5 cursor-pointer"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /> Payment Escrows</span></li>
                <li><span className="hover:text-primary transition flex items-center gap-0.5 cursor-pointer"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /> Trust Badges</span></li>
                <li><span className="hover:text-primary transition flex items-center gap-0.5 cursor-pointer"><ChevronRight className="w-3.5 h-3.5 text-slate-400" /> Help Desk</span></li>
              </ul>
            </div>

            {/* Link group 3 */}
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Contact Info</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <li><span>Email: info@hirenova.com</span></li>
                <li><span>Phone: +91 98765 43210</span></li>
                <li><span>Location: Bangalore, India</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-semibold">
            <p>&copy; 2026 Hirenova Inc. All rights reserved. Made with love for beginner specialists.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer">Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
