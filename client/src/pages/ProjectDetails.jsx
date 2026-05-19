import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore, { api } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Users, 
  Check, 
  X, 
  MessageSquare, 
  Video, 
  ArrowLeft, 
  Calendar, 
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [myBid, setMyBid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidsLoading, setIsBidsLoading] = useState(false);
  
  // Freelancer bid submission state
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
      
      // If user is client, fetch all bids for this project
      if (user?.role === 'client' || user?.role === 'admin') {
        fetchProjectBids();
      } else if (user?.role === 'freelancer') {
        fetchFreelancerBids();
      }
    } catch (error) {
      console.error('Failed to fetch project details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectBids = async () => {
    setIsBidsLoading(true);
    try {
      const response = await api.get(`/bids/project/${id}`);
      setBids(response.data);
    } catch (error) {
      console.error('Failed to fetch project bids', error);
    } finally {
      setIsBidsLoading(false);
    }
  };

  const fetchFreelancerBids = async () => {
    try {
      const response = await api.get('/bids/mybids');
      const foundBid = response.data.find(b => b.project?._id === id || b.project === id);
      if (foundBid) {
        setMyBid(foundBid);
      }
    } catch (error) {
      console.error('Failed to fetch freelancer bids', error);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to accept this proposal? This will assign the freelancer and mark the project as in-progress.')) return;
    try {
      await api.put(`/bids/${bidId}/accept`);
      alert('Bid accepted successfully!');
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await api.put(`/bids/${bidId}/reject`);
      fetchProjectBids();
    } catch (error) {
      alert('Failed to reject bid');
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setIsSubmittingBid(true);
    try {
      const payload = {
        project: id,
        amount: Number(bidAmount),
        deliveryTime,
        coverLetter,
      };
      await api.post('/bids', payload);
      alert('Your proposal has been submitted successfully!');
      setBidAmount('');
      setDeliveryTime('');
      setCoverLetter('');
      fetchProjectDetails();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The project you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isClientOwner = project.client?._id === user?._id || project.client === user?._id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              {/* Status & Date */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  project.status === 'open' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                  project.status === 'in-progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' :
                  'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {project.status} status
                </span>
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Posted {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {project.title}
              </h1>

              {/* Quick Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-y border-slate-100 dark:border-slate-800 my-6">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Budget Range</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <IndianRupee className="w-5 h-5 -ml-1 text-emerald-500" />
                    ₹{project.budget?.min} - ₹{project.budget?.max}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Deadline</p>
                  <p className="text-base sm:text-lg font-bold text-slate-855 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Client name</p>
                  <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {project.client?.name || 'Client'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Project Description</h3>
                <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Required Skills */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired?.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold uppercase tracking-wider"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              {project.milestones && project.milestones.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Milestones</h3>
                  <div className="space-y-3">
                    {project.milestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{milestone.title}</span>
                        </div>
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">₹{milestone.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Bids List (Only seen by Project Client Owner when project is Open) */}
            {isClientOwner && project.status === 'open' && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Proposals Received ({bids.length})</h2>

                {isBidsLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : bids.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm">No proposals placed yet on this project.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div 
                        key={bid._id} 
                        className="p-5 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                {bid.freelancer?.name}
                                {bid.freelancer?.verifiedBadges?.includes('js') && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Verified JS Specialist"></span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-400 font-medium capitalize">
                                {bid.freelancer?.title || 'Professional Freelancer'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">₹{bid.amount}</span>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Bid amount</p>
                            </div>
                          </div>

                          <div className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 my-4">
                            <span className="font-bold block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Cover Letter</span>
                            <p className="whitespace-pre-line leading-relaxed">{bid.coverLetter}</p>
                          </div>

                          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                            <span>Delivery Time: <span className="text-primary font-bold">{bid.deliveryTime}</span></span>
                            {bid.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptBid(bid._id)}
                                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition flex items-center gap-1 font-bold text-xs"
                                >
                                  <Check className="w-3.5 h-3.5" /> Accept Proposal
                                </button>
                                <button
                                  onClick={() => handleRejectBid(bid._id)}
                                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition flex items-center gap-1 font-bold text-xs"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className={`capitalize text-xs px-3 py-1 rounded-full font-bold ${
                                bid.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                              }`}>
                                Proposal {bid.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Context Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* If Current User is Client (Owner) */}
            {isClientOwner ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5"
              >
                <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Contract Details
                </h3>

                {project.status === 'open' && (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      This project is currently active and open for bidding. Evaluate proposals from the left sidebar to hire a freelancer.
                    </p>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-450 text-xs flex gap-2.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Funds will be held securely in escrow until milestones are released.</span>
                    </div>
                  </div>
                )}

                {(project.status === 'in-progress' || project.status === 'completed') && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Assigned Freelancer</p>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {project.freelancerAssigned?.name?.charAt(0).toUpperCase() || 'F'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{project.freelancerAssigned?.name}</h4>
                          <p className="text-xs text-slate-400 truncate max-w-[150px]">{project.freelancerAssigned?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <Link 
                        to={`/chat?userId=${project.freelancerAssigned?._id}`}
                        className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md"
                      >
                        <MessageSquare className="w-4 h-4" /> Message Freelancer
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* If Current User is Freelancer (or other user type) */
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Client Info Block */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    About the Client
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-350 capitalize">
                      {project.client?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">{project.client?.name}</h4>
                      <p className="text-xs text-slate-400">Client Partner</p>
                    </div>
                  </div>
                </div>

                {/* Freelancer Action Side Panel */}
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                    Your Application
                  </h3>

                  {/* Case 1: Hired / Assigned Freelancer */}
                  {project.freelancerAssigned?._id === user?._id && (
                    <div className="space-y-4 text-center">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-emerald-800 dark:text-emerald-400">
                        <Award className="w-12 h-12 mx-auto mb-2 text-emerald-500 animate-bounce" />
                        <h4 className="font-bold text-sm">Congratulations!</h4>
                        <p className="text-xs mt-1 leading-relaxed">You have been hired for this project. Let's work hard and deliver standard outcomes.</p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Link 
                          to={`/chat?userId=${project.client?._id}`}
                          className="w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md"
                        >
                          <MessageSquare className="w-4 h-4" /> Message Client
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Case 2: Project is Open & Freelancer Has Already Bid */}
                  {project.freelancerAssigned?._id !== user?._id && myBid && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border text-xs font-semibold text-center ${
                        myBid.status === 'accepted' ? 'bg-emerald-50 border-emerald-250 text-emerald-800' :
                        myBid.status === 'rejected' ? 'bg-red-50 border-red-250 text-red-800' :
                        'bg-amber-50 border-amber-250 text-amber-850 dark:bg-amber-950/10 dark:border-amber-900/60 dark:text-amber-400'
                      }`}>
                        Application Status: <span className="uppercase font-bold">{myBid.status}</span>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                          <span>Your Bid</span>
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm">₹{myBid.amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                          <span>Delivery time</span>
                          <span>{myBid.deliveryTime}</span>
                        </div>
                        <div className="text-xs text-slate-500 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="font-bold block text-[10px] text-slate-400 uppercase mb-1">Proposal Pitch</span>
                          <p className="line-clamp-4">{myBid.coverLetter}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case 3: Project is Open & Freelancer Has NOT Bid Yet */}
                  {project.freelancerAssigned?._id !== user?._id && !myBid && project.status === 'open' && (
                    <form onSubmit={handlePlaceBid} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Bid Amount (₹)</label>
                          <input 
                            type="number"
                            required
                            placeholder="e.g. 200"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Delivery Time</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. 3 days"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cover Letter / Proposal</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="Why are you a perfect fit for this job? Tell the client about your unique expertise..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingBid}
                        className="w-full px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-md transition"
                      >
                        {isSubmittingBid ? 'Submitting Application...' : 'Place Proposal Bid'}
                      </button>
                    </form>
                  )}

                  {/* Case 4: Project is In-Progress or Completed and User is NOT the assigned freelancer */}
                  {project.freelancerAssigned?._id !== user?._id && !myBid && project.status !== 'open' && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/80 text-slate-500 rounded-xl text-center text-xs font-medium">
                      This project is no longer accepting bids.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
