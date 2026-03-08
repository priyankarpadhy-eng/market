// Cache buster: 2026-03-05 18:32
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import FeatureRequests from './pages/FeatureRequests';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import Members from './pages/Members';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import Music from './pages/Music';
import Events from './pages/Events';
import Rides from './pages/Rides';
import { useAuth } from './contexts/AuthContext';
import EmailVerificationModal from './components/auth/EmailVerificationModal';

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Root Route: Landing for guests, Home for users */}
      <Route path="/" element={currentUser ? <Layout><Home /></Layout> : <Landing />} />

      {/* HomeLayout is a helper to wrap Home if needed, but since Layout captures children, we use: */}
      {/* <Route path="/" element={currentUser ? <Layout><Home /></Layout> : <Landing />} /> */}

      {/* Public routes */}
      <Route path="/auth" element={!currentUser ? <Auth /> : <Navigate to="/" />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/support" element={<Support />} />
      <Route path="/post/:postId" element={<Layout><PostDetail /></Layout>} />

      {/* Protected routes inside Layout */}
      <Route element={(currentUser && !currentUser.isAnonymous) ? <Layout /> : <Navigate to="/" />}>
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/rides" element={<Rides />} />
        <Route path="/events" element={<Events />} />
        <Route path="/music" element={<Music />} />
        <Route path="/feature-requests" element={<FeatureRequests />} />
        <Route path="/members" element={<Members />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    // Seeding disabled to remove all dummy data as requested
    setSeeding(false);
  }, []);

  if (seeding) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Inter, sans-serif',
        background: '#f8f9fb',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s ease infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading Marketplace...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <EmailVerificationModal />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
