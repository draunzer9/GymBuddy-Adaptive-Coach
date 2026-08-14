import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, Dumbbell, Activity, Heart, Zap, 
  ChevronRight, Calendar, User, Clock,
  CheckCircle2, Settings, List, Target, Layers, Book,
  CheckSquare, Square, HelpCircle, Search, X, Play, Lightbulb, AlertCircle
} from 'lucide-react';
import { generateWeeklyPlan } from '../services/AICoachService';
import { EQUIPMENT_DATA } from '../data/equipment';
import { saveActiveUserToDb } from '../services/DatabaseService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AmplitudeService } from '../services/AmplitudeService';
import './Onboarding.css';
import '../pages/Dictionary.css'; // Always reuse Dictionary css for uniform modal/detail layouts

// Helper to resolve equipment mapping safely
const getEquipmentItem = (id) => {
  const mapping = {
    barbell: 'barbell',
    dumbbells: 'dumbbells',
    machines: 'machines',
    cable: 'cable',
    kettlebells: 'kettlebell',
    bands: 'resistanceband'
  };
  const targetId = mapping[id] || id;
  return EQUIPMENT_DATA.find(eq => eq.id === targetId);
};

// Overlay for the entire Dictionary within Onboarding (Simplified to show just picture, name, and toggle option)
function OnboardingDictOverlay({ onClose, onSelectEquipment, currentSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Machine', 'Free Weight', 'Accessories'];

  const filtered = useMemo(() => {
    return EQUIPMENT_DATA.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="onboarding-dict-overlay">
      <div className="onboarding-dict-modal">
        {/* Header */}
        <div className="onboarding-dict-header">
          <div>
            <h3>Equipment Dictionary</h3>
            <p>Identify workout tools by name and photo to select available options</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close dictionary">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="dict-search-wrap" style={{ margin: '0 0 12px 0' }}>
          <Search size={16} className="dict-search-icon" style={{ left: '12px' }} />
          <input
            className="dict-search-input"
            style={{ paddingLeft: '36px', height: '42px' }}
            type="text"
            placeholder="Search barbell, dumbbell, machine..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="dict-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="dict-filter-row" style={{ padding: '0 0 12px 0' }}>
          {categories.map(c => (
            <button
              key={c}
              className={`dict-pill ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* List of Equipment */}
        <div className="onboarding-dict-list">
          {filtered.map(item => {
            // Find if this is selectable in Onboarding step 4
            const onboardMapping = {
              'barbell': 'barbell',
              'ezbar': 'barbell',
              'dumbbells': 'dumbbells',
              'machines': 'machines',
              'legpress': 'machines',
              'latpulldown': 'machines',
              'smithmachine': 'machines',
              'cable': 'cable',
              'kettlebell': 'kettlebells',
              'resistanceband': 'bands'
            };
            const onboardId = onboardMapping[item.id];
            const isSelectable = !!onboardId;
            const isChecked = isSelectable && currentSelected.includes(onboardId);

            return (
              <div 
                key={item.id} 
                className={`onboarding-dict-card ${isChecked ? 'active-select' : ''}`}
                style={{ cursor: 'default' }}
              >
                <div className="card-image-wrap">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="card-info">
                  <h4>{item.name}</h4>
                  <span className="card-cat">{item.category}</span>
                  <p className="card-desc" style={{ color: 'var(--text-secondary)' }}>
                    {item.muscles.slice(0, 3).join(' · ')}
                  </p>
                </div>
                
                {isSelectable && (
                  <button 
                    className={`dict-select-btn ${isChecked ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEquipment(onboardId);
                    }}
                  >
                    {isChecked ? 'Selected' : 'Select'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const GOAL_OPTIONS = [
  { id: 'muscle', title: 'Build Muscle', desc: 'Focus on strength training and hypertrophy.', icon: Dumbbell },
  { id: 'weight', title: 'Lose Weight', desc: 'High-intensity cardio and fat-burning routines.', icon: Activity },
  { id: 'fitness', title: 'Improve Fitness', desc: 'Enhance endurance, flexibility, and stamina.', icon: Zap },
  { id: 'healthy', title: 'Stay Healthy', desc: 'General wellness and consistent activity.', icon: Heart }
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  
  // State for selections
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shouldGeneratePlan, setShouldGeneratePlan] = useState(false);
  const [showDict, setShowDict] = useState(false);
  const [goals, setGoals] = useState([]);
  const [experience, setExperience] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [healthConditions, setHealthConditions] = useState([]);
  const [otherCondition, setOtherCondition] = useState('');
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('gymbuddy_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) {
          const first = parsed.name.split(' ')[0];
          setUserName(first);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleNext = () => {
    if (step < totalSteps) {
      // When user taps Next on step 5 (health), trigger plan generation
      if (step === 5) {
        setShouldGeneratePlan(true);
      }
      setStep(step + 1);
    } else {
      // Final step: save flags to localStorage immediately
      localStorage.setItem('gymbuddy_onboarding_done', 'true');
      localStorage.setItem('gymbuddy_is_registered', 'true');
      localStorage.setItem('gymbuddy_experience', experience);
      const goalTitles = goals.map(gId => GOAL_OPTIONS.find(opt => opt.id === gId)?.title).join(', ');
      localStorage.setItem('gymbuddy_goal', goalTitles);
      localStorage.setItem('gymbuddy_equipment_list', JSON.stringify(equipment));
      localStorage.setItem('gymbuddy_active_pain', JSON.stringify(healthConditions));

      // Track analytics
      GoogleSheetsService.trackOnboardingCompleted(goals, equipment, 0);
      AmplitudeService.trackOnboardingCompleted(goals, equipment);

      // Fire-and-forget Firestore save — don't block navigation
      const userId = localStorage.getItem('gymbuddy_active_user_id') || 'unknown_user';
      saveActiveUserToDb(userId).catch(() => {});

      // Navigate instantly — no waiting
      navigate('/home');
    }
  };


  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const toggleGoal = (id) => {
    if (goals.includes(id)) {
      setGoals(goals.filter(g => g !== id));
    } else {
      setGoals([...goals, id]);
    }
  };

  const toggleEquipment = (id) => {
    if (equipment.includes(id)) {
      setEquipment(equipment.filter(e => e !== id));
    } else {
      setEquipment([...equipment, id]);
    }
  };

  const toggleHealthCondition = (id) => {
    if (id === 'none') {
      if (healthConditions.includes('none')) {
        setHealthConditions([]);
      } else {
        setHealthConditions(['none']);
      }
      return;
    }

    if (healthConditions.includes(id)) {
      setHealthConditions(healthConditions.filter(c => c !== id));
    } else {
      const newConditions = healthConditions.filter(c => c !== 'none');
      setHealthConditions([...newConditions, id]);
    }
  };

  useEffect(() => {
    if (!shouldGeneratePlan) return;
    const goalTitles = goals.map(gId => GOAL_OPTIONS.find(opt => opt.id === gId)?.title).join(', ');
    const fetchPlan = async () => {
      setIsGenerating(true);
      const plan = await generateWeeklyPlan({
        goal: goalTitles,
        experience,
        availableTime,
        equipment,
        healthConditions,
        otherCondition
      });
      setWeeklyPlan(plan);
      localStorage.setItem('gymbuddy_weekly_plan', JSON.stringify(plan));
      setIsGenerating(false);
      setStep(7);
    };
    fetchPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldGeneratePlan]);

  return (
    <div className="onboarding-container" style={{ position: 'relative' }}>
      {/* isSaving overlay removed — navigation is now instant */}
      <div className="onboarding-header">
        <div className="onboarding-header-top">
          <h2 className="brand-text">GymBuddy</h2>
          <span className="step-indicator">STEP {step} OF {totalSteps}</span>
        </div>
        <div className="onboarding-progress-bar">
          <div 
            className="onboarding-progress-fill" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="onboarding-content">
        {step === 1 && (
          <div className="step-content page-enter-active">
            <h1>Welcome, {userName || 'Athlete'}! What's your primary goal?</h1>
            <p className="step-description">We'll tailor your workout plans based on your selection.</p>
            
            <div className="options-list">
              {GOAL_OPTIONS.map(opt => (
                <div 
                  key={opt.id} 
                  className={`option-card ${goals.includes(opt.id) ? 'selected' : ''}`}
                  onClick={() => toggleGoal(opt.id)}
                >
                  <div className="option-icon-wrapper">
                    <opt.icon size={24} className="option-icon" />
                  </div>
                  <div className="option-text">
                    <h3>{opt.title}</h3>
                    <p>{opt.desc}</p>
                  </div>
                  {goals.includes(opt.id) ? <CheckSquare size={20} className="check-icon" /> : <Square size={20} className="check-icon" style={{ opacity: 0.3 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content page-enter-active">
            <h1>What's your experience level?</h1>
            <p className="step-description">We'll tailor your workout intensity and exercise selection based on your history.</p>
            
            <div className="options-list">
              {[
                { id: 'beginner', level: 'LEVEL 01', title: 'Beginner', desc: 'New to the gym or returning after a long break. Focus on form and foundations.', icon: Dumbbell },
                { id: 'intermediate', level: 'LEVEL 02', title: 'Intermediate', desc: 'Consistent training for 6-24 months. Familiar with main compound lifts.', icon: Activity },
                { id: 'advanced', level: 'LEVEL 03', title: 'Advanced', desc: '2+ years of structured training. Advanced techniques and programming.', icon: Target }
              ].map(opt => (
                <div 
                  key={opt.id} 
                  className={`option-card ${experience === opt.id ? 'selected' : ''}`}
                  onClick={() => setExperience(opt.id)}
                >
                  <div className="option-icon-wrapper">
                    <opt.icon size={24} className="option-icon" />
                  </div>
                  <div className="option-text">
                    <span className="level-badge">{opt.level}</span>
                    <h3>{opt.title}</h3>
                    <p>{opt.desc}</p>
                  </div>
                  {experience === opt.id && <CheckCircle2 size={20} className="check-icon" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content page-enter-active">
            <h1>How much time do you have?</h1>
            <p className="step-description">We'll tailor your workouts to fit perfectly into your daily schedule.</p>
            
            <div className="options-list">
              {[
                { id: '15-30', title: '15–30 minutes', desc: 'Quick, high-intensity sessions.', icon: Clock },
                { id: '30-45', title: '30–45 minutes', desc: 'Standard effective workouts.', icon: Clock },
                { id: '45-60', title: '45–60 minutes', desc: 'Comprehensive strength and cardio.', icon: Clock },
                { id: '60+', title: '60+ minutes', desc: 'Extended sessions for maximum results.', icon: Clock }
              ].map(opt => (
                <div 
                  key={opt.id} 
                  className={`option-card ${availableTime === opt.id ? 'selected' : ''}`}
                  onClick={() => setAvailableTime(opt.id)}
                >
                  <div className="option-icon-wrapper">
                    <opt.icon size={24} className="option-icon" />
                  </div>
                  <div className="option-text">
                    <h3>{opt.title}</h3>
                    <p>{opt.desc}</p>
                  </div>
                  {availableTime === opt.id && <CheckCircle2 size={20} className="check-icon" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content page-enter-active">
            <h1>What equipment do you have access to?</h1>
            <p className="step-description">We'll tailor your workout plans based on the tools you have available. You can update this anytime in your settings.</p>
            
            <div className="equipment-grid">
              {[
                { id: 'barbell', title: 'BARBELL', desc: 'Standard Olympic or fixed bars', icon: Dumbbell },
                { id: 'dumbbells', title: 'DUMBBELLS', desc: 'Full set or adjustable pairs', icon: Dumbbell },
                { id: 'machines', title: 'MACHINES', desc: 'Plate-loaded or pin-select gym units', icon: Settings },
                { id: 'cable', title: 'CABLE MACHINE', desc: 'Functional trainers or dual stacks', icon: List },
                { id: 'kettlebells', title: 'KETTLEBELLS', desc: 'Various weights for dynamic moves', icon: Target },
                { id: 'bands', title: 'BANDS', desc: 'Loop, tube, or power bands', icon: Layers }
              ].map(opt => (
                <div 
                  key={opt.id} 
                  className={`equipment-card ${equipment.includes(opt.id) ? 'selected' : ''}`}
                  onClick={() => toggleEquipment(opt.id)}
                >
                  <div className="equipment-icon-wrapper">
                    <opt.icon size={28} className="equipment-icon" />
                  </div>
                  <div className="equipment-text">
                    <h3>{opt.title}</h3>
                    <p>{opt.desc}</p>
                  </div>
                  {equipment.includes(opt.id) && <CheckCircle2 size={16} className="check-icon-small" />}
                </div>
              ))}
            </div>
            
            <div className="dictionary-link" onClick={() => setShowDict(true)}>
              <Book size={16} />
              <span>See Equipment Dictionary</span>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="step-content page-enter-active">
            <h1>Health Conditions</h1>
            <p className="step-description">Do you have any health conditions, injuries, or pain points we should know about?</p>
            
            <div className="pill-group" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <div 
                className={`pill ${healthConditions.includes('no') ? 'selected' : ''}`}
                onClick={() => {
                  setHealthConditions(['no']);
                  setOtherCondition('None');
                }}
                style={{ flex: 1, textAlign: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', background: healthConditions.includes('no') ? 'var(--brand-primary)' : 'var(--bg-secondary)', color: healthConditions.includes('no') ? 'var(--bg-primary)' : 'var(--text-primary)', fontWeight: '600' }}
              >
                No
              </div>
              <div 
                className={`pill ${healthConditions.includes('yes') ? 'selected' : ''}`}
                onClick={() => {
                  setHealthConditions(['yes']);
                  if (otherCondition === 'None') setOtherCondition('');
                }}
                style={{ flex: 1, textAlign: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', background: healthConditions.includes('yes') ? 'var(--brand-primary)' : 'var(--bg-secondary)', color: healthConditions.includes('yes') ? 'var(--bg-primary)' : 'var(--text-primary)', fontWeight: '600' }}
              >
                Yes
              </div>
            </div>

            {healthConditions.includes('yes') && (
              <div className="other-input-container" style={{ marginTop: '24px' }}>
                <p style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>Please describe your condition:</p>
                <textarea 
                  className="other-input" 
                  placeholder="e.g., lower back pain, bad knees..." 
                  value={otherCondition}
                  onChange={(e) => setOtherCondition(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '16px', resize: 'vertical' }}
                />
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="step-content page-enter-active ai-generating-step">
            <div className="ai-loader-container">
              <div className="ai-loader-spinner"></div>
              <h2>AI Coach is building your plan...</h2>
              <p>Analyzing your goals, experience, and available equipment.</p>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="step-content page-enter-active weekly-plan-step">
            <h1>Your First Week Plan</h1>
            <p className="step-description">Based on your profile, here are your workouts for this week. Your plan will automatically adapt as you progress.</p>
            
            <div className="weekly-plan-list">
              {weeklyPlan.map((workout, index) => (
                <div className="weekly-workout-card" key={index}>
                  <div className="workout-day">{workout.day}</div>
                  <h3>{workout.title}</h3>
                  <div className="workout-meta">
                    <Clock size={14} /> <span>{workout.duration}</span>
                    <span className="dot">•</span>
                    <Dumbbell size={14} /> <span>{workout.exercisesCount} Exercises</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {step !== 6 && (
        <div className="onboarding-footer">
          {step > 1 && step < 6 && (
            <button className="btn-secondary btn-back" onClick={handleBack}>
              <ArrowLeft size={20} /> Back
            </button>
          )}
          
          <button 
            className={`btn-primary btn-next ${step === 7 ? 'full-width' : ''}`}
            onClick={handleNext}
            disabled={(step === 1 && goals.length === 0) || (step === 2 && !experience) || (step === 3 && !availableTime) || (step === 5 && healthConditions.length === 0) || (step === 5 && healthConditions.includes('yes') && !otherCondition.trim())}
          >
            {step === totalSteps ? 'Start Journey' : 'Next'} {step !== totalSteps && <ArrowRight size={20} />}
          </button>
        </div>
      )}

      {/* Slide-in Equipment Dictionary Modal inside onboarding */}
      {showDict && (
        <OnboardingDictOverlay 
          onClose={() => setShowDict(false)}
          onSelectEquipment={toggleEquipment}
          currentSelected={equipment}
        />
      )}
    </div>
  );
}

export default Onboarding;
