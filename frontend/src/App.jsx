import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { initSocket } from './features/chat/socket';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Onboarding from './features/onboarding/pages/Onboarding';
import Home from './features/listings/pages/Home';
import ListingDetail from './features/listings/pages/ListingDetail';
import ChatInbox from './features/chat/pages/ChatInbox';
import ChatRoom from './features/chat/pages/ChatRoom';
import Dashboard from './features/dashboard/pages/Dashboard';
import PostListing from './features/dashboard/pages/PostListing';
import EditListing from './features/dashboard/pages/EditListing';
import Profile from './features/profile/pages/Profile';
import PartnersFeed from './features/partners/pages/PartnersFeed';
import CreatePartnerCard from './features/partners/pages/CreatePartnerCard';

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
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [unreadNotifications, setUnreadNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = initSocket(token);
      
      const handleNotification = (data) => {
        if (data.type === 'new-message') {
          setUnreadNotifications(true);
        }
      };

      socket.on('notification', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
      };
    }
  }, [isAuthenticated, token]);

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
              {user?.role === 'seeker' ? (
                // Redirect to onboarding if seekerProfile is missing or locality is empty (indicating it's just defaults)
                (!user.seekerProfile || !user.seekerProfile.locality) ? <Navigate to="/onboarding" /> : <Home unread={unreadNotifications} setUnread={setUnreadNotifications} />
              ) : (
                <Dashboard unread={unreadNotifications} setUnread={setUnreadNotifications} />
              )}
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
          path="/partners" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <PartnersFeed />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/partners/create" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <CreatePartnerCard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatInbox unread={unreadNotifications} setUnread={setUnreadNotifications} />
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
              <Dashboard unread={unreadNotifications} setUnread={setUnreadNotifications} />
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
          path="/listings/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['broker', 'owner']}>
              <EditListing />
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
