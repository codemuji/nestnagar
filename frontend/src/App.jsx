import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Onboarding from './features/onboarding/pages/Onboarding';
import Home from './features/listings/pages/Home';
import ListingDetail from './features/listings/pages/ListingDetail';
import ChatInbox from './features/chat/pages/ChatInbox';
import ChatRoom from './features/chat/pages/ChatRoom';
import Dashboard from './features/dashboard/pages/Dashboard';
import PostListing from './features/dashboard/pages/PostListing';
import Profile from './features/profile/pages/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {user?.role === 'seeker' ? <Home /> : <Dashboard />}
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/listings/:id" 
          element={
            <ProtectedRoute>
              <ListingDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <Onboarding />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatInbox />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/chat/:id" 
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['broker', 'owner']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/post-listing" 
          element={
            <ProtectedRoute allowedRoles={['broker', 'owner']}>
              <PostListing />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
