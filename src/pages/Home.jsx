import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Activity, Calendar, Trophy, Zap, ChevronRight, User, Clock, Dumbbell } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import DailyCheckIn from '../components/DailyCheckIn';
import AdaptedWorkout from '../components/AdaptedWorkout';
import ActiveWorkout from '../components/ActiveWorkout';
import ExerciseDetails from '../components/ExerciseDetails';
import MidWeekCheckIn from '../components/MidWeekCheckIn';
import { adaptWorkout, generateNextWeeklyPlan, performMidWeekCheckpoint } from '../services/AICoachService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [showDict, setShowDict] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showMidWeekCheckIn, setShowMidWeekCheckIn] = useState(false);
  const [midWeekMessage, setMidWeekMessage] = useState(null);
  const [adaptedPlan, setAdaptedPlan] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isMidWeekLoading, setIsMidWeekLoading] = useState(false);
  const [isGeneratingNextWeek, setIsGeneratingNextWeek] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  
  // Track completed workouts count — read fresh on mount after DB restore
  const [completedWorkouts, setCompletedWorkouts] = useState(0);

  // Track full workout history for AI adaptation
  const [workoutHistory, setWorkoutHistory] = useState([]);
  
  const [userName, setUserName] = useState('Athlete');

  // New states for Phase 13
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [activeExerciseForDetails, setActiveExerciseForDetails] = useState(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('gymbuddy_weekly_plan');
    const savedProfile = localStorage.getItem('gymbuddy_user_profile');
    const savedCount = localStorage.getItem('gymbuddy_completed_workouts');
    const savedHistory = localStorage.getItem('gymbuddy_workout_history');

    if (savedPlan) {
      try {
        setWeeklyPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error(e);
      }
    }

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) setUserName(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }

    if (savedCount) {
      setCompletedWorkouts(parseInt(savedCount, 10) || 0);
    }

    if (savedHistory) {
      try {
        setWorkoutHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // New User Mock Data
  const newUserData = {
    greeting: `Welcome to GymBuddy, ${userName}! 👋`,
    subtitle: "Let's crush your first workout today.",
    workout: {
      title: "Beginner Foundation",
      duration: "15–20 min",
      exercises: "4 exercises",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    progress: {
      completed: 0,
      total: 3,
      consistency: "0%",
      message: "Ready to start your streak!"
    }
  };

  // Old User Mock Data (from screenshot)
  const oldUserData = {
    greeting: `Welcome back, ${userName}! 💪`,
    subtitle: "Let's stay consistent today.",
    workout: {
      title: "Upper Body Push",
      duration: "20–30 min",
      exercises: "6 exercises",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    progress: {
      completed: 2,
      total: 3,
      consistency: "72%",
      message: "Great job! Keep it up."
    }
  };

  // Derive user type from completed workouts: if 0, they are new
  const isNewUser = completedWorkouts === 0;
  const currentData = isNewUser ? newUserData : oldUserData;

  // Real progress state overriding mock data
  const totalWorkouts = weeklyPlan.length + completedWorkouts || 3;
  const progressStats = {
    completed: completedWorkouts,
    total: totalWorkouts,
    consistency: completedWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) + "%" : "0%",
    message: completedWorkouts > 0 ? "Great job! Keep it up." : "Ready to start your streak!"
  };

  const todaysWorkout = weeklyPlan.length > 0 ? {
    title: weeklyPlan[0].title,
    duration: weeklyPlan[0].duration,
    exercises: `${weeklyPlan[0].exercisesCount} exercises`,
    image: currentData.workout.image
  } : null; // If null, we will show "Generate Plan" UI

  const handleStartWorkout = () => {
    setShowCheckIn(true);
  };

  const handleGenerateNextWeek = async () => {
    setIsGeneratingNextWeek(true);
    try {
      const newPlan = await generateNextWeeklyPlan(completedWorkouts, workoutHistory);
      setWeeklyPlan(newPlan);
      localStorage.setItem('gymbuddy_weekly_plan', JSON.stringify(newPlan));
      localStorage.removeItem('gymbuddy_midweek_done'); // Reset flag for the new week
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingNextWeek(false);
    }
  };

  const handleCheckInComplete = async (answers) => {
    setShowCheckIn(false);
    setIsAILoading(true);
    try {
      GoogleSheetsService.trackCheckIn(answers);
      // Pass the real today's workout (from the weekly plan if available)
      const workoutContext = weeklyPlan.length > 0 ? {
        title: weeklyPlan[0].title,
        duration: weeklyPlan[0].duration,
        exercises: weeklyPlan[0].exercisesCount,
        exercisesCount: weeklyPlan[0].exercisesCount,
      } : currentData.workout;
      const result = await adaptWorkout(answers, workoutContext);
      setAdaptedPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleMidWeekComplete = async (status) => {
    setShowMidWeekCheckIn(false);
    setIsMidWeekLoading(true);
    try {
      const profile = JSON.parse(localStorage.getItem('gymbuddy_user_profile') || '{}');
      const result = await performMidWeekCheckpoint(profile, weeklyPlan, completedWorkouts, status);
      
      // Update the weekly plan with the newly adapted remaining workouts
      if (result.adaptedRemainingWorkouts && result.adaptedRemainingWorkouts.length > 0) {
        setWeeklyPlan(result.adaptedRemainingWorkouts);
        localStorage.setItem('gymbuddy_weekly_plan', JSON.stringify(result.adaptedRemainingWorkouts));
        localStorage.setItem('gymbuddy_midweek_done', 'true');
      }
      
      // Show the message to the user
      setMidWeekMessage(result.coachMessage || "Your remaining week has been successfully adapted!");
    } catch (e) {
      console.error(e);
      alert("Failed to adapt week: " + e.message);
    } finally {
      setIsMidWeekLoading(false);
    }
  };


  return (
    <div className="home-container">
      <div className="header">
        <h1 className="greeting">{currentData.greeting}</h1>
        <p className="subtitle">{currentData.subtitle}</p>
      </div>

      <div className="workout-card">
        {todaysWorkout ? (
          <>
            <div className="workout-tag">Today's Workout</div>
            <div className="workout-content-wrapper">
              <div className="workout-info">
                <h3 className="workout-title">{todaysWorkout.title}</h3>
                <div className="workout-meta">
                  <span>{todaysWorkout.duration}</span>
                  <span className="dot">•</span>
                  <span>{todaysWorkout.exercises}</span>
                </div>
                
                <button className="btn btn-primary start-workout-btn" onClick={handleStartWorkout}>
                  <Play size={16} fill="currentColor" /> Start Workout
                </button>
              </div>
              <img src={todaysWorkout.image} alt="Workout" className="workout-image" />
            </div>
          </>
        ) : !localStorage.getItem('gymbuddy_weekly_plan') ? (
          <div className="workout-content-wrapper" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px' }}>
            <Zap size={48} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
            <h3 className="workout-title">Set Up Your Plan</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Configure your goals, experience level, and gym locker to build your customized training schedule.</p>
            <button 
              className="btn btn-primary start-workout-btn" 
              onClick={() => navigate('/onboarding')}
              style={{ width: '100%' }}
            >
              <Zap size={16} fill="currentColor" /> Start Setup Flow
            </button>
          </div>
        ) : (
          <div className="workout-content-wrapper" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px' }}>
            <Trophy size={48} color="var(--brand-primary)" style={{ marginBottom: '16px' }} />
            <h3 className="workout-title">Plan Complete!</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You have finished all workouts in your current plan.</p>
            <button 
              className="btn btn-primary start-workout-btn" 
              onClick={handleGenerateNextWeek}
              disabled={isGeneratingNextWeek}
              style={{ width: '100%' }}
            >
              {isGeneratingNextWeek ? (
                <>
                  <div className="ai-loader-spinner" style={{ width: 16, height: 16, marginRight: 8 }}></div> Generating...
                </>
              ) : (
                <>
                  <Zap size={16} fill="currentColor" /> Generate Next Week's Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4 className="stat-title">Week 1 Progress</h4>
          <div className="stat-value">
            <span className="stat-highlight">{progressStats.completed}</span>
            <span className="stat-total">/{progressStats.total}</span>
          </div>
          <div className="progress-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
            ></div>
          </div>
          <div className="stat-sub-text">Workouts Completed</div>
        </div>

        <div className="stat-card">
          <h4 className="stat-title">Consistency Score</h4>
          <div className="stat-value-large">{progressStats.consistency}</div>
          <div className="stat-message">{progressStats.message}</div>
        </div>
      </div>

      
      <BottomNavigation />

      {showCheckIn && (
        <DailyCheckIn 
          onComplete={handleCheckInComplete}
          onCancel={() => setShowCheckIn(false)}
        />
      )}

      {showMidWeekCheckIn && (
        <MidWeekCheckIn 
          onComplete={handleMidWeekComplete}
          onCancel={() => setShowMidWeekCheckIn(false)}
        />
      )}

      {/* Mid-Week Message Modal */}
      {midWeekMessage && (
        <div className="checkin-container" style={{ zIndex: 2000 }}>
          <div className="checkin-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Zap size={48} color="var(--brand-primary)" style={{ marginBottom: '24px' }} />
            <h2 style={{ marginBottom: '16px' }}>Coach's Checkpoint</h2>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {midWeekMessage}
            </div>
          </div>
          <div className="checkin-footer">
            <button className="btn btn-primary start-ai-btn" onClick={() => setMidWeekMessage(null)}>
              Got it, let's go!
            </button>
          </div>
        </div>
      )}

      {(adaptedPlan || isAILoading) && !isWorkoutActive && (
        <AdaptedWorkout 
          aiResponse={adaptedPlan}
          isLoading={isAILoading}
          onCancel={() => {
            setAdaptedPlan(null);
            setIsAILoading(false);
          }}
          onStart={(workout) => {
            setIsWorkoutActive(true);
          }}
          onExerciseClick={(ex) => {
            setActiveExerciseForDetails(ex);
          }}
        />
      )}

      {isWorkoutActive && adaptedPlan && (
        <ActiveWorkout 
          workout={adaptedPlan.workout}
          onClose={() => setIsWorkoutActive(false)}
          onFinish={() => {
            setIsWorkoutActive(false);
            setAdaptedPlan(null);
            
            // Advance weekly plan
            const newWeeklyPlan = weeklyPlan.slice(1);
            setWeeklyPlan(newWeeklyPlan);
            localStorage.setItem('gymbuddy_weekly_plan', JSON.stringify(newWeeklyPlan));
            
            // Increment completed count
            const newCompletedCount = completedWorkouts + 1;
            setCompletedWorkouts(newCompletedCount);
            localStorage.setItem('gymbuddy_completed_workouts', newCompletedCount.toString());
            
            // Append to history
            const newHistory = [...workoutHistory, adaptedPlan.workout];
            setWorkoutHistory(newHistory);
            localStorage.setItem('gymbuddy_workout_history', JSON.stringify(newHistory));

            // Automatically trigger Mid-Week Checkpoint at or past the halfway point
            const newTotalWorkouts = newWeeklyPlan.length + newCompletedCount;
            const hasDoneMidWeek = localStorage.getItem('gymbuddy_midweek_done');
            if (newCompletedCount >= Math.ceil(newTotalWorkouts / 2) && newWeeklyPlan.length > 0 && !hasDoneMidWeek) {
              setTimeout(() => setShowMidWeekCheckIn(true), 600);
            }
            
            alert("Workout Complete! The home screen has been updated with your next workout.");
          }}
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

export default Home;
