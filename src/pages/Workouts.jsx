import React, { useState, useEffect } from 'react';
import { Clock, Dumbbell, Zap, ChevronRight, Trophy, CheckCircle2, Play, RotateCcw, Flame } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import DailyCheckIn from '../components/DailyCheckIn';
import AdaptedWorkout from '../components/AdaptedWorkout';
import ActiveWorkout from '../components/ActiveWorkout';
import ExerciseDetails from '../components/ExerciseDetails';
import { adaptWorkout, generateNextWeeklyPlan } from '../services/AICoachService';
import { saveActiveUserToDb } from '../services/DatabaseService';
import './Workouts.css';

function Workouts() {
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState(0);

  // Workout flow states
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [adaptedPlan, setAdaptedPlan] = useState(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeExerciseForDetails, setActiveExerciseForDetails] = useState(null);
  const [isGeneratingNextWeek, setIsGeneratingNextWeek] = useState(false);

  useEffect(() => {
    const savedPlan = localStorage.getItem('gymbuddy_weekly_plan');
    const savedHistory = localStorage.getItem('gymbuddy_workout_history');
    const savedCount = localStorage.getItem('gymbuddy_completed_workouts');

    if (savedPlan) {
      try { setWeeklyPlan(JSON.parse(savedPlan)); } catch (e) { console.error(e); }
    }
    if (savedHistory) {
      try { setWorkoutHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    if (savedCount) {
      setCompletedWorkouts(parseInt(savedCount, 10) || 0);
    }
  }, []);

  const totalInCycle = weeklyPlan.length + completedWorkouts || 3;
  const weekProgress = Math.round((completedWorkouts / totalInCycle) * 100);

  const handleStartWorkout = () => setShowCheckIn(true);

  const handleCheckInComplete = async (answers) => {
    setShowCheckIn(false);
    setIsAILoading(true);
    try {
      const workoutContext = weeklyPlan.length > 0 ? {
        title: weeklyPlan[0].title,
        duration: weeklyPlan[0].duration,
        exercisesCount: weeklyPlan[0].exercisesCount,
      } : { title: 'General Workout', duration: '30 min', exercisesCount: 4 };
      const result = await adaptWorkout(answers, workoutContext);
      setAdaptedPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleWorkoutFinish = (caloriesMap = {}, totalBurn = 0) => {
    setIsWorkoutActive(false);

    // Advance plan queue
    const newWeeklyPlan = weeklyPlan.slice(1);
    setWeeklyPlan(newWeeklyPlan);
    localStorage.setItem('gymbuddy_weekly_plan', JSON.stringify(newWeeklyPlan));

    // Create completed workout object with calorie details
    const completedWorkout = {
      ...adaptedPlan.workout,
      completedAt: new Date().toISOString(),
      caloriesBurned: totalBurn,
      exercisesList: (adaptedPlan.workout.exercisesList || []).map(ex => ({
        ...ex,
        caloriesBurned: caloriesMap[ex.id] || 0
      }))
    };

    // Save history
    const newHistory = [...workoutHistory, completedWorkout];
    setWorkoutHistory(newHistory);
    localStorage.setItem('gymbuddy_workout_history', JSON.stringify(newHistory));

    // Increment count
    const newCount = completedWorkouts + 1;
    setCompletedWorkouts(newCount);
    localStorage.setItem('gymbuddy_completed_workouts', newCount.toString());

    // ✅ Save entire session to DB immediately so data survives on re-login
    const userId = localStorage.getItem('gymbuddy_active_user_id');
    if (userId) saveActiveUserToDb(userId);

    setAdaptedPlan(null);
  };

  const handleGenerateNextWeek = async () => {
    setIsGeneratingNextWeek(true);
    try {
      const newPlan = await generateNextWeeklyPlan(completedWorkouts, workoutHistory);
      setWeeklyPlan(newPlan);
      localStorage.setItem('gymbuddy_weekly_plan', JSON.stringify(newPlan));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingNextWeek(false);
    }
  };

  // Circular ring SVG helpers
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (weekProgress / 100) * circumference;

  return (
    <div className="workouts-page">

      {/* ── Header ─────────────────────────────── */}
      <div className="workouts-header">
        <h1 className="workouts-title">Workouts</h1>
        <p className="workouts-subtitle">Your adaptive training plan</p>
      </div>

      {/* ── Week Progress Ring ──────────────────── */}
      <div className="week-progress-card">
        <div className="progress-ring-container">
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke="var(--brand-primary, #cdfd50)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 44 44)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="ring-label">
            <span className="ring-percent">{weekProgress}%</span>
            <span className="ring-sub">Done</span>
          </div>
        </div>
        <div className="progress-stats">
          <div className="pstat">
            <span className="pstat-val">{completedWorkouts}</span>
            <span className="pstat-label">Completed</span>
          </div>
          <div className="pstat-divider" />
          <div className="pstat">
            <span className="pstat-val">{weeklyPlan.length}</span>
            <span className="pstat-label">Remaining</span>
          </div>
          <div className="pstat-divider" />
          <div className="pstat">
            <span className="pstat-val">{totalInCycle}</span>
            <span className="pstat-label">Total</span>
          </div>
        </div>
      </div>

      {/* ── This Week's Plan ───────────────────── */}
      {weeklyPlan.length > 0 ? (
        <section>
          <h2 className="section-label">This Week</h2>
          <div className="plan-list">
            {weeklyPlan.map((workout, index) => (
              <div
                key={index}
                className={`plan-card ${index === 0 ? 'plan-card--today' : ''}`}
              >
                <div className="plan-card-left">
                  <div className={`plan-status-dot ${index === 0 ? 'dot-today' : 'dot-upcoming'}`} />
                  <div className="plan-card-info">
                    <div className="plan-card-tag">
                      {index === 0 ? '🔥 Up Next' : `Workout ${index + 1}`}
                    </div>
                    <h3 className="plan-card-title">{workout.title}</h3>
                    <div className="plan-card-meta">
                      <Clock size={12} />
                      <span>{workout.duration}</span>
                      <span className="meta-dot">•</span>
                      <Dumbbell size={12} />
                      <span>{workout.exercisesCount} exercises</span>
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <button
                    className="plan-start-btn"
                    onClick={handleStartWorkout}
                  >
                    <Play size={14} fill="currentColor" />
                    Start
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* Plan complete / empty state */
        <div className="plan-complete-card">
          <Trophy size={44} color="var(--brand-primary)" />
          <h3>Week Complete! 🎉</h3>
          <p>You crushed your plan. Ready to level up?</p>
          <button
            className="btn-generate"
            onClick={handleGenerateNextWeek}
            disabled={isGeneratingNextWeek}
          >
            {isGeneratingNextWeek ? (
              <><div className="mini-spinner" /> Generating...</>
            ) : (
              <><Zap size={15} fill="currentColor" /> Generate Next Week</>
            )}
          </button>
        </div>
      )}

      {/* ── Workout History ─────────────────────── */}
      {workoutHistory.length > 0 && (
        <section>
          <h2 className="section-label">History</h2>
          <div className="history-list">
            {[...workoutHistory].reverse().map((w, i) => (
              <div className="history-card" key={i}>
                <div className="history-icon">
                  <CheckCircle2 size={20} color="var(--brand-primary)" />
                </div>
                <div className="history-info">
                  <h4>{w.title}</h4>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span>{w.exercisesList?.length || 0} exercises completed</span>
                    <span>•</span>
                    <span>{w.duration}</span>
                    {w.caloriesBurned > 0 && (
                      <>
                        <span>•</span>
                        <Flame size={12} color="var(--brand-primary, #cdfd50)" fill="var(--brand-primary, #cdfd50)" style={{ display: 'inline', marginTop: -2 }} />
                        <span style={{ color: 'var(--brand-primary, #cdfd50)', fontWeight: 600 }}>{w.caloriesBurned} kcal</span>
                      </>
                    )}
                  </p>
                </div>
                <span className="history-badge">Done</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Explore section ─────────────────────── */}
      <section>
        <h2 className="section-label">Explore Programs</h2>
        <div className="explore-row">
          <div className="explore-tile">
            <Zap size={22} color="var(--brand-primary)" />
            <div>
              <h4>HIIT Blast</h4>
              <p>Burn fat fast</p>
            </div>
            <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
          </div>
          <div className="explore-tile">
            <RotateCcw size={22} color="#a78bfa" />
            <div>
              <h4>Recovery Day</h4>
              <p>Stretch & mobility</p>
            </div>
            <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
          </div>
        </div>
      </section>

      <BottomNavigation />

      {/* ── Overlays ────────────────────────────── */}
      {showCheckIn && (
        <DailyCheckIn
          onComplete={handleCheckInComplete}
          onCancel={() => setShowCheckIn(false)}
        />
      )}

      {(adaptedPlan || isAILoading) && !isWorkoutActive && (
        <AdaptedWorkout
          aiResponse={adaptedPlan}
          isLoading={isAILoading}
          onCancel={() => { setAdaptedPlan(null); setIsAILoading(false); }}
          onStart={() => setIsWorkoutActive(true)}
          onExerciseClick={(ex) => setActiveExerciseForDetails(ex)}
        />
      )}

      {isWorkoutActive && adaptedPlan && (
        <ActiveWorkout
          workout={adaptedPlan.workout}
          onClose={() => setIsWorkoutActive(false)}
          onFinish={handleWorkoutFinish}
        />
      )}

      {activeExerciseForDetails && (
        <ExerciseDetails
          exercise={activeExerciseForDetails}
          onClose={() => setActiveExerciseForDetails(null)}
        />
      )}
    </div>
  );
}

export default Workouts;
