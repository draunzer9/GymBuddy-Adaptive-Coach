import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, ArrowRight, Zap } from 'lucide-react';
import { loadUserFromDb } from '../services/DatabaseService';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  // Auto-redirect returning users — skip the welcome splash entirely
  useEffect(() => {
    const checkSession = async () => {
      const userId = localStorage.getItem('gymbuddy_active_user_id');
      const isRegistered = localStorage.getItem('gymbuddy_is_registered');

      if (userId && isRegistered === 'true') {
        // Fast path: user has a valid local session
        navigate('/home', { replace: true });
        return;
      }

      if (userId && !isRegistered) {
        // Edge case: user ID exists but is_registered got lost
        // (e.g. browser cleared partial storage, or old session bug)
        // Try to recover from Firestore
        try {
          const restored = await loadUserFromDb(userId);
          if (restored) {
            localStorage.setItem('gymbuddy_active_user_id', userId);
            navigate('/home', { replace: true });
            return;
          }
        } catch (e) {
          console.error('Firestore re-sync failed:', e);
        }
      }

      setIsChecking(false);
    };

    checkSession();
  }, [navigate]);

  // Show nothing while we're checking the session to prevent flash of welcome screen
  if (isChecking) {
    return (
      <div className="welcome-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <div className="welcome-background">
        <div className="welcome-overlay"></div>
      </div>
      
      <div className="welcome-content">
        <div className="welcome-header">
          <div className="badge">
            <Zap size={14} className="badge-icon" />
            <span>NEXT-GEN TRAINING</span>
          </div>
          <h1 className="welcome-logo">GymBuddy <span className="emoji">💪</span></h1>
          <p className="welcome-subtitle">
            Your AI fitness companion that <strong>adapts to you.</strong> Serious data for serious results.
          </p>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Dumbbell size={20} className="feature-icon" />
            </div>
            <h3>AI COACHING</h3>
            <p>Dynamic weight & rep scaling.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Activity size={20} className="feature-icon" />
            </div>
            <h3>PRECISION DATA</h3>
            <p>Advanced tracking & metrics.</p>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="btn btn-purple get-started-btn"
            onClick={() => navigate('/register')}
          >
            Get Started <ArrowRight size={20} />
          </button>
          <button 
            className="btn btn-secondary login-btn"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
          
          <p className="footer-text">EMPOWERING 200K+ ATHLETES GLOBALLY</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

