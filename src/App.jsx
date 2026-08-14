import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import OTPVerification from './components/OTPVerification';
import Onboarding from './components/Onboarding';
import RegistrationForm from './components/RegistrationForm';
import Home from './pages/Home';
import Workouts from './pages/Workouts';
import Dictionary from './pages/Dictionary';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import { loadUserFromDb } from './services/DatabaseService';
import './index.css';

/**
 * Guards a route — redirects to "/" if user is not logged in.
 * A user is considered logged in if they have an active_user_id
 * AND have completed registration (gymbuddy_is_registered).
 * 
 * If active_user_id exists but is_registered is missing, attempts
 * a Firestore fallback restore before redirecting (handles edge cases
 * where localStorage was partially cleared by the browser).
 */
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    const verify = async () => {
      const userId = localStorage.getItem('gymbuddy_active_user_id');
      const isRegistered = localStorage.getItem('gymbuddy_is_registered');

      if (userId && isRegistered === 'true') {
        // Fast path — everything is in localStorage
        setStatus('allowed');
        return;
      }

      if (userId && !isRegistered) {
        // User ID present but registration flag missing — try Firestore restore
        try {
          const restored = await loadUserFromDb(userId);
          if (restored) {
            localStorage.setItem('gymbuddy_active_user_id', userId);
            setStatus('allowed');
            return;
          }
        } catch (e) {
          console.error('ProtectedRoute: Firestore restore failed:', e);
        }
      }

      // No valid session
      setStatus('denied');
    };

    verify();
  }, []);

  if (status === 'checking') {
    // Brief loading state while we verify (prevents flash of redirect)
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', backgroundColor: 'var(--bg-primary, #0a0a1a)',
        color: 'var(--text-secondary, #999)', fontSize: '14px'
      }}>
        Loading...
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTPVerification />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected routes – requires a logged-in user */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
          <Route path="/dictionary" element={<ProtectedRoute><Dictionary /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

