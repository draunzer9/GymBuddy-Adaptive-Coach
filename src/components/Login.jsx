import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, X, Share } from 'lucide-react';
import { loadUserFromDb, userExists } from '../services/DatabaseService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // State for alerts and browsers
  const [activeAlert, setActiveAlert] = useState(null);
  const [activeBrowser, setActiveBrowser] = useState(null);
  // Track which specific Google account was clicked
  const [pendingAccount, setPendingAccount] = useState(null);

  const handleSendOTP = (e) => {
    e.preventDefault();
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    if (normalizedPhone.length >= 5) {
      navigate('/otp', { state: { phoneNumber: normalizedPhone } });
    }
  };

  const handleAppleLogin = () => {
    const id = 'apple_user';
    if (loadUserFromDb(id)) {
      // Existing user: data is restored, go to home
      localStorage.setItem('gymbuddy_active_user_id', id);
      GoogleSheetsService.trackLogin();
      navigate('/home');
    } else {
      // New user: save the ID and send to registration
      localStorage.setItem('gymbuddy_active_user_id', id);
      navigate('/register');
    }
  };

  const cancelAlert = () => {
    setActiveAlert(null);
  };

  const continueAlert = () => {
    const provider = activeAlert;
    setActiveAlert(null);
    setActiveBrowser(provider);
  };

  const closeBrowser = () => {
    setActiveBrowser(null);
    setPendingAccount(null);
  };

  // Called when a specific Google account row is clicked
  const completeLoginWithAccount = (name, email) => {
    setActiveBrowser(null);
    // Use the email as the unique user ID for this account
    const id = email;
    if (loadUserFromDb(id)) {
      // Existing user: data restored, go home
      localStorage.setItem('gymbuddy_active_user_id', id);
      GoogleSheetsService.trackLogin();
      navigate('/home');
    } else {
      // New user: pre-seed their name/email, go to registration
      localStorage.setItem('gymbuddy_active_user_id', id);
      localStorage.setItem('gymbuddy_pending_profile', JSON.stringify({ name, email }));
      navigate('/register');
    }
  };

  const completeFacebookLogin = () => {
    setActiveBrowser(null);
    const id = 'facebook_user';
    if (loadUserFromDb(id)) {
      localStorage.setItem('gymbuddy_active_user_id', id);
      navigate('/home');
    } else {
      localStorage.setItem('gymbuddy_active_user_id', id);
      navigate('/register');
    }
  };

  const getDomain = (provider) => {
    return provider === 'google' ? 'accounts.google.com' : 'm.facebook.com';
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <button className="btn-icon-back" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="login-content">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue your fitness journey.</p>

        <form onSubmit={handleSendOTP} className="login-form">
          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary submit-btn">
            Send OTP
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-buttons">
          <button className="btn-social apple" onClick={handleAppleLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.98-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.05 2.53.82 3.2 1.34.8-.62 2.13-1.44 3.66-1.34 1.7.1 3.2.78 4.14 1.95-3.5 2.03-2.9 6.84.58 8.16-.76 1.39-1.9 2.45-3.58 2.86zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.35 2.37-2.18 4.39-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <button className="btn-social google" onClick={() => setActiveAlert('google')}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button className="btn-social facebook" onClick={() => setActiveAlert('facebook')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
            </svg>
            Continue with Facebook
          </button>
        </div>
      </div>

      {/* iOS Style Permission Alert */}
      {activeAlert && (
        <div className="ios-alert-overlay">
          <div className="ios-alert-box">
            <h3 className="ios-alert-title">
              "GymBuddy" Wants to Use "{getDomain(activeAlert)}" to Sign In
            </h3>
            <p className="ios-alert-message">
              This allows the app and website to share information about you.
            </p>
            <div className="ios-alert-actions">
              <button className="ios-alert-btn cancel" onClick={cancelAlert}>Cancel</button>
              <div className="ios-alert-divider"></div>
              <button className="ios-alert-btn continue" onClick={continueAlert}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Safari In-App Browser */}
      {activeBrowser && (
        <div className="safari-overlay">
          <div className="safari-header">
            <button className="safari-header-btn" onClick={closeBrowser}>
              <X size={20} />
            </button>
            <span className="safari-domain">{getDomain(activeBrowser)}</span>
            <button className="safari-header-btn">
              <Share size={20} />
            </button>
          </div>
          
          <div className="safari-content">
            {activeBrowser === 'google' && (
              <div className="google-mock-view">
                <div className="google-mock-header">
                  <div className="google-logo-text">
                    <span style={{color: '#4285F4'}}>G</span>
                    <span style={{color: '#EA4335'}}>o</span>
                    <span style={{color: '#FBBC05'}}>o</span>
                    <span style={{color: '#4285F4'}}>g</span>
                    <span style={{color: '#34A853'}}>l</span>
                    <span style={{color: '#EA4335'}}>e</span>
                  </div>
                  <h2>Choose an account</h2>
                  <p>to continue to GymBuddy</p>
                </div>
                
                <div className="google-account-list">
                  {/* Each account has its own unique email-based ID */}
                  <div className="google-account-item" onClick={() => completeLoginWithAccount('Anish Shankar', 'anishgaya1997@gmail.com')}>
                    <div className="account-avatar blue">A</div>
                    <div className="account-details">
                      <strong>Anish Shankar</strong>
                      <span>anishgaya1997@gmail.com</span>
                    </div>
                  </div>
                  <div className="google-account-item" onClick={() => completeLoginWithAccount('Gaurav Singh', 'devarhunter@gmail.com')}>
                    <div className="account-avatar purple">G</div>
                    <div className="account-details">
                      <strong>Gaurav Singh</strong>
                      <span>devarhunter@gmail.com</span>
                    </div>
                  </div>
                  <div className="google-account-item">
                    <div className="account-avatar outline">
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                    </div>
                    <div className="account-details">
                      <strong>Use another account</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeBrowser === 'facebook' && (
              <div className="facebook-mock-view">
                <div className="facebook-mock-header">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                  </svg>
                </div>
                <div className="facebook-login-box">
                  <input type="text" placeholder="Mobile number or email" className="fb-input" />
                  <input type="password" placeholder="Password" className="fb-input" />
                  <button className="fb-btn" onClick={completeFacebookLogin}>Log In</button>
                  <a href="#" className="fb-forgot">Forgotten password?</a>
                </div>
                <div className="fb-create-container">
                  <button className="fb-create-btn">Create new account</button>
                </div>
                <div className="fb-meta">
                  <span className="meta-text">∞ Meta</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
