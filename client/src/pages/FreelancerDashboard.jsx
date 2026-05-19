import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import useAuthStore, { api } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Search, 
  Filter, 
  MessageSquare, 
  ChevronRight, 
  Award,
  X,
  Check,
  CheckSquare,
  ExternalLink,
  Loader2,
  CheckCircle,
  Star,
  User,
  Calendar,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { Send } from 'lucide-react';

const FreelancerDashboard = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidsLoading, setIsBidsLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Bid Modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  // Progress & Live Message modal state
  const [activeProgressProject, setActiveProgressProject] = useState(null);
  const [progressMilestones, setProgressMilestones] = useState([]);
  const [projectStatus, setProjectStatus] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Rating Client state
  const [ratedClients, setRatedClients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rated_clients')) || [];
    } catch {
      return [];
    }
  });
  const [ratingClientProject, setRatingClientProject] = useState(null);
  const [ratingValue, setRatingValue] = useState(3);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Profile & Tab navigation states
  const [activeTab, setActiveTab] = useState('browse'); // 'browse', 'profile', 'assessment'

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phnumber: '',
    dob: '',
    resume: '',
    skills: '',
    title: '',
    bio: '',
    hourlyRate: '',
    verifiedBadges: [],
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchMyBids();
    fetchProfile();

    const interval = setInterval(() => {
      fetchProjects();
      fetchMyBids();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Poll chat history inside progress modal when active
  useEffect(() => {
    if (!activeProgressProject) return;

    const clientId = activeProgressProject.client?._id || activeProgressProject.client;
    if (!clientId) return;

    const pollChatHistory = async () => {
      try {
        const chatResponse = await api.get(`/messages/${clientId}?t=${Date.now()}`);
        setChatHistory((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(chatResponse.data)) {
            return chatResponse.data || [];
          }
          return prev;
        });
      } catch (err) {
        console.error('Failed to poll chat history for progress modal', err);
      }
    };

    const interval = setInterval(pollChatHistory, 4000);

    return () => clearInterval(interval);
  }, [activeProgressProject]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const u = response.data;
      setProfileData({
        name: u.name || '',
        email: u.email || '',
        phnumber: u.phnumber || '',
        dob: u.dob ? new Date(u.dob).toISOString().split('T')[0] : '',
        resume: u.resume || '',
        skills: u.skills?.join(', ') || '',
        title: u.title || '',
        bio: u.bio || '',
        hourlyRate: u.hourlyRate || '',
        verifiedBadges: u.verifiedBadges || [],
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
        resume: profileData.resume,
        skills: profileData.skills,
        title: profileData.title,
        bio: profileData.bio,
        hourlyRate: profileData.hourlyRate ? Number(profileData.hourlyRate) : null,
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

  const fetchProjects = async (customParams = {}) => {
    setIsLoading(true);
    try {
      const response = await api.get('/projects', { params: customParams });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBids = async () => {
    setIsBidsLoading(true);
    try {
      const response = await api.get('/bids/mybids');
      setMyBids(response.data);
    } catch (error) {
      console.error('Failed to fetch bids', error);
    } finally {
      setIsBidsLoading(false);
    }
  };

  const handleSearchAndFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (skillsFilter) params.skills = skillsFilter.toLowerCase().replace(/\s+/g, '');
    if (minBudget) params.minBudget = minBudget;
    if (maxBudget) params.maxBudget = maxBudget;
    fetchProjects(params);
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setIsSubmittingBid(true);
    try {
      const payload = {
        project: selectedProject._id,
        amount: Number(bidAmount),
        deliveryTime,
        coverLetter,
      };
      await api.post('/bids', payload);
      alert('Bid placed successfully!');
      setSelectedProject(null);
      setBidAmount('');
      setDeliveryTime('');
      setCoverLetter('');
      fetchMyBids();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleOpenProgressModal = async (projectObj) => {
    setActiveProgressProject(projectObj);
    setProjectStatus(projectObj.status);
    setLiveMessage('');
    setMessageSuccess(false);
    setChatHistory([]);
    
    // Fetch full project structure from backend to get fresh milestones and client
    try {
      const response = await api.get(`/projects/${projectObj._id}`);
      setProgressMilestones(response.data.milestones || []);
      setProjectStatus(response.data.status);
    } catch (error) {
      console.error('Failed to fetch project details for progress modal', error);
      setProgressMilestones(projectObj.milestones || []);
    }

    // Fetch chat history with the client of this project
    const clientId = projectObj.client?._id || projectObj.client;
    if (clientId) {
      setIsChatLoading(true);
      try {
        const chatResponse = await api.get(`/messages/${clientId}?t=${Date.now()}`);
        setChatHistory(chatResponse.data || []);
      } catch (err) {
        console.error('Failed to fetch chat history for progress modal', err);
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const handleToggleMilestone = (index) => {
    const updated = [...progressMilestones];
    const currentStatus = updated[index].status;
    // Toggle status: pending -> completed -> pending (skip paid as it is finalized by client)
    if (currentStatus === 'paid') return;
    updated[index].status = currentStatus === 'completed' ? 'pending' : 'completed';
    setProgressMilestones(updated);
  };

  const handleSaveProgress = async () => {
    setIsSavingProgress(true);
    try {
      await api.put(`/projects/${activeProgressProject._id}/progress`, {
        milestones: progressMilestones,
        status: projectStatus,
      });
      alert('Progress and milestones updated successfully!');
      fetchMyBids(); // reload bids list to sync status
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update progress');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleOpenRatingModal = (project) => {
    setRatingClientProject(project);
    setRatingValue(3);
    setRatingSuccess(false);
  };

  const handleSubmitRating = async () => {
    if (!ratingClientProject) return;
    setIsSubmittingRating(true);
    try {
      await api.post(`/projects/${ratingClientProject._id}/rate-client`, { rating: ratingValue });
      const updatedRated = [...ratedClients, ratingClientProject._id];
      setRatedClients(updatedRated);
      localStorage.setItem('rated_clients', JSON.stringify(updatedRated));
      setRatingSuccess(true);
      setTimeout(() => {
        setRatingClientProject(null);
      }, 1500);
      fetchMyBids();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit rating');
      setIsSubmittingRating(false);
    }
  };

  const handleSendLiveMessage = async (e) => {
    e.preventDefault();
    if (!liveMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      const payload = {
        receiver: activeProgressProject.client?._id || activeProgressProject.client,
        content: liveMessage,
      };
      
      // 1. Save to database
      const response = await api.post('/messages', payload);
      
      // Update local chat history in modal
      setChatHistory((prev) => [...prev, response.data]);
      
      // 2. Emit via Socket.io so recipient gets it live
      try {
        let SOCKET_URL = import.meta.env.VITE_API_URL || 
          (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://freelance-marketplace-dk90.onrender.com');

        // Clean up trailing slash and /api suffix so Socket.io connects to the root domain
        if (SOCKET_URL.endsWith('/')) {
          SOCKET_URL = SOCKET_URL.slice(0, -1);
        }
        if (SOCKET_URL.endsWith('/api')) {
          SOCKET_URL = SOCKET_URL.slice(0, -4);
        }

        const socket = io(SOCKET_URL, {
          transports: ['polling', 'websocket']
        });
        socket.emit('send_message', response.data);
        setTimeout(() => socket.disconnect(), 1000);
      } catch (err) {
        console.error('Socket notification failed', err);
      }

      setMessageSuccess(true);
      setLiveMessage('');
      setTimeout(() => setMessageSuccess(false), 3000);
    } catch (error) {
      alert('Failed to send message to client');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Stats
  const activeBids = myBids.filter(b => b.status === 'pending').length;
  const acceptedBids = myBids.filter(b => b.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Freelancer Dashboard
              {profileData.verifiedBadges?.length > 0 && (
                <Award className="w-6 h-6 text-amber-500 fill-current animate-pulse" title="Verified Professional" />
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Browse opportunities, manage profile details, take assessments, and grow your career.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800 mb-8 max-w-lg shadow-sm">
          {[
            { id: 'browse', name: 'Browse Projects', icon: Briefcase },
            { id: 'profile', name: 'My Profile & CV', icon: User },
            { id: 'assessment', name: 'Skills Verification', icon: Award },
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

        {activeTab === 'browse' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[
                { title: 'Total Bids Placed', value: myBids.length, icon: Briefcase, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
                { title: 'Active Proposals', value: activeBids, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                { title: 'Accepted/Active Projects', value: acceptedBids, icon: Award, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
                { title: 'Technical Badges', value: profileData.verifiedBadges?.length || 0, icon: Award, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
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
              {/* Main Marketplace Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Search & Filter Component */}
                <form onSubmit={handleSearchAndFilter} className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search projects by title or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>
                    <button type="submit" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition">
                      Search
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Filter by Skill</label>
                      <input
                        type="text"
                        placeholder="e.g. react, node"
                        value={skillsFilter}
                        onChange={(e) => setSkillsFilter(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Min Budget (₹)</label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Max Budget (₹)</label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </form>

                {/* Project Feed */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Available Projects</h2>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16 bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="bg-white dark:bg-dark-surface p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No projects match your criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map((project, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={project._id}
                          className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4"
                        >
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {project.category}
                              </span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                {typeof project.budget === 'object' && project.budget ? `₹${project.budget.min} - ₹${project.budget.max}` : `₹${project.budget}`}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition">
                                <Link to={`/projects/${project._id}`}>{project.title}</Link>
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {project.skillsRequired?.map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-semibold uppercase">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4 text-primary" />
                                Client: {project.client?.name || 'Vetted Client'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-primary" />
                                Deadline: {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-end min-w-[120px]">
                            <button
                              onClick={() => setSelectedProject(project)}
                              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm shadow-md transition flex items-center gap-1"
                            >
                              Bid Now <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Placed Bids Sidebar */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Placed Bids</h2>
                
                {isBidsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : myBids.length === 0 ? (
                  <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 py-12 text-sm">
                    <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>You haven't placed any bids yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myBids.map((bid) => (
                      <div key={bid._id} className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[180px]">{bid.project?.title || 'Project'}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${
                            bid.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            bid.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                          <span>Bid Amount: <span className="text-emerald-600 dark:text-emerald-400">₹{bid.amount}</span></span>
                          <span>Delivers: {bid.deliveryTime}</span>
                        </div>

                        {bid.status === 'accepted' && bid.project && (
                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                            <button
                              onClick={() => handleOpenProgressModal(bid.project)}
                              className="w-full py-2 bg-primary/15 hover:bg-primary/25 text-primary dark:text-primary-light rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <CheckSquare className="w-3.5 h-3.5" /> Update Progress & Chat
                            </button>

                            {bid.project.status === 'completed' && (
                              <button
                                onClick={() => handleOpenRatingModal(bid.project)}
                                disabled={ratedClients.includes(bid.project._id)}
                                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-transparent ${
                                  ratedClients.includes(bid.project._id)
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/25 animate-pulse'
                                }`}
                              >
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {ratedClients.includes(bid.project._id) ? 'Client Rated' : 'Rate Client'}
                              </button>
                            )}

                            <Link
                              to={`/projects/${bid.project._id}`}
                              className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200/50 dark:border-slate-700/60 shadow-sm"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Project Details Page
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Edit Profile Column */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="text-primary w-5 h-5" /> Account Details & CV Settings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Keep your professional profile updated to receive higher bid acceptance rates from clients.</p>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Profile updated successfully! Changes are synchronized.
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number (phnumber)</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={profileData.phnumber}
                      onChange={(e) => setProfileData({ ...profileData, phnumber: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date of Birth (dob)</label>
                    <input
                      type="date"
                      value={profileData.dob}
                      onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Resume / CV Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://drive.google.com/your-resume"
                      value={profileData.resume}
                      onChange={(e) => setProfileData({ ...profileData, resume: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hourly Rate (₹/hr)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={profileData.hourlyRate}
                      onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead React Developer"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Skills (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, JavaScript, Tailwind"
                    value={profileData.skills}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Professional Bio</label>
                  <textarea
                    rows={4}
                    placeholder="Tell clients about your technical background, skills, and past successes..."
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

            {/* Profile Preview Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Verification Status Slogan Banner */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent p-5 rounded-3xl border border-amber-500/20 shadow-sm relative overflow-hidden space-y-3">
                <div className="absolute top-2 right-2 p-1.5 bg-amber-500/20 rounded-full text-amber-500">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">🚀 Get a Verified Badge!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Stand out to potential clients and get hired up to 3x faster! Take an assessment test to verify your skills and unlock the gold verification badge.
                </p>
                <button 
                  onClick={() => setActiveTab('assessment')}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1"
                >
                  Go to Assessments <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden border-t-[5px] border-t-primary">
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                  Live Preview
                </span>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg relative">
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                      {profileData.verifiedBadges?.length > 0 && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-dark-surface rounded-full" title="Verified Expert"></span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1 leading-snug">
                        {profileData.name || 'Your Name'}
                        {profileData.verifiedBadges?.length > 0 && (
                          <Award className="w-4 h-4 text-amber-500 fill-current animate-pulse" title="Verified Expert" />
                        )}
                      </h4>
                      <p className="text-xs text-slate-400">{profileData.title || 'Professional Title'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate max-w-[180px]">{profileData.email || 'your-email@example.com'}</span>
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
                        <span>DOB: {new Date(profileData.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {profileData.resume && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <a href={profileData.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[180px]">
                          {profileData.resume}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-slate-400" />
                      <span>₹{profileData.hourlyRate || '0'}/hr</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Verified Badges</span>
                    {profileData.verifiedBadges?.length === 0 ? (
                      <span className="text-xs text-slate-400 italic block">No verifications earned yet.</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {profileData.verifiedBadges.map((badge) => {
                          const badgeLabels = {
                            'javascript': 'JS Verified ⚡',
                            'react': 'React Dev 🚀',
                            'html-css': 'Web Stylist 🎨'
                          };
                          return (
                            <span key={badge} className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold border border-amber-500/20 shadow-sm animate-pulse">
                              {badgeLabels[badge] || badge}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="text-primary w-5 h-5 animate-bounce" /> Technical Skills Verification Center
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Test your concepts in JavaScript, React, or HTML/CSS. Score 70% or more to instantly earn the badge!</p>
              </div>
              <Link 
                to="/skills-assessment"
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary/20"
              >
                Open Verification Room
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'javascript', name: 'JavaScript Core', desc: 'Variables, closures, asynchronous loops, callbacks, OOP principles and ES6+ standards.', badge: 'JS Verified ⚡', key: 'javascript' },
                { id: 'react', name: 'React.js Fundamentals', desc: 'Virtual DOM, component hooks, lifecycle events, state structures and state optimization.', badge: 'React Dev 🚀', key: 'react' },
                { id: 'html-css', name: 'HTML & CSS Design', desc: 'Semantic layout tags, advanced layout selectors, Flexbox, responsive grid systems.', badge: 'Web Stylist 🎨', key: 'html-css' },
              ].map((topic) => {
                const hasBadge = profileData.verifiedBadges?.includes(topic.key);
                return (
                  <div key={topic.id} className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {topic.name}
                        {hasBadge && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">{topic.desc}</p>
                    </div>

                    <div className="pt-2 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200/30 dark:border-slate-800 pt-3">
                        <span className="text-slate-400">Verifications Badge:</span>
                        <span className={`px-2 py-0.5 rounded ${hasBadge ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {hasBadge ? topic.badge : 'Not Earned'}
                        </span>
                      </div>

                      <Link
                        to="/skills-assessment"
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          hasBadge 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed pointer-events-none'
                            : 'bg-primary hover:bg-primary-dark text-white'
                        }`}
                      >
                        {hasBadge ? 'Already Verified' : 'Start Verification Assessment'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Place Bid Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Place Bid</h3>
                <p className="text-xs text-slate-500 mt-1">Project: {selectedProject.title}</p>
              </div>

              <form onSubmit={handlePlaceBid} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bid Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 250"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Delivery Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 days"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cover Letter / Proposal</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Introduce yourself and explain why you're a great fit for this job..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBid}
                    className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
                  >
                    {isSubmittingBid ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Progress & Live Message Modal */}
      <AnimatePresence>
        {activeProgressProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  {projectStatus === 'completed' ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">Project Completed</span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">Project in Progress</span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">Manage Project Progress</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[320px]">Project: {activeProgressProject.title}</p>
                </div>
                <button 
                  onClick={() => setActiveProgressProject(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress and Milestones Block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestones Checklist</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500">Project Status:</label>
                    <select
                      value={projectStatus}
                      onChange={(e) => setProjectStatus(e.target.value)}
                      className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-950 dark:text-white text-xs font-semibold focus:ring-1 focus:ring-primary transition"
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {progressMilestones.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No milestones defined for this project.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {progressMilestones.map((milestone, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleToggleMilestone(idx)}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all duration-150"
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={milestone.status === 'completed' || milestone.status === 'paid'}
                            disabled={milestone.status === 'paid'}
                            onChange={() => {}} // handled by parent div click
                            className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-semibold ${
                            milestone.status === 'completed' || milestone.status === 'paid' 
                              ? 'line-through text-slate-400' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {milestone.title}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">₹{milestone.amount}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveProgress}
                  disabled={isSavingProgress}
                  className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isSavingProgress ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Progress...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Save Progress & Status
                    </>
                  )}
                </button>
              </div>

              {/* Live Chat Message Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Live Message to Client
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">Recent messages</span>
                </div>

                {/* Chat History Container */}
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3 space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {isChatLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="animate-spin text-primary w-4 h-4" />
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 italic text-[11px]">
                      No previous chat history. Send your first message below!
                    </div>
                  ) : (
                    chatHistory.slice(-10).map((msg) => {
                      const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed shadow-sm ${
                              isOwn
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-none'
                            }`}
                          >
                            <p className="break-words font-medium">{msg.content}</p>
                            <span className={`text-[8px] block text-right mt-1 font-semibold ${isOwn ? 'text-white/70' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendLiveMessage} className="space-y-3">
                  <div className="relative">
                    <textarea
                      rows={2.5}
                      required
                      value={liveMessage}
                      onChange={(e) => setLiveMessage(e.target.value)}
                      placeholder="Type a live update or question directly to the client's inbox..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Real-time instant delivery</span>
                    <button
                      type="submit"
                      disabled={isSendingMessage || !liveMessage.trim()}
                      className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-60 shadow-sm"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-3 animate-spin" />
                      ) : messageSuccess ? (
                        <>
                          <Check className="w-3 h-3 text-white" /> Sent!
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" /> Send Update Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Star Rating Modal for Client */}
      <AnimatePresence>
        {ratingClientProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-surface max-w-sm w-full rounded-3xl border border-slate-200 dark:border-slate-800/80 p-6 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                disabled={isSubmittingRating}
                onClick={() => setRatingClientProject(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                  <Star className="w-6 h-6 fill-current" />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">Rate Your Client</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Submit a review for the client of <span className="font-bold text-slate-700 dark:text-slate-300">"{ratingClientProject.title}"</span>.
                  </p>
                </div>

                {ratingSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">Rating submitted successfully!</span>
                  </motion.div>
                ) : (
                  <div className="space-y-4 py-2">
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
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full uppercase mt-2">
                        Rating: {ratingValue}.0 Stars
                      </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isSubmittingRating}
                        onClick={() => setRatingClientProject(null)}
                        className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition focus:outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitRating}
                        disabled={isSubmittingRating}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 focus:outline-none"
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
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FreelancerDashboard;
