import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, IndianRupee, Clock, Users, ArrowRight, Eye, Check, X, FileText, MessageSquare, Star, Loader2, Award, User, Calendar, Mail, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidsLoading, setIsBidsLoading] = useState(false);
  const [freelancers, setFreelancers] = useState([]);
  const [isFreelancersLoading, setIsFreelancersLoading] = useState(true);
  const [initiatingChatId, setInitiatingChatId] = useState(null);
  const [ratingProject, setRatingProject] = useState(null);
  const [ratingValue, setRatingValue] = useState(3);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratedProjects, setRatedProjects] = useState(() => {
    const saved = localStorage.getItem('rated_projects');
    return saved ? JSON.parse(saved) : [];
  });

  // Profile & Tab navigation states
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'experts', 'profile'
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phnumber: '',
    dob: '',
    title: '',
    bio: '',
    profileType: 'individual',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    fetchMyProjects();
    fetchFreelancers();
    fetchProfile();

    const interval = setInterval(() => {
      fetchMyProjects();
      fetchFreelancers();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const u = response.data;
      setProfileData({
        name: u.name || '',
        email: u.email || '',
        phnumber: u.phnumber || '',
        dob: u.dob ? new Date(u.dob).toISOString().split('T')[0] : '',
        title: u.title || '',
        bio: u.bio || '',
        profileType: u.profileType || 'individual',
      });
    } catch (err) {
      console.error('Failed to load user profile details', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const payload = {
        name: profileData.name,
        email: profileData.email,
        phnumber: profileData.phnumber,
        dob: profileData.dob || null,
        title: profileData.title,
        bio: profileData.bio,
        profileType: profileData.profileType || 'individual',
      };
      const response = await api.put('/auth/profile', payload);
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser) {
        const newUserObj = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(newUserObj));
      }
      
      setProfileSuccess(true);
      fetchProfile();
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const fetchMyProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/projects/myprojects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFreelancers = async () => {
    try {
      setIsFreelancersLoading(true);
      const response = await api.get('/auth/freelancers');
      setFreelancers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch freelancers', error);
    } finally {
      setIsFreelancersLoading(false);
    }
  };

  const handleStartChat = async (freelancer) => {
    setInitiatingChatId(freelancer._id);
    try {
      // Send initial connect message so the contact is registered
      await api.post('/messages', {
        receiver: freelancer._id,
        content: `Hi ${freelancer.name}! I checked your profile on the dashboard and would love to work together.`,
      });
      // Redirect to the chat room
      window.location.href = `/chat?userId=${freelancer._id}`;
    } catch (error) {
      console.error('Failed to initiate chat', error);
      window.location.href = `/chat?userId=${freelancer._id}`;
    } finally {
      setInitiatingChatId(null);
    }
  };

  const handleOpenRatingModal = (project) => {
    setRatingProject(project);
    setRatingValue(3);
    setRatingSuccess(false);
  };

  const handleSubmitRating = async () => {
    if (!ratingProject) return;
    setIsSubmittingRating(true);
    try {
      await api.post(`/projects/${ratingProject._id}/rate`, { rating: ratingValue });
      
      const updatedRated = [...ratedProjects, ratingProject._id];
      setRatedProjects(updatedRated);
      localStorage.setItem('rated_projects', JSON.stringify(updatedRated));

      setRatingSuccess(true);
      setTimeout(() => {
        setRatingProject(null);
      }, 2000);

      // Refresh project list and available freelancers list to show updated ratings!
      fetchMyProjects();
      fetchFreelancers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleViewBids = async (project) => {
    setSelectedProject(project);
    setIsBidsLoading(true);
    try {
      const response = await api.get(`/bids/project/${project._id}`);
      setBids(response.data);
    } catch (error) {
      console.error('Failed to fetch bids', error);
    } finally {
      setIsBidsLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to accept this proposal? This will assign the freelancer and mark the project as in-progress.')) return;
    try {
      await api.put(`/bids/${bidId}/accept`);
      alert('Bid accepted successfully!');
      setSelectedProject(null);
      fetchMyProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await api.put(`/bids/${bidId}/reject`);
      setBids(bids.map(b => b._id === bidId ? { ...b, status: 'rejected' } : b));
    } catch (error) {
      alert('Failed to reject bid');
    }
  };

  // Stats
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBidsReceived = projects.reduce((acc, p) => acc + (p.bidsCount || 0), 0); // we can calculate this or fetch it.

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Client Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your projects, evaluate proposals, and hire experts.</p>
          </div>
          <Link to="/post-project" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/25 font-semibold transition duration-200">
            Post a New Project
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800 mb-8 max-w-lg shadow-sm">
          {[
            { id: 'projects', name: 'My Projects', icon: Briefcase },
            { id: 'experts', name: 'Browse Experts', icon: Users },
            { id: 'profile', name: 'Company Profile Settings', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 relative ${
                  isActive 
                    ? 'bg-white dark:bg-dark-surface text-primary shadow-md border border-slate-200/40 dark:border-slate-700/40 scale-100'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {activeTab === 'projects' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[
                { title: 'Total Projects', value: projects.length, icon: Briefcase, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
                { title: 'Active Contracts', value: activeProjects, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                { title: 'Completed Projects', value: completedProjects, icon: Check, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
                { title: 'Total Freelancers Hired', value: activeProjects + completedProjects, icon: Users, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
              ].map((stat, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.title}
                  className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
                >
                  <div className={`p-4 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projects List */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Posted Projects</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't posted any projects yet.</p>
                    <Link to="/post-project" className="text-primary font-semibold hover:underline">Post your first project now</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <motion.div
                        layout
                        key={project._id}
                        className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                              project.status === 'open' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                              project.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                              'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-slate-400 text-xs">{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{project.title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <IndianRupee className="w-4 h-4 text-emerald-500" />
                              Budget: {typeof project.budget === 'object' && project.budget ? `₹${project.budget.min} - ₹${project.budget.max}` : `₹${project.budget}`}
                            </span>
                            <span>Bids Received: {project.bidsCount || 0}</span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-end gap-2 min-w-[120px] shrink-0">
                          {project.status === 'open' && (
                            <button
                              onClick={() => handleViewBids(project)}
                              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Users className="w-3.5 h-3.5" /> View Bids ({project.bidsCount || 0})
                            </button>
                          )}
                          <Link
                            to={`/projects/${project._id}`}
                            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> Project Details Page
                          </Link>
                          {project.status === 'completed' && (
                            <button
                              onClick={() => handleOpenRatingModal(project)}
                              disabled={ratedProjects.includes(project._id)}
                              className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border border-transparent ${
                                ratedProjects.includes(project._id)
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/25 animate-pulse'
                              }`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {ratedProjects.includes(project._id) ? 'Rated Expert' : 'Rate Freelancer'}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bids Sidebar */}
              <div className="lg:col-span-1">
                <AnimatePresence mode="wait">
                  {selectedProject && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">{selectedProject.title}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Select a proposal to hire the expert</p>
                        </div>
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
                        >
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>

                      {isBidsLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <Loader2 className="animate-spin text-primary w-6 h-6" />
                        </div>
                      ) : bids.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400">
                          No bids received for this project yet.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                          {bids.map((bid) => (
                            <div key={bid._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                    {bid.freelancer?.name || 'Deleted Freelancer'}
                                    {bid.freelancer?.verifiedBadges?.length > 0 && (
                                      <Award className="w-4 h-4 text-amber-500 fill-current animate-pulse" title="Verified Professional" />
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{bid.freelancer?.title || 'Beginner Freelancer'}</p>
                                </div>
                                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{bid.amount}</span>
                              </div>

                              <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                                <p className="font-semibold text-[10px] text-slate-400 uppercase mb-1">Proposal Pitch</p>
                                <p className="italic leading-relaxed">"{bid.proposal || 'No proposal description added.'}"</p>
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                <span>Delivers: {bid.deliveryTime}</span>
                                {bid.status === 'pending' ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleRejectBid(bid._id)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-lg transition"
                                      title="Reject bid"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleAcceptBid(bid._id)}
                                      className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Hire
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`capitalize text-[10px] px-2 py-0.5 rounded font-bold ${
                                    bid.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                  }`}>
                                    {bid.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}

        {activeTab === 'experts' && (
          <div className="pt-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary animate-pulse" /> Available Experts & Specialists
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hire vetted professionals directly or start a text consultation instantly.</p>
              </div>
              <span className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold shadow-sm border border-slate-200/30 dark:border-slate-700/30">
                {freelancers.length} Experts Active
              </span>
            </div>

            {isFreelancersLoading ? (
              <div className="flex justify-center items-center py-16 bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-slate-800/80">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : freelancers.length === 0 ? (
              <div className="bg-white dark:bg-dark-surface p-12 rounded-3xl border border-slate-200 dark:border-slate-800/80 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No freelancers are currently available on the platform.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freelancers.map((freelancer, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={freelancer._id}
                    className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between border-t-[5px] border-t-primary"
                  >
                    <div>
                      {/* Header: Avatar, Name & Hourly Rate */}
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg relative">
                            {freelancer.name.charAt(0).toUpperCase()}
                            {/* Live Online Badge / Verified Badge Indicator */}
                            {freelancer.verifiedBadges?.length > 0 && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-dark-surface rounded-full" title="Verified Expert"></span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5 leading-snug">
                              {freelancer.name}
                              {freelancer.verifiedBadges?.length > 0 && (
                                <Award className="w-4 h-4 text-amber-500 fill-current animate-pulse" title="Verified Expert" />
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{freelancer.title || 'Professional Specialist'}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold shrink-0">
                          ₹{freelancer.hourlyRate || 45}/hr
                        </span>
                      </div>

                      {/* Bio Paragraph */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2 h-8">
                        {freelancer.bio || 'Experienced developer with solid background building state-of-the-art web systems.'}
                      </p>

                      {/* Earned Badges Row */}
                      {freelancer.verifiedBadges?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {freelancer.verifiedBadges.map((badge) => {
                            const badgeLabels = {
                              'javascript': 'JS Verified ⚡',
                              'react': 'React Dev 🚀',
                              'html-css': 'Web Stylist 🎨'
                            };
                            return (
                              <span key={badge} className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-bold border border-amber-500/20">
                                {badgeLabels[badge] || badge}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Rating Section */}
                      <div className="flex items-center gap-1.5 mb-5 text-xs">
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-500 px-2 py-0.5 rounded-lg font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {freelancer.rating?.toFixed(1) || '5.0'}
                        </div>
                        <span className="text-slate-400">({freelancer.reviewsCount || 8} reviews)</span>
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {(freelancer.skills?.length > 0 ? freelancer.skills : ['Javascript', 'React', 'Node.js', 'CSS']).slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-semibold border border-slate-100 dark:border-slate-700/60 uppercase tracking-wide">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Connect CTA Button */}
                    <button
                      onClick={() => handleStartChat(freelancer)}
                      disabled={initiatingChatId === freelancer._id}
                      className="w-full py-2.5 bg-slate-900 hover:bg-primary dark:bg-slate-800 dark:hover:bg-primary text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 group shadow-sm"
                    >
                      {initiatingChatId === freelancer._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white transition" /> Chat Now
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Edit Profile Column */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="text-primary w-5 h-5" /> {profileData.profileType === 'corporate' ? 'Company Profile Settings' : 'Client Profile Settings'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {profileData.profileType === 'corporate' 
                    ? 'Keep your corporate and contact details updated to attract elite freelancers to your projects.' 
                    : 'Keep your recruiter and contact details updated to build candidate trust.'}
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Profile updated successfully! Changes are synchronized.
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Profile Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Profile Representation</label>
                  <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, profileType: 'individual' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        profileData.profileType === 'individual'
                          ? 'bg-white dark:bg-dark-surface text-primary shadow-sm scale-[1.02]'
                          : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Individual Client
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, profileType: 'corporate' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        profileData.profileType === 'corporate'
                          ? 'bg-white dark:bg-dark-surface text-primary shadow-sm scale-[1.02]'
                          : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-4 h-4" />
                      Corporate Entity
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={profileData.phnumber}
                      onChange={(e) => setProfileData({ ...profileData, phnumber: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      {profileData.profileType === 'corporate' ? 'Incorporation / Registration Date' : 'Date of Birth'}
                    </label>
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    {profileData.profileType === 'corporate' ? 'Company Name / Corporate Title' : 'Professional Title / Tagline'}
                  </label>
                  <input
                    type="text"
                    placeholder={profileData.profileType === 'corporate' ? 'e.g. CEO at TechVentures Inc.' : 'e.g. Independent Recruiter / Product Director'}
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    {profileData.profileType === 'corporate' ? 'Corporate Summary / Bio' : 'Personal Bio / Introduction'}
                  </label>
                  <textarea
                    rows={5}
                    placeholder={profileData.profileType === 'corporate' ? 'Describe your organization, projects culture, and what you aim to achieve...' : 'Tell freelancers about yourself, your project styles, and collaboration style...'}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
                  >
                    {isUpdatingProfile ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-600/5 to-transparent p-5 rounded-3xl border border-indigo-500/20 shadow-sm relative overflow-hidden space-y-3">
                <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/20 rounded-full text-indigo-500">
                  {profileData.profileType === 'corporate' ? (
                    <Briefcase className="w-5 h-5 animate-pulse" />
                  ) : (
                    <User className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                  {profileData.profileType === 'corporate' ? '🏢 Corporate Identity Vetted' : '👤 Individual Recruiter Vetted'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {profileData.profileType === 'corporate' 
                    ? 'Keeping your corporate information comprehensive helps build trust and increases organic bid submissions from verified specialists up to 40%.'
                    : 'Having a verified individual recruiter profile helps candidates understand your vision and submit higher-quality proposals.'}
                </p>
              </div>

              {/* Company/Individual Showcase Card */}
              <div className={`bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden border-t-[5px] ${
                profileData.profileType === 'corporate' ? 'border-t-primary' : 'border-t-emerald-500'
              }`}>
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                  Profile Card
                </span>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg relative ${
                      profileData.profileType === 'corporate' 
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : (profileData.profileType === 'corporate' ? 'C' : 'I')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 leading-snug">
                        {profileData.name || 'Your Name'}
                        <span className={`w-2.5 h-2.5 rounded-full ${profileData.profileType === 'corporate' ? 'bg-indigo-500' : 'bg-emerald-500'}`} title="Online Vetted Client"></span>
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">
                        {profileData.title || (profileData.profileType === 'corporate' ? 'Corporate Role / Title' : 'Client / Recruiter Title')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 border-t border-b border-slate-100 dark:border-slate-800 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-[180px]">{profileData.email || 'recruiter-email@example.com'}</span>
                    </div>
                    {profileData.phnumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{profileData.phnumber}</span>
                      </div>
                    )}
                    {profileData.dob && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{profileData.profileType === 'corporate' ? 'Incorporated: ' : 'DOB: '}{new Date(profileData.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary / Stats block */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-400 font-semibold">
                      <span>Total Posted Projects:</span>
                      <span className="text-slate-700 dark:text-white font-bold">{projects.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 font-semibold">
                      <span>Active Contracts:</span>
                      <span className="text-slate-700 dark:text-white font-bold">{activeProjects}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      {profileData.profileType === 'corporate' ? 'Corporate Summary' : 'Personal Introduction'}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-3">
                      {profileData.bio || (profileData.profileType === 'corporate' 
                        ? '"Corporate profile summary not defined yet. Update your details to describe your company culture."' 
                        : '"Personal bio has not been defined yet. Introduce yourself to attract matching specialists."')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Star Rating Modal */}
      <AnimatePresence>
        {ratingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface p-8 max-w-md w-full rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl relative text-center space-y-6"
            >
              {/* Close Button */}
              <button
                disabled={isSubmittingRating}
                onClick={() => setRatingProject(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition animate-none hover:scale-105"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Star Icon Banner */}
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shadow-inner">
                <Star className="w-8 h-8 fill-current" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rate Project Execution</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Submit a review for the expert assigned to <span className="font-bold text-slate-700 dark:text-slate-300">"{ratingProject.title}"</span>.
                </p>
              </div>

              {ratingSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-semibold"
                >
                  <Check className="w-5 h-5 mx-auto mb-1.5 animate-bounce" />
                  Rating submitted successfully!
                </motion.div>
              ) : (
                <>
                  {/* Interactive Star Selector */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          type="button"
                          key={starVal}
                          disabled={isSubmittingRating}
                          onClick={() => setRatingValue(starVal)}
                          className="hover:scale-115 active:scale-95 transition-transform focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-all ${
                              starVal <= ratingValue
                                ? 'text-amber-400 fill-current drop-shadow-sm scale-110'
                                : 'text-slate-200 dark:text-slate-700/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full uppercase mt-2 animate-none">
                      Rating: {ratingValue}.0 Stars
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                    Select a custom review score. Defaults to <span className="font-semibold text-slate-600 dark:text-slate-300">3 stars</span> for standard complete.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmittingRating}
                      onClick={() => setRatingProject(null)}
                      className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitRating}
                      disabled={isSubmittingRating}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/25"
                    >
                      {isSubmittingRating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Submit Rating
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
