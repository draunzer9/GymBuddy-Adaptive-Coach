import React, { useState, useEffect } from 'react';
import { Apple, Droplets, Flame, ChevronRight, CheckCircle2, ChevronLeft, RefreshCw, Zap, Utensils, ChevronDown, ChevronUp, AlertCircle, Loader2, Leaf, CheckCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { generateMealPlan, generateProgressiveMealPlan } from '../services/MealPlanService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AmplitudeService } from '../services/AmplitudeService';
import './Nutrition.css';

function MacroRing({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;
  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const fPct = (fat / total) * 100;

  // conic-gradient segments
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

function Nutrition() {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [glasses, setGlasses] = useState(0);
  const [goals, setGoals] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [completing, setCompleting] = useState(false);
  const [nutritionDays, setNutritionDays] = useState(0);

  // Load user data on mount
  useEffect(() => {
    const savedGoal = localStorage.getItem('gymbuddy_goal');
    const savedProfile = localStorage.getItem('gymbuddy_user_profile');
    const savedWater = localStorage.getItem('gymbuddy_water_glasses');
    const savedMeal = localStorage.getItem('gymbuddy_meal_plan');
    const savedDays = localStorage.getItem('gymbuddy_nutrition_days');

    if (savedGoal) {
      // Goal may be a comma-separated string of multiple goals
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
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await generateMealPlan(goals, userProfile);
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
      const newPlan = await generateProgressiveMealPlan(mealPlan, goals, userProfile, nextDays);
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

  // Goal color mapping
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
            <p className="nutrition-subtitle">Meal plan tuned to your goals</p>
          </div>
          <button
            className={`regen-btn ${loading ? 'loading' : ''}`}
            onClick={handleGeneratePlan}
            disabled={loading}
            aria-label="Regenerate meal plan"
          >
            {loading
              ? <Loader2 size={18} className="spin-icon" />
              : <RefreshCw size={18} />
            }
          </button>
        </div>

        {/* Goal badges */}
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
      </div>

      <div className="nutrition-scroll">
        {/* ── Error State ─── */}
        {error && (
          <div className="nutrition-error">
            <AlertCircle size={20} color="#f87171" />
            <div>
              <div className="error-title">Could not generate meal plan</div>
              <div className="error-msg">{error}</div>
            </div>
          </div>
        )}

        {/* ── Empty State ─── */}
        {!mealPlan && !loading && !error && (
          <div className="nutrition-empty">
            <div className="empty-icon-wrap">
              <Utensils size={36} color="var(--brand-primary)" />
            </div>
            <h2>No Meal Plan Yet</h2>
            <p>Tap "Generate" to get a personalized meal plan built around your goals.</p>
            <button className="btn btn-primary generate-btn" onClick={handleGeneratePlan}>
              Generate My Plan
            </button>
          </div>
        )}

        {/* ── Loading State ─── */}
        {loading && (
          <div className="nutrition-loading">
            <div className="loading-spinner" />
            <h3>AI Nutritionist is crafting your plan...</h3>
            <p>Adapting meals to your specific goals and profile.</p>
          </div>
        )}

        {/* ── Meal Plan Content ─── */}
        {mealPlan && !loading && (
          <>

            {/* Daily Targets Card */}
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

            {/* Meal Cards */}
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

            {/* Water Tracker */}
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

      <BottomNavigation />
    </div>
  );
}

export default Nutrition;
