import React, { useState, useEffect } from 'react';
import {
  Apple, Droplets, Flame, ChevronRight, CheckCircle2, ChevronLeft,
  RefreshCw, Zap, Utensils, ChevronDown, ChevronUp, AlertCircle,
  Loader2, Leaf, CheckCircle, Settings2, X, SlidersHorizontal, Sparkles
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { generateMealPlan, generateProgressiveMealPlan } from '../services/MealPlanService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AmplitudeService } from '../services/AmplitudeService';
import './Nutrition.css';

// ─── Subcomponents ──────────────────────────────────────────────────────────

function MacroRing({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;
  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const pEnd = pPct;
  const cEnd = pEnd + cPct;

  return (
    <div className="macro-ring-wrap">
      <div
        className="macro-ring"
        style={{
          background: `conic-gradient(
            #a78bfa 0% ${pEnd}%,
            #f59e0b ${pEnd}% ${cEnd}%,
            #2dd4bf ${cEnd}% 100%
          )`
        }}
      >
        <div className="macro-ring-center">
          <span className="ring-kcal-num">{protein + carbs + fat}g</span>
          <span className="ring-kcal-lbl">macros</span>
        </div>
      </div>
      <div className="macro-legend">
        <div className="legend-item">
          <span className="legend-dot protein" />
          <span>Protein <strong>{protein}g</strong></span>
        </div>
        <div className="legend-item">
          <span className="legend-dot carbs" />
          <span>Carbs <strong>{carbs}g</strong></span>
        </div>
        <div className="legend-item">
          <span className="legend-dot fat" />
          <span>Fat <strong>{fat}g</strong></span>
        </div>
      </div>
    </div>
  );
}

function WaterTracker({ glasses, onToggle }) {
  return (
    <div className="water-tracker">
      <div className="water-header">
        <Droplets size={16} color="#38bdf8" />
        <span>Daily Water Goal</span>
        <span className="water-count">{glasses}/8 glasses</span>
      </div>
      <div className="water-glasses">
        {Array.from({ length: 8 }).map((_, i) => (
          <button
            key={i}
            className={`glass-btn ${i < glasses ? 'filled' : ''}`}
            onClick={() => onToggle(i)}
            aria-label={`Glass ${i + 1}`}
          >
            <Droplets size={18} />
          </button>
        ))}
      </div>
    </div>
  );
}

function MealCard({ meal }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`meal-card ${expanded ? 'expanded' : ''}`}>
      <button className="meal-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="meal-left">
          <span className="meal-emoji">{meal.emoji}</span>
          <div>
            <div className="meal-label">{meal.label} · <span className="meal-timing">{meal.timing}</span></div>
            <div className="meal-name">{meal.name}</div>
          </div>
        </div>
        <div className="meal-right">
          <span className="meal-cal">{meal.calories} kcal</span>
          {expanded ? <ChevronUp size={16} className="chevron" /> : <ChevronDown size={16} className="chevron" />}
        </div>
      </button>

      {expanded && (
        <div className="meal-body">
          <div className="meal-macros">
            <div className="macro-pill protein">
              <span>Protein</span>
              <strong>{meal.protein}g</strong>
            </div>
            <div className="macro-pill carbs">
              <span>Carbs</span>
              <strong>{meal.carbs}g</strong>
            </div>
            <div className="macro-pill fat">
              <span>Fat</span>
              <strong>{meal.fat}g</strong>
            </div>
            <div className="macro-pill prep">
              <span>Prep</span>
              <strong>{meal.prepTime}</strong>
            </div>
          </div>

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="meal-ingredients">
              <div className="ingredients-title">Ingredients</div>
              <ul className="ingredients-list">
                {meal.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Preferences Data ────────────────────────────────────────────────────────

const DIET_TYPES = [
  { id: 'no_preference', label: 'No Preference', emoji: '🍽️', desc: 'Eat everything' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗', desc: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', desc: 'Plant-based only' },
  { id: 'keto', label: 'Keto', emoji: '🥑', desc: 'High fat, low carb' },
  { id: 'paleo', label: 'Paleo', emoji: '🥩', desc: 'Whole, unprocessed' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒', desc: 'Heart-healthy, balanced' },
  { id: 'intermittent_fasting', label: 'Intermittent Fasting', emoji: '⏱️', desc: '16:8 or 18:6 window' },
  { id: 'high_protein', label: 'High Protein', emoji: '💪', desc: 'Prioritize protein' },
];

const ALLERGIES = [
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'nuts', label: 'Nuts', emoji: '🥜' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'soy', label: 'Soy', emoji: '🫘' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
];

const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: 'Diabetes / Prediabetes', emoji: '🩸' },
  { id: 'hypertension', label: 'High BP / Hypertension', emoji: '🫀' },
  { id: 'cholesterol', label: 'High Cholesterol', emoji: '❤️' },
  { id: 'pcos', label: 'PCOS / PCOD', emoji: '🌸' },
  { id: 'gerd', label: 'Acid Reflux / GERD', emoji: '🫁' },
  { id: 'thyroid', label: 'Thyroid (Hypothyroid)', emoji: '🦋' },
  { id: 'gout', label: 'High Uric Acid / Gout', emoji: '🦴' },
  { id: 'ibs', label: 'IBS / Sensitive Digestion', emoji: '🥑' },
];

const MEAL_COUNTS = [2, 3, 4, 5, 6];

const CALORIE_MODES = [
  { id: 'deficit', label: 'Caloric Deficit', desc: 'Lose weight (−300 to −500 kcal)', emoji: '🔥', color: '#f97316' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Maintain current weight', emoji: '⚖️', color: '#38bdf8' },
  { id: 'surplus', label: 'Caloric Surplus', desc: 'Build muscle (+200 to +400 kcal)', emoji: '💪', color: '#a78bfa' },
  { id: 'custom', label: 'Custom Target', desc: 'Set your own calorie goal', emoji: '🎯', color: '#4ade80' },
];

const CUISINE_PREFS = [
  { id: 'indian', label: 'Indian', emoji: '🇮🇳' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' },
  { id: 'asian', label: 'Asian', emoji: '🍜' },
  { id: 'western', label: 'Western', emoji: '🍔' },
  { id: 'middle_eastern', label: 'Middle Eastern', emoji: '🧆' },
  { id: 'mexican', label: 'Mexican', emoji: '🌮' },
];

// Helper to determine suggested meal count based on calorie approach
function getSuggestedMealCount(calorieMode, customCalories) {
  if (calorieMode === 'deficit') return 3;
  if (calorieMode === 'surplus') return 4;
  if (calorieMode === 'custom' && customCalories) {
    const cal = parseInt(customCalories, 10);
    if (cal < 1600) return 2;
    if (cal < 2200) return 3;
    if (cal < 2800) return 4;
    return 5;
  }
  return 3; // Default for maintenance
}

// ─── Preferences Modal ───────────────────────────────────────────────────────

function NutritionPreferencesModal({ initialPrefs, onSave, onClose, isFirstTime }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [prefs, setPrefs] = useState(() => {
    const init = { ...initialPrefs };
    let dietTypes = init.dietTypes;
    if (!dietTypes) {
      dietTypes = init.dietType ? [init.dietType] : ['no_preference'];
    }
    return {
      dietTypes,
      allergies: [],
      healthConditions: [],
      customHealthCondition: '',
      mealCount: 3,
      calorieMode: 'maintenance',
      customCalories: '',
      cuisines: [],
      ...init,
    };
  });

  const toggleDietType = (id) => {
    setPrefs(p => {
      let current = [...(p.dietTypes || [])];
      if (id === 'no_preference') {
        return { ...p, dietTypes: ['no_preference'] };
      }
      current = current.filter(d => d !== 'no_preference');
      if (current.includes(id)) {
        current = current.filter(d => d !== id);
      } else {
        current.push(id);
      }
      if (current.length === 0) {
        current = ['no_preference'];
      }
      return { ...p, dietTypes: current };
    });
  };

  const toggleAllergy = (id) => {
    setPrefs(p => ({
      ...p,
      allergies: p.allergies.includes(id)
        ? p.allergies.filter(a => a !== id)
        : [...p.allergies, id]
    }));
  };

  const toggleHealthCondition = (id) => {
    setPrefs(p => ({
      ...p,
      healthConditions: (p.healthConditions || []).includes(id)
        ? (p.healthConditions || []).filter(c => c !== id)
        : [...(p.healthConditions || []), id]
    }));
  };

  const toggleCuisine = (id) => {
    setPrefs(p => ({
      ...p,
      cuisines: p.cuisines.includes(id)
        ? p.cuisines.filter(c => c !== id)
        : [...p.cuisines, id]
    }));
  };

  const handleNextStep = () => {
    if (step === 3) {
      const suggested = getSuggestedMealCount(prefs.calorieMode, prefs.customCalories);
      setPrefs(p => ({
        ...p,
        mealCount: p.mealCount || suggested
      }));
    }
    setStep(s => s + 1);
  };

  const handleSave = () => {
    onSave(prefs);
  };

  const canGoNext = () => {
    if (step === 3 && prefs.calorieMode === 'custom') {
      return prefs.customCalories && parseInt(prefs.customCalories, 10) > 0;
    }
    return true;
  };

  const stepTitles = ['Diet Types', 'Food Allergies', 'Calorie Goal', 'Meal Schedule'];
  const suggestedMealCount = getSuggestedMealCount(prefs.calorieMode, prefs.customCalories);
  const selectedCalMode = CALORIE_MODES.find(m => m.id === prefs.calorieMode);

  return (
    <div className="pref-overlay" onClick={onClose || undefined}>
      <div className="pref-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pref-modal-header">
          <div>
            <h2 className="pref-modal-title">
              {isFirstTime ? '🎯 Set Nutrition Preferences' : '⚙️ Nutrition Preferences'}
            </h2>
            <p className="pref-modal-subtitle">
              {isFirstTime
                ? 'Tell us about your diet so we can craft the perfect meal plan'
                : 'Update your dietary preferences anytime'}
            </p>
          </div>
          {!isFirstTime && onClose && (
            <button className="pref-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Step Progress */}
        <div className="pref-step-bar">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`pref-step-dot ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`} />
          ))}
        </div>
        <div className="pref-step-label">{stepTitles[step - 1]} · Step {step} of {totalSteps}</div>

        {/* Step Content */}
        <div className="pref-step-content">

          {/* Step 1 — Diet Types (Multi-select) */}
          {step === 1 && (
            <div>
              <p className="pref-helper-text">Select all diet styles that apply (you can select multiple options).</p>
              <div className="pref-grid">
                {DIET_TYPES.map(d => {
                  const isSelected = (prefs.dietTypes || []).includes(d.id);
                  return (
                    <button
                      key={d.id}
                      className={`pref-diet-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleDietType(d.id)}
                    >
                      <span className="pref-diet-emoji">{d.emoji}</span>
                      <span className="pref-diet-label">{d.label}</span>
                      <span className="pref-diet-desc">{d.desc}</span>
                      {isSelected && (
                        <div className="pref-check"><CheckCircle2 size={14} /></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Allergies & Health Conditions */}
          {step === 2 && (
            <div>
              {/* Health Conditions */}
              <p className="pref-section-heading">🏥 Health & Medical Conditions</p>
              <p className="pref-helper-text">Select any conditions so the AI tailor-makes safe recipes for your health.</p>
              <div className="pref-allergy-grid">
                {HEALTH_CONDITIONS.map(h => {
                  const isSel = (prefs.healthConditions || []).includes(h.id);
                  return (
                    <button
                      key={h.id}
                      className={`pref-allergy-chip health-chip ${isSel ? 'selected' : ''}`}
                      onClick={() => toggleHealthCondition(h.id)}
                    >
                      <span>{h.emoji}</span>
                      <span>{h.label}</span>
                      {isSel && <X size={12} />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Medical Condition text input */}
              <div className="pref-custom-health-wrap">
                <label className="pref-custom-label" style={{ marginTop: '12px' }}>
                  Other Medical Condition / Health Note <span style={{ opacity: 0.5 }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className="pref-custom-health-input"
                  placeholder="e.g. Fatty Liver, Post-surgery, Low Potassium..."
                  value={prefs.customHealthCondition || ''}
                  onChange={e => setPrefs(p => ({ ...p, customHealthCondition: e.target.value }))}
                />
              </div>

              {/* Allergies */}
              <p className="pref-section-heading" style={{ marginTop: '20px' }}>⚠️ Food Allergies & Intolerances</p>
              <p className="pref-helper-text">Select foods to strictly exclude from your meal plan.</p>
              <div className="pref-allergy-grid">
                {ALLERGIES.map(a => (
                  <button
                    key={a.id}
                    className={`pref-allergy-chip ${prefs.allergies.includes(a.id) ? 'selected' : ''}`}
                    onClick={() => toggleAllergy(a.id)}
                  >
                    <span>{a.emoji}</span>
                    <span>{a.label}</span>
                    {prefs.allergies.includes(a.id) && <X size={12} />}
                  </button>
                ))}
              </div>
              {prefs.allergies.length === 0 && (
                <div className="pref-no-allergy">
                  <CheckCircle size={16} color="#4ade80" />
                  <span>No allergies selected — enjoy everything!</span>
                </div>
              )}

              {/* Cuisines */}
              <p className="pref-section-heading" style={{ marginTop: '20px' }}>🇮🇳 Preferred Cuisines <span style={{ opacity: 0.5 }}>(optional)</span></p>
              <div className="pref-allergy-grid">
                {CUISINE_PREFS.map(c => (
                  <button
                    key={c.id}
                    className={`pref-allergy-chip ${prefs.cuisines.includes(c.id) ? 'selected' : ''}`}
                    onClick={() => toggleCuisine(c.id)}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.label}</span>
                    {prefs.cuisines.includes(c.id) && <X size={12} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Calorie Goal */}
          {step === 3 && (
            <div>
              <p className="pref-helper-text">What's your calorie approach for your goals?</p>
              <div className="pref-calorie-list">
                {CALORIE_MODES.map(m => (
                  <button
                    key={m.id}
                    className={`pref-calorie-card ${prefs.calorieMode === m.id ? 'selected' : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, calorieMode: m.id }))}
                    style={prefs.calorieMode === m.id ? { borderColor: m.color } : {}}
                  >
                    <span className="pref-calorie-emoji">{m.emoji}</span>
                    <div className="pref-calorie-info">
                      <span className="pref-calorie-label" style={prefs.calorieMode === m.id ? { color: m.color } : {}}>{m.label}</span>
                      <span className="pref-calorie-desc">{m.desc}</span>
                    </div>
                    {prefs.calorieMode === m.id && (
                      <CheckCircle2 size={18} style={{ color: m.color, flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>

              {prefs.calorieMode === 'custom' && (
                <div className="pref-custom-cal">
                  <label className="pref-custom-label">Enter your daily calorie target</label>
                  <div className="pref-custom-input-wrap">
                    <input
                      type="number"
                      className="pref-custom-input"
                      placeholder="e.g. 2200"
                      value={prefs.customCalories}
                      onChange={e => setPrefs(p => ({ ...p, customCalories: e.target.value }))}
                      min={800}
                      max={6000}
                    />
                    <span className="pref-custom-unit">kcal / day</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Meal Schedule */}
          {step === 4 && (
            <div>
              <div className="pref-suggestion-banner">
                <Sparkles size={16} color="#d9f924" />
                <span>
                  Based on your <strong>{selectedCalMode?.label || 'Calorie Goal'}</strong>, we suggest <strong>{suggestedMealCount} meals/day</strong>.
                </span>
              </div>

              <p className="pref-helper-text">How many meals do you prefer per day?</p>
              <div className="pref-meal-count-row">
                {MEAL_COUNTS.map(n => {
                  const isSuggested = n === suggestedMealCount;
                  return (
                    <button
                      key={n}
                      className={`pref-count-btn ${prefs.mealCount === n ? 'selected' : ''} ${isSuggested ? 'suggested-btn' : ''}`}
                      onClick={() => setPrefs(p => ({ ...p, mealCount: n }))}
                    >
                      {isSuggested && (
                        <span className="suggested-badge">★ Rec</span>
                      )}
                      <span className="pref-count-num">{n}</span>
                      <span className="pref-count-lbl">
                        {n === 2 ? 'Two' : n === 3 ? 'Three' : n === 4 ? 'Four' : n === 5 ? 'Five' : 'Six'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="pref-meal-desc-box">
                {prefs.mealCount === 2 && <><strong>2 Meals:</strong> Suits intermittent fasting or OMAD. Larger, nutrient-dense meals.</>}
                {prefs.mealCount === 3 && <><strong>3 Meals:</strong> Classic breakfast, lunch & dinner. Balanced for most goals.</>}
                {prefs.mealCount === 4 && <><strong>4 Meals:</strong> Adds a snack. Great for sustained energy throughout the day.</>}
                {prefs.mealCount === 5 && <><strong>5 Meals:</strong> Ideal for muscle building — keeps amino acids flowing all day.</>}
                {prefs.mealCount === 6 && <><strong>6 Meals:</strong> Athlete-level frequency. Maximizes nutrient timing for peak performance.</>}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pref-modal-footer">
          {step > 1 && (
            <button className="pref-back-btn" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button className="pref-next-btn" onClick={handleNextStep} disabled={!canGoNext()}>
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              className="pref-save-btn"
              onClick={handleSave}
              disabled={!canGoNext()}
            >
              <CheckCircle size={16} />
              {isFirstTime ? 'Generate My Plan' : 'Save & Regenerate'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Preferences Summary Bar ─────────────────────────────────────────────────

function PrefSummaryBar({ prefs, onEdit }) {
  const selectedDiets = Array.isArray(prefs.dietTypes)
    ? prefs.dietTypes
    : (prefs.dietType ? [prefs.dietType] : ['no_preference']);

  const calMode = CALORIE_MODES.find(c => c.id === prefs.calorieMode);
  const healthConds = prefs.healthConditions || [];

  return (
    <div className="pref-summary-bar">
      <div className="pref-summary-chips">
        {selectedDiets.map(dt => {
          const dObj = DIET_TYPES.find(d => d.id === dt);
          return (
            <span key={dt} className="pref-summary-chip diet">
              {dObj?.emoji} {dObj?.label || dt}
            </span>
          );
        })}
        {healthConds.length > 0 && healthConds.map(hc => {
          const hObj = HEALTH_CONDITIONS.find(h => h.id === hc);
          return (
            <span key={hc} className="pref-summary-chip health">
              {hObj?.emoji || '🏥'} {hObj?.label || hc}
            </span>
          );
        })}
        {prefs.customHealthCondition && prefs.customHealthCondition.trim() && (
          <span className="pref-summary-chip health">
            🩺 {prefs.customHealthCondition.trim()}
          </span>
        )}
        <span className="pref-summary-chip calorie">
          {calMode?.emoji} {prefs.calorieMode === 'custom' ? `${prefs.customCalories} kcal` : calMode?.label}
        </span>
        <span className="pref-summary-chip meals">🍽️ {prefs.mealCount} meals/day</span>
        {prefs.allergies && prefs.allergies.length > 0 && (
          <span className="pref-summary-chip allergy">⚠️ {prefs.allergies.length} avoided</span>
        )}
      </div>
      <button className="pref-edit-btn" onClick={onEdit} title="Edit preferences">
        <Settings2 size={15} />
      </button>
    </div>
  );
}

// ─── Main Nutrition Component ────────────────────────────────────────────────

function Nutrition() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [glasses, setGlasses] = useState(0);
  const [goals, setGoals] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [completing, setCompleting] = useState(false);
  const [nutritionDays, setNutritionDays] = useState(0);
  const [nutritionPrefs, setNutritionPrefs] = useState(null);
  const [showPrefsModal, setShowPrefsModal] = useState(false);

  useEffect(() => {
    const savedGoal = localStorage.getItem('gymbuddy_goal');
    const savedProfile = localStorage.getItem('gymbuddy_user_profile');
    const savedWater = localStorage.getItem('gymbuddy_water_glasses');
    const savedMeal = localStorage.getItem('gymbuddy_meal_plan');
    const savedDays = localStorage.getItem('gymbuddy_nutrition_days');
    const savedPrefs = localStorage.getItem('gymbuddy_nutrition_prefs');

    if (savedGoal) {
      setGoals(savedGoal.split(',').map(g => g.trim()).filter(Boolean));
    }
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }
    if (savedWater) {
      setGlasses(parseInt(savedWater, 10) || 0);
    }
    if (savedMeal) {
      try { setMealPlan(JSON.parse(savedMeal)); } catch (e) { console.error(e); }
    }
    if (savedDays) {
      setNutritionDays(parseInt(savedDays, 10) || 0);
    }
    if (savedPrefs) {
      try { setNutritionPrefs(JSON.parse(savedPrefs)); } catch (e) { console.error(e); }
    }
  }, []);

  const isFirstTime = !nutritionPrefs;

  const handlePreferenceSave = async (prefs) => {
    setNutritionPrefs(prefs);
    localStorage.setItem('gymbuddy_nutrition_prefs', JSON.stringify(prefs));
    setShowPrefsModal(false);
    await handleGeneratePlan(prefs);
  };

  const handleGeneratePlan = async (prefsOverride) => {
    const effectivePrefs = prefsOverride || nutritionPrefs;
    setLoading(true);
    setError(null);
    try {
      const plan = await generateMealPlan(goals, userProfile, effectivePrefs);
      setMealPlan(plan);
      localStorage.setItem('gymbuddy_meal_plan', JSON.stringify(plan));
      GoogleSheetsService.trackMealPlanGenerated(nutritionDays);
      AmplitudeService.trackMealPlanGenerated(nutritionDays);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDay = async () => {
    setCompleting(true);
    setError(null);
    try {
      const nextDays = nutritionDays + 1;
      const newPlan = await generateProgressiveMealPlan(mealPlan, goals, userProfile, nextDays, nutritionPrefs);
      setMealPlan(newPlan);
      setNutritionDays(nextDays);
      setGlasses(0);
      localStorage.setItem('gymbuddy_meal_plan', JSON.stringify(newPlan));
      localStorage.setItem('gymbuddy_nutrition_plan', JSON.stringify(newPlan));
      localStorage.setItem('gymbuddy_nutrition_date', new Date().toDateString());
      localStorage.setItem('gymbuddy_nutrition_days', String(nextDays));
      localStorage.setItem('gymbuddy_water_glasses', '0');
      GoogleSheetsService.trackDayCompleted(nutritionDays, {
        protein: mealPlan?.dailyTargets?.protein || 0,
        carbs: mealPlan?.dailyTargets?.carbs || 0,
        fat: mealPlan?.dailyTargets?.fat || 0,
        water: glasses
      });
      AmplitudeService.trackDayCompleted(nutritionDays, {
        protein: mealPlan?.dailyTargets?.protein || 0,
        carbs: mealPlan?.dailyTargets?.carbs || 0,
        fat: mealPlan?.dailyTargets?.fat || 0,
        water: glasses
      });
      GoogleSheetsService.trackMealPlanGenerated(nextDays);
      AmplitudeService.trackMealPlanGenerated(nextDays);
    } catch (e) {
      console.error(e);
      setError("Failed to generate your personalized meal plan. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  const handleGlassToggle = (idx) => {
    const newCount = idx < glasses ? idx : idx + 1;
    setGlasses(newCount);
    localStorage.setItem('gymbuddy_water_glasses', String(newCount));
  };

  const goalColors = {
    'Build Muscle': { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '💪' },
    'Lose Weight': { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '🔥' },
    'Improve Fitness': { color: '#2dd4bf', bg: 'rgba(45,212,191,0.12)', icon: '⚡' },
    'Stay Healthy': { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: '🌿' },
  };

  return (
    <div className="nutrition-page">
      {/* ── Header ─── */}
      <div className="nutrition-header">
        <div className="nutrition-title-row">
          <div>
            <h1 className="nutrition-title">Adaptive Nutrition</h1>
            <p className="nutrition-subtitle">Meal plan tuned to your goals & diet</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {nutritionPrefs && (
              <button
                className="regen-btn"
                onClick={() => setShowPrefsModal(true)}
                aria-label="Edit nutrition preferences"
                title="Edit preferences"
              >
                <Settings2 size={18} />
              </button>
            )}
            {mealPlan && (
              <button
                className={`regen-btn ${loading ? 'loading' : ''}`}
                onClick={() => handleGeneratePlan()}
                disabled={loading || !nutritionPrefs}
                aria-label="Regenerate meal plan"
              >
                {loading
                  ? <Loader2 size={18} className="spin-icon" />
                  : <RefreshCw size={18} />
                }
              </button>
            )}
          </div>
        </div>

        {goals.length > 0 && (
          <div className="goal-badges">
            {goals.map((g, i) => {
              const cfg = goalColors[g] || { color: '#d9f924', bg: 'rgba(217,249,36,0.12)', icon: '🎯' };
              return (
                <span key={i} className="goal-badge" style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.icon} {g}
                </span>
              );
            })}
          </div>
        )}

        {nutritionPrefs && !loading && (
          <PrefSummaryBar prefs={nutritionPrefs} onEdit={() => setShowPrefsModal(true)} />
        )}
      </div>

      <div className="nutrition-scroll">
        {error && (
          <div className="nutrition-error">
            <AlertCircle size={20} color="#f87171" />
            <div>
              <div className="error-title">Could not generate meal plan</div>
              <div className="error-msg">{error}</div>
            </div>
          </div>
        )}

        {/* First-time prompt — no prefs set yet */}
        {!nutritionPrefs && !loading && (
          <div className="nutrition-empty">
            <div className="empty-icon-wrap">
              <SlidersHorizontal size={36} color="var(--brand-primary)" />
            </div>
            <h2>Set Your Diet Preferences</h2>
            <p>Tell us about your dietary needs and goals so we can build a truly personalized meal plan — not a random one.</p>
            <div className="pref-teaser-chips">
              <span className="pref-teaser-chip">🥗 Diet type</span>
              <span className="pref-teaser-chip">⚠️ Allergies</span>
              <span className="pref-teaser-chip">🔥 Calorie goal</span>
              <span className="pref-teaser-chip">🍽️ Meal count</span>
            </div>
            <button className="btn btn-primary generate-btn" onClick={() => setShowPrefsModal(true)}>
              Set Preferences & Generate
            </button>
          </div>
        )}

        {loading && (
          <div className="nutrition-loading">
            <div className="loading-spinner" />
            <h3>AI Nutritionist is crafting your plan...</h3>
            <p>Adapting meals to your specific goals, diet type, and profile.</p>
          </div>
        )}

        {mealPlan && !loading && (
          <>
            {(mealPlan.strategyNote || mealPlan.progressionNote) && (
              <div className="strategy-note">
                <Leaf size={14} color="#4ade80" />
                <span>{mealPlan.strategyNote || mealPlan.progressionNote}</span>
              </div>
            )}

            {mealPlan.dailyTargets && (
              <div className="targets-card">
                <div className="targets-header">
                  <div className="targets-cal">
                    <Flame size={18} color="#f97316" />
                    <div>
                      <div className="cal-num">{mealPlan.dailyTargets.calories}</div>
                      <div className="cal-lbl">kcal / day</div>
                    </div>
                  </div>
                  <MacroRing
                    protein={mealPlan.dailyTargets.protein}
                    carbs={mealPlan.dailyTargets.carbs}
                    fat={mealPlan.dailyTargets.fat}
                  />
                </div>
              </div>
            )}

            <div className="meals-section">
              <h2 className="meals-section-title">
                <Utensils size={16} color="var(--brand-primary)" />
                Today's Meals
                <span className="meal-count">{mealPlan.meals?.length} meals</span>
              </h2>
              <div className="meals-list">
                {mealPlan.meals?.map(meal => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            </div>

            <WaterTracker glasses={glasses} onToggle={handleGlassToggle} />

            <button
              className="btn btn-primary complete-day-btn"
              style={{ marginTop: '16px', background: 'var(--brand-primary)', color: '#000' }}
              onClick={handleCompleteDay}
              disabled={completing || loading}
            >
              {completing ? (
                <>
                  <Loader2 size={20} className="spin-icon" style={{ marginRight: '8px' }} />
                  Adapting Plan for Tomorrow...
                </>
              ) : (
                <>
                  <CheckCircle size={20} style={{ marginRight: '8px' }} />
                  Complete Day & Adapt Next Plan
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Preferences Modal — first time (shown over empty state) */}
      {showPrefsModal && (
        <NutritionPreferencesModal
          initialPrefs={nutritionPrefs || {}}
          onSave={handlePreferenceSave}
          onClose={nutritionPrefs ? () => setShowPrefsModal(false) : null}
          isFirstTime={isFirstTime}
        />
      )}

      <BottomNavigation />
    </div>
  );
}

export default Nutrition;
