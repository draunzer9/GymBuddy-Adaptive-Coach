import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Activity, ArrowRight, Zap } from 'lucide-react';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  // Auto-redirect returning users — skip the welcome splash entirely
  useEffect(() => {
    if (localStorage.getItem('gymbuddy_is_registered') === 'true') {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

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
