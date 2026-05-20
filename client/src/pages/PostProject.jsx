import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore, { api } from '../store/authStore';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, User, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  minBudget: z.number().min(1, 'Minimum budget must be positive'),
  maxBudget: z.number().min(1, 'Maximum budget must be positive'),
  skillsRequired: z.string().min(2, 'Please list at least one skill'),
  deadline: z.string().refine((val) => {
    const inputDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate >= today;
  }, {
    message: 'Deadline must be today or in the future',
  }),
});

const PostProject = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [milestones, setMilestones] = useState([{ title: '', amount: 0 }]);

  const isProfileComplete = user?.name && user?.email && user?.phnumber && user?.bio;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema)
  });

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', amount: 0 }]);
  };

  const handleRemoveMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = field === 'amount' ? Number(value) : value;
    setMilestones(updated);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const skillsArray = data.skillsRequired.split(',').map(s => s.trim().toLowerCase());

      const payload = {
        title: data.title,
        description: data.description,
        budget: {
          min: data.minBudget,
          max: data.maxBudget,
        },
        skillsRequired: skillsArray,
        deadline: new Date(data.deadline),
        milestones: milestones.filter(m => m.title && m.amount > 0),
      };

      await api.post('/projects', payload);
      toast.success('Project posted successfully!');
      navigate('/client-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col relative aurora-mesh tech-grid">
        <Navbar />
        <main className="max-w-md mx-auto w-full px-4 py-16 flex-1 flex flex-col justify-center page-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl border border-red-500/20 shadow-xl p-8 text-center space-y-5"
          >
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <User className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                Profile Incomplete
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Before posting a new project, you must complete your account details so freelancers can bid safely. Please make sure your **Name**, **Email**, **Phone Number**, and **Bio** are all filled in.
              </p>
            </div>
            <button
              onClick={() => navigate('/client-dashboard?tab=profile')}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary/25 hover:scale-[1.01]"
            >
              Go to Profile Details Page
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Post a New Project</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Explain what you need and set milestones to secure freelancer outputs.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
              <input
                {...register('title')}
                type="text"
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="e.g. Build a landing page for my SaaS"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                {...register('description')}
                rows={5}
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="Describe project details, expected outcomes, requirements..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Budget (₹)</label>
                <input
                  {...register('minBudget', { valueAsNumber: true })}
                  type="number"
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="e.g. 100"
                />
                {errors.minBudget && <p className="mt-1 text-sm text-red-500">{errors.minBudget.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Budget (₹)</label>
                <input
                  {...register('maxBudget', { valueAsNumber: true })}
                  type="number"
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  placeholder="e.g. 500"
                />
                {errors.maxBudget && <p className="mt-1 text-sm text-red-500">{errors.maxBudget.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma separated)</label>
              <input
                {...register('skillsRequired')}
                type="text"
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="react, tailwindcss, node.js, database"
              />
              {errors.skillsRequired && <p className="mt-1 text-sm text-red-500">{errors.skillsRequired.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deadline Date</label>
              <input
                {...register('deadline')}
                type="date"
                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline.message}</p>}
            </div>

            {/* Milestones */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Milestones (Optional)</label>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>
              </div>

              <div className="space-y-3">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
                    <input
                      type="text"
                      placeholder="Milestone Title (e.g. Figma Designs)"
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={milestone.amount || ''}
                        onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                        className="w-full sm:w-28 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      />
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="text-red-500 hover:text-red-600 p-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Post Project'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default PostProject;
