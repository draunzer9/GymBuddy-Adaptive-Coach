import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldAlert, Award, Dumbbell, Sparkles, CheckCircle2, ChevronRight, Check, BookOpen, LogOut, Clock } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { EQUIPMENT_DATA } from '../data/equipment';
import { saveActiveUserToDb, clearActiveSession } from '../services/DatabaseService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AmplitudeService } from '../services/AmplitudeService';
import './Profile.css';

const TONE_OPTIONS = [
  { id: 'form', title: 'Form & Safety', desc: 'Focus on biomechanical cues, safety, and detailed posture tips.' },
  { id: 'pace', title: 'Pace & Consistency', desc: 'Focus on steady habits, rest periods, and keeping active.' },
  { id: 'intensity', title: 'Strength & progression', desc: 'Focus on clean load execution, target weights, and effort.' }
];

const PAIN_AREAS = [
  { id: 'knee', label: 'Knee Joint' },
  { id: 'back', label: 'Lower Back' },
  { id: 'shoulder', label: 'Shoulder Joint' },
  { id: 'wrist', label: 'Wrists / Elbows' }
];

function Profile() {
  const navigate = useNavigate();

  // User profile state
  const [userName, setUserName] = useState('GymBuddy Athlete');
  const [userProfile, setUserProfile] = useState({});
  const [experience, setExperience] = useState('beginner');
  const [goal, setGoal] = useState('muscle');
  const [completedWorkouts, setCompletedWorkouts] = useState(0);

  // Profile preferences
  const [selectedTone, setSelectedTone] = useState('form');
  const [selectedEquip, setSelectedEquip] = useState([]);
  const [activePain, setActivePain] = useState([]);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isLockerOpen, setIsLockerOpen] = useState(false);

  useEffect(() => {
    // Load onboarding parameters
    const savedPlan = localStorage.getItem('gymbuddy_weekly_plan');
    const savedCount = localStorage.getItem('gymbuddy_completed_workouts');
    const savedTone = localStorage.getItem('gymbuddy_coach_tone');
    const savedPain = localStorage.getItem('gymbuddy_active_pain');
    const savedProfile = localStorage.getItem('gymbuddy_user_profile');

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile(parsed);
        if (parsed.name) setUserName(parsed.name);
      } catch(e) { console.error(e); }
    }

    // Set completed workouts count
    if (savedCount) {
      setCompletedWorkouts(parseInt(savedCount, 10) || 0);
    }
    
    // Set custom coach preference
    if (savedTone) {
      setSelectedTone(savedTone);
    }

    // Set pain points
    if (savedPain) {
      try { setActivePain(JSON.parse(savedPain)); } catch(e) { console.error(e); }
    }

    // Load active equipment checklist from storage
    // If not found, look at the first week plan configuration or select defaults
    const savedEquip = localStorage.getItem('gymbuddy_equipment_list');
    if (savedEquip) {
      try { setSelectedEquip(JSON.parse(savedEquip)); } catch(e) { console.error(e); }
    } else {
      // Default selections
      setSelectedEquip(['barbell', 'dumbbells', 'machines', 'cable']);
    }

    // Infer user details from local storage or onboarding
    // Experience & Goal defaults
    setExperience(localStorage.getItem('gymbuddy_experience') || 'beginner');
    setGoal(localStorage.getItem('gymbuddy_goal') || 'Build Muscle');
  }, []);

  const handleToneChange = (toneId) => {
    setSelectedTone(toneId);
    localStorage.setItem('gymbuddy_coach_tone', toneId);
  };

  const handlePainToggle = (painId) => {
    const updated = activePain.includes(painId)
      ? activePain.filter(p => p !== painId)
      : [...activePain, painId];
    setActivePain(updated);
    localStorage.setItem('gymbuddy_active_pain', JSON.stringify(updated));
  };

  const handleEquipToggle = (equipId) => {
    const updated = selectedEquip.includes(equipId)
      ? selectedEquip.filter(e => e !== equipId)
      : [...selectedEquip, equipId];
    setSelectedEquip(updated);
    localStorage.setItem('gymbuddy_equipment_list', JSON.stringify(updated));
  };

  const handleLogout = () => {
    // Save the complete current state to database before clearing session
    const userId = localStorage.getItem('gymbuddy_active_user_id');
    if (userId) {
      saveActiveUserToDb(userId);
    }

    // Track log out
    GoogleSheetsService.trackLogout();
    AmplitudeService.trackLogout();

    // Use centralized clear (preserves gymdb_users so other accounts are safe)
    clearActiveSession();

    navigate('/');
  };

  const handleSimulateInactivity = () => {
    // Set last active date to 48 hours ago (2 days)
    const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);
    localStorage.setItem('gymbuddy_last_active_date', twoDaysAgo.toString());
    navigate('/home');
  };

  const currentToneDesc = TONE_OPTIONS.find(t => t.id === selectedTone)?.desc;

  // Infers achievements based on workout completions
  const achievements = [
    { title: 'First Steps', desc: 'Completed your first gym check-in', unlocked: completedWorkouts >= 1 },
    { title: 'Consistency Champ', desc: 'Completed 3+ adaptive workouts', unlocked: completedWorkouts >= 3 },
    { title: 'Adaptation Hero', desc: 'Modified your plan to fit your day', unlocked: completedWorkouts >= 1 },
  ];

  return (
    <div className="profile-page">
      {/* ── Header ─────────────────────────────── */}
      <div className="profile-header">
        <div className="avatar-large">
          <User size={36} color="var(--brand-primary)" />
        </div>
        <div className="profile-meta">
          <h1 className="profile-name">{userName}</h1>
          <p className="profile-subtitle">
            {experience.toUpperCase()} • {goal}
          </p>
        </div>
      </div>

      {/* ── Fitness Consistency ─────────────────── */}
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-num">{completedWorkouts}</span>
          <span className="stat-label">Workouts Completed</span>
        </div>
        <div className="stat-box">
          <span className="stat-num">{completedWorkouts > 0 ? '100%' : '0%'}</span>
          <span className="stat-label">Weekly Adherence</span>
        </div>
      </div>

      {/* ── Personal Info ─────────────────────────── */}
      <section className="profile-section card-section">
        <div 
          className="section-header-clickable" 
          onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}
        >
          <h2 className="section-title">
            <User size={18} color="var(--brand-primary)" />
            Personal Info
          </h2>
          <ChevronRight 
            size={20} 
            color="var(--text-secondary)" 
            style={{ transform: isPersonalInfoOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} 
          />
        </div>
        
        {isPersonalInfoOpen && (
          <div className="personal-info-grid">
            <div className="info-card full-width">
              <span className="info-label">Email</span>
              <span className="info-value">{userProfile.email || 'Not provided'}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Phone</span>
              <span className="info-value">{userProfile.phone || 'Not provided'}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{userProfile.dob || 'Not provided'}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Height</span>
              <span className="info-value">{userProfile.height ? `${userProfile.height} cm` : 'Not provided'}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Weight</span>
              <span className="info-value">{userProfile.weight ? `${userProfile.weight} kg` : 'Not provided'}</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Gym Locker (Equipment) ──────────────── */}
      <section className="profile-section card-section">
        <div 
          className="section-header-clickable" 
          onClick={() => setIsLockerOpen(!isLockerOpen)}
        >
          <h2 className="section-title">
            <Dumbbell size={18} color="var(--brand-primary)" />
            Gym Locker
          </h2>
          <ChevronRight 
            size={20} 
            color="var(--text-secondary)" 
            style={{ transform: isLockerOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} 
          />
        </div>
        
        {isLockerOpen && (
          <>
            <p className="section-description">
              Toggle what tools are currently available. Next generated plans will adapt instantly.
            </p>
            <div className="locker-grid">
              {EQUIPMENT_DATA.slice(0, 8).map(eq => {
                const isAvailable = selectedEquip.includes(eq.id);
                return (
                  <div
                    key={eq.id}
                    className={`locker-card ${isAvailable ? 'available' : ''}`}
                    onClick={() => handleEquipToggle(eq.id)}
                  >
                    <img src={eq.image} alt={eq.name} className="locker-img" />
                    <div className="locker-overlay">
                      <span className="locker-name">{eq.name}</span>
                      <div className="locker-check">
                        {isAvailable ? <CheckCircle2 size={16} color="var(--brand-primary)" fill="rgba(0,0,0,0.6)" /> : <div className="locker-circle" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── Badges & Achievements ───────────────── */}
      <section className="profile-section">
        <h2 className="section-title">
          <Award size={18} color="var(--brand-primary)" />
          Locker Badges
        </h2>
        <div className="achievements-list">
          {achievements.map((ach, idx) => (
            <div key={idx} className={`ach-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
              <div className="ach-icon">
                <Award size={20} color={ach.unlocked ? 'var(--brand-primary)' : 'rgba(255,255,255,0.15)'} />
              </div>
              <div className="ach-info">
                <h4>{ach.title}</h4>
                <p>{ach.desc}</p>
              </div>
              <span className="ach-status">{ach.unlocked ? 'Unlocked' : 'Locked'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Actions / Buttons ───────────────────── */}
      <div className="profile-actions">
        <button className="profile-action-btn" onClick={handleSimulateInactivity} style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderColor: 'rgba(255, 68, 68, 0.2)' }}>
          <Clock size={16} />
          <span>Simulate 2 Days Inactivity</span>
        </button>
        <button className="profile-action-btn dict-btn" onClick={() => navigate('/dictionary')}>
          <BookOpen size={16} />
          <span>See Equipment Dictionary</span>
        </button>
        <button className="profile-action-btn logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
}

export default Profile;
