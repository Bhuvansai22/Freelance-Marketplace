import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClientDashboard from './pages/ClientDashboard';
import PostProject from './pages/PostProject';
import FreelancerDashboard from './pages/FreelancerDashboard';
import SkillsAssessment from './pages/SkillsAssessment';
import Chat from './pages/Chat';
import Landing from './pages/Landing';
import ProjectDetails from './pages/ProjectDetails';

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
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-200">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
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
          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
