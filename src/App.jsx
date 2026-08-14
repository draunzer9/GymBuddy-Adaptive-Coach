import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import './index.css';

/**
 * Guards a route — redirects to "/" if user is not logged in.
 * Uses a fast synchronous localStorage check only.
 * Firestore fallback recovery is handled once by Welcome.jsx on app startup.
 */
function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('gymbuddy_active_user_id');
  const isRegistered = localStorage.getItem('gymbuddy_is_registered');
  if (!userId || isRegistered !== 'true') {
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

