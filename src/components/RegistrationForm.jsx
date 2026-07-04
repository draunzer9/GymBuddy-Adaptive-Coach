import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, Ruler, Weight } from 'lucide-react';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import './RegistrationForm.css';

function RegistrationForm() {
  const navigate = useNavigate();

  // Pre-fill name/email if coming from social login (Google/Apple)
  const pendingProfile = (() => {
    try {
      const p = localStorage.getItem('gymbuddy_pending_profile');
      return p ? JSON.parse(p) : {};
    } catch { return {}; }
  })();

  const [formData, setFormData] = useState({
    name: pendingProfile.name || '',
    email: pendingProfile.email || '',
    phone: '',
    dob: '',
    gender: '',
    height: '',
    weight: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Determine userId: use existing active_user_id (social) or phone number (OTP)
    const existingId = localStorage.getItem('gymbuddy_active_user_id');
    const userId = existingId || formData.phone || 'unknown_user';

    // Save full profile
    localStorage.setItem('gymbuddy_user_profile', JSON.stringify(formData));
    localStorage.setItem('gymbuddy_is_registered', 'true');
    localStorage.setItem('gymbuddy_active_user_id', userId);
    // Clean up pending profile helper key
    localStorage.removeItem('gymbuddy_pending_profile');

    GoogleSheetsService.trackRegistration(formData);

    // Proceed to onboarding flow
    navigate('/onboarding');
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <button className="btn-icon-back" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="registration-title">Create Profile</h1>
        <div style={{ width: 24 }}></div> {/* spacer */}
      </div>

      <div className="registration-content">
        <p className="registration-subtitle">Let's get to know you better to personalize your GymBuddy experience.</p>

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input 
                type="tel" 
                name="phone"
                placeholder="+1 (555) 000-0000" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label>Date of Birth</label>
              <div className="input-wrapper">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" 
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group half-width">
              <label>Gender</label>
              <div className="input-wrapper">
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="" disabled>Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label>Height (cm)</label>
              <div className="input-wrapper">
                <Ruler size={18} className="input-icon" />
                <input 
                  type="number" 
                  name="height"
                  placeholder="175" 
                  value={formData.height}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group half-width">
              <label>Weight (kg)</label>
              <div className="input-wrapper">
                <Weight size={18} className="input-icon" />
                <input 
                  type="number" 
                  name="weight"
                  placeholder="70" 
                  value={formData.weight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary submit-btn">
              Continue to Goals
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
