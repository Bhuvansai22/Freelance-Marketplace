import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { io } from 'socket.io-client';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import ClientDashboard from './pages/ClientDashboard';
import PostProject from './pages/PostProject';
import FreelancerDashboard from './pages/FreelancerDashboard';
import SkillsAssessment from './pages/SkillsAssessment';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AIAssessment from './pages/AIAssessment';
import Chat from './pages/Chat';
import Landing from './pages/Landing';
import ProjectDetails from './pages/ProjectDetails';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home Routing Page
const HomeRedirect = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'client') {
    return <Navigate to="/client-dashboard" replace />;
  }

  return <Navigate to="/freelancer-dashboard" replace />;
};


function App() {
  const { user, setHasUnreadMessages } = useAuthStore();

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    let SOCKET_URL = import.meta.env.VITE_API_URL || 
      (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://freelance-marketplace-dk90.onrender.com');

    if (SOCKET_URL.endsWith('/')) {
      SOCKET_URL = SOCKET_URL.slice(0, -1);
    }
    if (SOCKET_URL.endsWith('/api')) {
      SOCKET_URL = SOCKET_URL.slice(0, -4);
    }

    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
    });

    socket.emit('register_user', user._id);

    socket.on('new_message_notification', () => {
      // If user is not currently on the chat page, show the bell notification
      if (!window.location.pathname.includes('/chat')) {
        setHasUnreadMessages(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setHasUnreadMessages]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Client Dashboard Routes */}
          <Route 
            path="/client-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post-project" 
            element={
              <ProtectedRoute allowedRoles={['client', 'admin']}>
                <PostProject />
              </ProtectedRoute>
            } 
          />

          {/* Freelancer Dashboard Routes */}
          <Route 
            path="/freelancer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['freelancer', 'admin']}>
                <FreelancerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/skills-assessment" 
            element={
              <ProtectedRoute allowedRoles={['freelancer', 'admin']}>
                <SkillsAssessment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume-analyzer" 
            element={
              <ProtectedRoute allowedRoles={['freelancer', 'admin']}>
                <ResumeAnalyzer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-assessment" 
            element={
              <ProtectedRoute allowedRoles={['freelancer', 'admin']}>
                <AIAssessment />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Chat Route */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projects/:id" 
            element={
              <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
                <ProjectDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={<HomeRedirect />} 
          />
          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster position="top-center" toastOptions={{
        className: 'dark:bg-dark-surface dark:text-white dark:border dark:border-slate-800',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
      }} />
    </Router>
  );
}

export default App;
