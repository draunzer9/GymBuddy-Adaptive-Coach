import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronRight, CheckCircle2, Flame, RefreshCw, AlertTriangle, Activity, Dumbbell, Circle, CheckCircle, Info } from 'lucide-react';
import { generateAlternativeExercise } from '../services/AICoachService';
import ExerciseDetails from './ExerciseDetails';
import { GoogleSheetsService } from '../services/GoogleSheetsService';
import { AmplitudeService } from '../services/AmplitudeService';
import './ActiveWorkout.css';

function ActiveWorkout({ workout, onFinish, onClose }) {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime] = useState(Date.now());

  // Calorie tracking states
  const [totalCalories, setTotalCalories] = useState(0);
  const [exerciseCalories, setExerciseCalories] = useState({});

  // Input states
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(20);

  // New states for Swapping Exercises
  const [exercises, setExercises] = useState(workout.exercisesList || []);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showAlternativesView, setShowAlternativesView] = useState(false);
  const [alternativeOptions, setAlternativeOptions] = useState([]);
  const [selectedAltIndex, setSelectedAltIndex] = useState(0);

  // State for viewing exercise details overlay
  const [viewingDetails, setViewingDetails] = useState(null);

  const currentEx = exercises[currentExIndex];

  const handleFetchAlternatives = async () => {
    setIsSwapping(true);
    try {
      const alts = await generateAlternativeExercise(currentEx);
      setAlternativeOptions(alts);
      setSelectedAltIndex(0);
      setShowAlternativesView(true);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch alternatives.");
    } finally {
      setIsSwapping(false);
    }
  };

  const confirmAlternative = () => {
    const altEx = alternativeOptions[selectedAltIndex];
    const newExercises = [...exercises];
    newExercises[currentExIndex] = altEx;
    setExercises(newExercises);
    setShowAlternativesView(false);
    setCurrentSet(1);
  };

  // Dynamic set calorie burner formula
  const calculateSetCalories = (exType, repsLogged, weightLogged) => {
    let baseMet = 3.0; 
    if (exType === 'Free Weight') baseMet = 4.0;
    else if (exType === 'Machine') baseMet = 3.5;
    else if (exType === 'Accessories') baseMet = 3.0;

    const durationSeconds = (repsLogged * 3) + 5;
    const durationMinutes = durationSeconds / 60;
    const bodyWeight = 70; // Assumed default body weight in kg
    
    // Metabolic baseline expenditure
    let activeBurn = baseMet * 3.5 * bodyWeight / 200 * durationMinutes;
    
    // Additional load expenditure: Force x distance with biological efficiency scaling
    const mechanicalWorkJoules = weightLogged * 9.81 * (0.8 * repsLogged);
    const metabolicWorkJoules = mechanicalWorkJoules * 5; 
    const loadBurn = metabolicWorkJoules / 4184;

    return Math.round((activeBurn + loadBurn) * 10) / 10;
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (isResting && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isResting && timeLeft === 0) {
      setIsResting(false);
    }
    return () => clearInterval(timer);
  }, [isResting, isPaused, timeLeft]);

  // Set defaults when exercise changes
  useEffect(() => {
    if (currentEx) {
      setReps(parseInt(String(currentEx.reps).split('-')[0]) || 10);
      setWeight(parseInt(currentEx.weight) || 20);
    }
  }, [currentEx]);

  if (!currentEx) {
    return (
      <div className="active-workout-container empty">
        <h2>No exercises found in this workout.</h2>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    );
  }

  const handleCompleteSet = () => {
    // Calculate calorie burn for this completed set
    const setBurn = calculateSetCalories(currentEx.type, reps, weight);
    
    // Accumulate in total calories
    const newTotal = Math.round((totalCalories + setBurn) * 10) / 10;
    setTotalCalories(newTotal);

    // Accumulate in this specific exercise's bucket
    const exId = currentEx.id;
    const currentExCalories = exerciseCalories[exId] || 0;
    const newExCalories = Math.round((currentExCalories + setBurn) * 10) / 10;
    
    const updatedExCalories = {
      ...exerciseCalories,
      [exId]: newExCalories
    };
    setExerciseCalories(updatedExCalories);

    if (currentSet < currentEx.sets) {
      setCurrentSet(prev => prev + 1);
      setTimeLeft(currentEx.restSeconds || 60);
      setIsResting(true);
      setIsPaused(false);
    } else {
      // Move to next exercise
      if (currentExIndex < exercises.length - 1) {
        setCurrentExIndex(prev => prev + 1);
        setCurrentSet(1);
        setTimeLeft(60); // Rest between exercises
        setIsResting(true);
      } else {
        // Workout complete - send cumulative calorie mapping metrics back
        const durationSecs = Math.floor((Date.now() - startTime) / 1000);
        GoogleSheetsService.trackWorkoutCompleted(workout.title, durationSecs, newTotal, exercises.length);
        AmplitudeService.trackWorkoutCompleted(workout.title, durationSecs, newTotal, exercises.length);
        onFinish(updatedExCalories, newTotal);
      }
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="active-workout-container">
      <div className="active-workout-header">
        <button className="btn-icon" onClick={onClose}>
          <X size={24} />
        </button>
        <span className="header-title">Workout Active</span>
        <div className="header-calories-badge" title="Calories burned so far in this workout">
          <Flame size={15} color="var(--brand-primary, #cdfd50)" fill="var(--brand-primary, #cdfd50)" />
          <span>{totalCalories} kcal</span>
        </div>
      </div>

      <div className="active-workout-content">
        <h2
          className="exercise-title"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setViewingDetails(currentEx)}
          title="Tap to view exercise details"
        >
          {currentEx.name}
          <Info size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        </h2>
        
        {showAlternativesView ? (
          <div className="alternatives-view">
            <div className="busy-banner">
              <AlertTriangle size={16} />
              <span>This equipment is busy?</span>
            </div>
            <p className="alt-subtitle">Here are some great alternatives that target the same muscles.</p>
            
            <div className="alt-list">
              {alternativeOptions.map((alt, idx) => (
                <div 
                  key={alt.id || idx} 
                  className={`alt-card ${selectedAltIndex === idx ? 'selected' : ''}`}
                  onClick={() => setSelectedAltIndex(idx)}
                >
                  <div className="alt-icon">
                    {alt.type === 'Machine' || alt.type === 'Cable' ? <Activity size={24} /> : <Dumbbell size={24} />}
                  </div>
                  <div className="alt-details">
                    <h4>{alt.name}</h4>
                    <span className="alt-similarity">{alt.similarityScore || 80}% Similar</span>
                  </div>
                  <div className="alt-radio">
                    {selectedAltIndex === idx ? <CheckCircle size={20} fill="var(--brand-primary)" color="var(--bg-primary)" /> : <Circle size={20} color="var(--text-secondary)" />}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary use-alt-btn" onClick={confirmAlternative}>
              Use This Alternative
            </button>
            <button className="btn btn-secondary cancel-alt-btn" onClick={() => setShowAlternativesView(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <p className="set-indicator">Set {currentSet} of {currentEx.sets}</p>
            
            <button 
              className="busy-banner clickable" 
              onClick={handleFetchAlternatives}
              disabled={isSwapping}
            >
              <AlertTriangle size={16} />
              <span>{isSwapping ? 'Finding alternatives...' : 'This equipment is busy?'}</span>
              {isSwapping && <div className="ai-loader-spinner" style={{ width: 14, height: 14, marginLeft: 'auto' }}></div>}
            </button>

        {!isResting ? (
          <div className="logging-container">
            <p className="target-text">Target: {currentEx.reps} Reps</p>
            
            <div className="log-row">
              <label>Reps</label>
              <div className="stepper">
                <button onClick={() => setReps(r => Math.max(0, r - 1))}>-</button>
                <input type="number" value={reps} onChange={e => setReps(Number(e.target.value))} />
                <button onClick={() => setReps(r => r + 1)}>+</button>
              </div>
            </div>

            <div className="log-row">
              <label>Weight (kg)</label>
              <div className="stepper">
                <button onClick={() => setWeight(w => Math.max(0, w - 2.5))}>-</button>
                <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} />
                <button onClick={() => setWeight(w => w + 2.5)}>+</button>
              </div>
            </div>

            <div className="calorie-estimate-pill">
              <Flame size={14} color="var(--brand-primary, #cdfd50)" fill="rgba(217,249,36,0.1)" />
              <span>Est. Set Burn: <strong>{calculateSetCalories(currentEx.type, reps, weight)} kcal</strong></span>
            </div>

            <button className="btn btn-primary complete-set-btn" onClick={handleCompleteSet}>
              Complete Set
            </button>
          </div>
        ) : (
          <div className="rest-container">
            <h3 className="rest-title">Rest Timer</h3>
            <div className="timer-display">
              {formatTime(timeLeft)}
            </div>
            
            <div className="rest-controls">
              <button 
                className="btn-icon circle"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
              </button>
              <button className="btn btn-secondary skip-btn" onClick={skipRest}>
                Skip Rest
              </button>
            </div>
            
            {/* Next up preview */}
            <div className="next-up-preview">
              <span className="label">Up Next</span>
              <div className="next-info">
                {currentSet < currentEx.sets ? (
                  <span>{currentEx.name} (Set {currentSet})</span>
                ) : currentExIndex < exercises.length - 1 ? (
                  <span>{exercises[currentExIndex + 1].name} (Set 1)</span>
                ) : (
                  <span>Workout Complete!</span>
                )}
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      <div className="workout-progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentExIndex + 1) / exercises.length) * 100}%` }}
        ></div>
      </div>

      {/* Exercise Details overlay — renders on top, user taps back to return here */}
      {viewingDetails && (
        <ExerciseDetails
          exercise={viewingDetails}
          onClose={() => setViewingDetails(null)}
        />
      )}
    </div>
  );
}

export default ActiveWorkout;
