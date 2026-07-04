import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, 
  Activity, Flame, Heart, Target, 
  Clock, Dumbbell, CircleDot, 
  BoxSelect, Layers, Search, X, HelpCircle
} from 'lucide-react';
import './Onboarding.css';
import { EQUIPMENT_DATA } from '../data/equipment';

const goals = [
  { id: 'muscle', label: 'Build Muscle', icon: Dumbbell },
  { id: 'weight', label: 'Lose Weight', icon: Flame },
  { id: 'fitness', label: 'Improve Fitness', icon: Activity },
  { id: 'health', label: 'Stay Healthy', icon: Heart },
];

const experience = [
  { id: 'beginner', label: 'Beginner', icon: CircleDot },
  { id: 'intermediate', label: 'Intermediate', icon: Layers },
  { id: 'advanced', label: 'Advanced', icon: Target },
];

const times = [
  { id: '10-20', label: '10–20 min' },
  { id: '20-30', label: '20–30 min' },
  { id: '30-45', label: '30–45 min' },
  { id: '45-60', label: '45–60 min' },
  { id: '60+', label: '60+ min' },
];

const equipment = [
  { id: 'barbell', label: 'Barbell', icon: Dumbbell, desc: 'Long steel bar for heavy lifting' },
  { id: 'dumbbells', label: 'Dumbbells', icon: Dumbbell, desc: 'Handheld pairs of weights' },
  { id: 'machines', label: 'Machines', icon: BoxSelect, desc: 'Guided-weight path equipment' },
  { id: 'cable', label: 'Cable Machine', icon: Activity, desc: 'Pulley-based constant tension' },
];

