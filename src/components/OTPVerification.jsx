import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { loadUserFromDb } from '../services/DatabaseService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import './OTPVerification.css';

function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || 'unknown_phone';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 4) {
      // Try to restore existing user data from DB using their phone as the key
      if (loadUserFromDb(phoneNumber)) {
        // Returning user: all their data is now restored to localStorage
        localStorage.setItem('gymbuddy_active_user_id', phoneNumber);
        GoogleSheetsService.trackLogin();
        navigate('/home');
      } else {
        // Brand new phone number — they haven't registered yet
        // Save phone as the active user ID and go to registration
        localStorage.setItem('gymbuddy_active_user_id', phoneNumber);
        navigate('/register');
      }
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-header">
        <button className="btn-icon-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="otp-content">
        <h1 className="otp-title">Verify Phone</h1>
        <p className="otp-subtitle">
          We've sent a 4-digit verification code to your phone number.
        </p>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-digit-input"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={otp.join('').length !== 4}
          >
            Verify & Continue
          </button>
        </form>

        <div className="resend-container">
          {timer > 0 ? (
            <p>Resend code in <span className="timer-text">0:{timer.toString().padStart(2, '0')}</span></p>
          ) : (
            <button className="btn-resend" onClick={() => setTimer(30)}>
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;
