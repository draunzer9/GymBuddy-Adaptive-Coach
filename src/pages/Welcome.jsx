import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-overlay"></div>
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to<br/><span>GymBuddy</span> 💪</h1>
        <p className="welcome-subtitle">Your AI fitness companion<br/>that adapts to you.</p>
        
        <button 
          className="btn btn-primary welcome-btn" 
          onClick={() => navigate('/onboarding')}
        >
          Get Started
        </button>
        
        <div className="welcome-login">
          Already have an account? <a href="#">Log In</a>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