// Equipment list overlay component inside onboarding
function OnboardingDictOverlay({ onClose, onSelectEquipment, currentSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

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
            <p>Tap equipment to learn what it is or select it</p>
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
            const isSelectable = ['barbell', 'dumbbells', 'machines', 'cable'].includes(item.id);
            const isChecked = currentSelected.includes(item.id);

            return (
              <div 
                key={item.id} 
                className={`onboarding-dict-card ${isChecked ? 'active-select' : ''}`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="card-image-wrap">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="card-info">
                  <h4>{item.name}</h4>
                  <span className="card-cat">{item.category}</span>
                  <p className="card-desc">{item.description}</p>
                </div>
                
                {isSelectable && (
                  <button 
                    className={`dict-select-btn ${isChecked ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEquipment(item.id);
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

      {/* Deep-dive Detail sheet inside the overlay */}
      {selectedItem && (
        <div className="dict-sheet-overlay" style={{ zIndex: 300 }} onClick={() => setSelectedItem(null)}>
          <div className="dict-sheet" onClick={e => e.stopPropagation()}>
            <button className="dict-sheet-close" onClick={() => setSelectedItem(null)}>
              <X size={20} />
            </button>
            <div className="dict-sheet-header">
              <span className="dict-sheet-category">{selectedItem.category}</span>
              <h2 className="dict-sheet-title">{selectedItem.name}</h2>
              <p className="dict-sheet-desc">{selectedItem.description}</p>
            </div>
            
            <div className="dict-video-thumb">
              <img src={`https://img.youtube.com/vi/${selectedItem.videoId}/hqdefault.jpg`} alt={selectedItem.name} />
              <div className="dict-play-overlay">
                <div className="dict-play-btn"><Play size={22} fill="white" color="white" /></div>
              </div>
              <span className="dict-video-label">▶ Video Tutorial</span>
            </div>

            <div className="dict-section">
              <p className="dict-section-label">📋 How to Use</p>
              <ol className="dict-steps">
                {selectedItem.howToUse.map((step, i) => (
                  <li key={i}>
                    <span className="dict-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="dict-section dict-alt-section" style={{ marginTop: '16px' }}>
              <p className="dict-section-label">⚠️ Alternative Equipment</p>
              <div className="dict-tags">
                {selectedItem.alternatives.map((alt, i) => (
                  <span key={i} className="dict-tag dict-tag-alt">{alt}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    goal: '',
    level: '',
    time: '',
    equip: []
  });
  const [showDict, setShowDict] = useState(false);
  const [quickDetailItem, setQuickDetailItem] = useState(null);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('/');
  };

  const toggleEquipment = (id) => {
    setSelections(prev => {
      const equip = prev.equip.includes(id)
        ? prev.equip.filter(e => e !== id)
        : [...prev.equip, id];
      return { ...prev, equip };
    });
  };

  const openQuickDetail = (e, id) => {
    e.stopPropagation();
    const item = EQUIPMENT_DATA.find(eq => eq.id === id);
    if (item) setQuickDetailItem(item);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="options-container page-enter-active">
            {goals.map(g => (
              <div 
                key={g.id} 
                className={`option-card ${selections.goal === g.id ? 'selected' : ''}`}
                onClick={() => setSelections({...selections, goal: g.id})}
              >
                <div className="option-icon"><g.icon size={20} /></div>
                <div className="option-label">{g.label}</div>
                {selections.goal === g.id && <CheckCircle2 size={20} color="var(--brand-primary)" />}
              </div>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="options-container page-enter-active">
            {experience.map(e => (
              <div 
                key={e.id} 
                className={`option-card ${selections.level === e.id ? 'selected' : ''}`}
                onClick={() => setSelections({...selections, level: e.id})}
              >
                <div className="option-icon"><e.icon size={20} /></div>
                <div className="option-label">{e.label}</div>
                {selections.level === e.id && <CheckCircle2 size={20} color="var(--brand-primary)" />}
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="options-container page-enter-active">
            {times.map(t => (
              <div 
                key={t.id} 
                className={`option-card ${selections.time === t.id ? 'selected' : ''}`}
                onClick={() => setSelections({...selections, time: t.id})}
              >
                <div className="option-icon"><Clock size={20} /></div>
                <div className="option-label">{t.label}</div>
                {selections.time === t.id && <CheckCircle2 size={20} color="var(--brand-primary)" />}
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="page-enter-active">
            <div className="options-grid" style={{ paddingBottom: '0' }}>
              {equipment.map(e => (
                <div 
                  key={e.id} 
                  className={`grid-card ${selections.equip.includes(e.id) ? 'selected' : ''}`}
                  onClick={() => toggleEquipment(e.id)}
                  style={{ position: 'relative' }}
                >
                  <button 
                    className="info-help-btn"
                    onClick={(evt) => openQuickDetail(evt, e.id)}
                    title={`What is a ${e.label}?`}
                    aria-label={`What is a ${e.label}?`}
                  >
                    <HelpCircle size={16} />
                  </button>
                  <e.icon size={32} className="grid-icon" />
                  <div className="grid-label">{e.label}</div>
                  <div className="grid-sub-label" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {e.desc}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Unsure what these are? </span>
              <span 
                onClick={() => setShowDict(true)} 
                style={{ color: 'var(--brand-primary)', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}
              >
                See Equipment Dictionary
              </span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="plan-ready-container page-enter-active">
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', backgroundColor: 'var(--brand-light)', marginBottom: '24px' }}>
                <CheckCircle2 size={48} color="var(--brand-primary)" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Your Plan is Ready!</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>We've created a custom plan based on your goal and equipment.</p>
            </div>
            
            <div className="plan-summary">
              <div className="summary-item">
                <CheckCircle2 size={20} />
                <span className="summary-text">3 Workouts / Week</span>
              </div>
              <div className="summary-item">
                <CheckCircle2 size={20} />
                <span className="summary-text">{selections.time || '20-30'} min / Workout</span>
              </div>
              <div className="summary-item">
                <CheckCircle2 size={20} />
                <span className="summary-text">Equipment based</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const titles = [
    "What's your primary goal?",
    "What's your experience level?",
    "How much time can you work out?",
    "What equipment do you have access to?",
    ""
  ];

  const subtitles = [
    "We'll personalize your plan around this.",
    "This helps us suggest the right plan for you.",
    "Be honest, we'll adapt to it.",
    "Select all that are available in your gym.",
    ""
  ];

  return (
    <div className="app-container">
      <div className="onboarding-container">
        {step < 5 && (
          <header className="onboarding-header">
            <ArrowLeft size={24} onClick={handleBack} style={{ cursor: 'pointer' }} />
            <div className="step-indicator">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
              ))}
            </div>
            <div style={{ width: 24 }}></div> {/* Spacer */}
          </header>
        )}

        {step < 5 && (
          <div>
            <h1 className="onboarding-title">{titles[step-1]}</h1>
            <p className="onboarding-subtitle">{subtitles[step-1]}</p>
          </div>
        )}

        {renderStep()}

        <footer className="onboarding-footer">
          {step < 5 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/home')}>
              View My Plan
            </button>
          )}
        </footer>
      </div>

      {/* Slide-in Equipment Dictionary Modal inside onboarding */}
      {showDict && (
        <OnboardingDictOverlay 
          onClose={() => setShowDict(false)}
          onSelectEquipment={toggleEquipment}
          currentSelected={selections.equip}
        />
      )}

      {/* Quick Details sheet for info buttons */}
      {quickDetailItem && (
        <div className="dict-sheet-overlay" style={{ zIndex: 300 }} onClick={() => setQuickDetailItem(null)}>
          <div className="dict-sheet" onClick={e => e.stopPropagation()}>
            <button className="dict-sheet-close" onClick={() => setQuickDetailItem(null)}>
              <X size={20} />
            </button>
            <div className="dict-sheet-header">
              <span className="dict-sheet-category">{quickDetailItem.category}</span>
              <h2 className="dict-sheet-title">{quickDetailItem.name}</h2>
              <p className="dict-sheet-desc">{quickDetailItem.description}</p>
            </div>
            
            <div className="dict-video-thumb">
              <img src={`https://img.youtube.com/vi/${quickDetailItem.videoId}/hqdefault.jpg`} alt={quickDetailItem.name} />
              <div className="dict-play-overlay">
                <div className="dict-play-btn"><Play size={22} fill="white" color="white" /></div>
              </div>
              <span className="dict-video-label">▶ Video Tutorial</span>
            </div>

            <div className="dict-section">
              <p className="dict-section-label">📋 How to Use</p>
              <ol className="dict-steps">
                {quickDetailItem.howToUse.map((step, i) => (
                  <li key={i}>
                    <span className="dict-step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="dict-section dict-alt-section" style={{ marginTop: '16px' }}>
              <p className="dict-section-label">⚠️ Alternative Equipment</p>
              <div className="dict-tags">
                {quickDetailItem.alternatives.map((alt, i) => (
                  <span key={i} className="dict-tag dict-tag-alt">{alt}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
