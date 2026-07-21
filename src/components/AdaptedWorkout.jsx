import React, { useState } from 'react';
import { ArrowLeft, Play, Dumbbell, Clock, ChevronRight, Flame } from 'lucide-react';
import ExerciseDetails from './ExerciseDetails';
import './AdaptedWorkout.css';

const estimateExerciseCalories = (ex) => {
  let baseMet = 3.0; 
  if (ex.type === 'Free Weight') baseMet = 4.0;
  else if (ex.type === 'Machine') baseMet = 3.5;
  else if (ex.type === 'Accessories') baseMet = 3.0;

  const repsLogged = parseInt(String(ex.reps).split('-')[0]) || 10;
  const weightLogged = parseInt(ex.weight) || 0;

  const durationSeconds = (repsLogged * 3) + 5;
  const durationMinutes = durationSeconds / 60;
  const bodyWeight = 70;
  
  let activeBurn = baseMet * 3.5 * bodyWeight / 200 * durationMinutes;
  const mechanicalWorkJoules = weightLogged * 9.81 * (0.8 * repsLogged);
  const metabolicWorkJoules = mechanicalWorkJoules * 5; 
  const loadBurn = metabolicWorkJoules / 4184;

  return Math.round((activeBurn + loadBurn) * ex.sets);
};

function AdaptedWorkout({ aiResponse, isLoading, onCancel, onStart }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  if (isLoading) {
    return (
      <div className="adapted-container">
        <div className="adapted-header">
          <button className="btn-icon" onClick={onCancel}>
            <ArrowLeft size={24} />
          </button>
          <span className="header-title">AI Coach</span>
          <div style={{ width: 24 }}></div>
        </div>
        <div className="adapted-loading-wrapper">
          <div className="ai-loader-spinner"></div>
          <h2>Analyzing your check-in...</h2>
          <p>Building your personalized workout.</p>
        </div>
      </div>
    );
  }

  if (!aiResponse) return null;

  const { message, workout } = aiResponse;

  const totalEstimatedCalories = (workout.exercisesList || []).reduce(
    (sum, ex) => sum + estimateExerciseCalories(ex),
    0
  );

  return (
    <div className="adapted-container">
      <div className="adapted-header">
        <button className="btn-icon" onClick={onCancel}>
          <ArrowLeft size={24} />
        </button>
        <span className="header-title">AI Coach Plan</span>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="adapted-content">

        <h3 className="section-title" style={{ marginTop: '0' }}>Your Adapted Workout</h3>

        <div className="adapted-workout-card">
          <div className="workout-image-container">
            <img
              src={workout.image || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
              alt={workout.title}
            />
            <div className="workout-overlay">
              <h2 className="workout-title">{workout.title}</h2>
            </div>
          </div>
          <div className="workout-details">
            <div className="detail-item">
              <Clock size={16} />
              <span>{workout.duration}</span>
            </div>
            <div className="detail-item">
              <Dumbbell size={16} />
              <span>{workout.exercisesList?.length || 0} exercises</span>
            </div>
            <div className="detail-item detail-calories">
              <Flame size={16} color="var(--brand-primary, #cdfd50)" fill="rgba(217,249,36,0.15)" />
              <span>~{totalEstimatedCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        {workout.exercisesList && (
          <div className="exercises-list-overview">
            {workout.exercisesList.map((ex, index) => (
              <div
                className="exercise-overview-item"
                key={ex.id || index}
                onClick={() => setSelectedExercise(ex)}
              >
                <div className="ex-number">{index + 1}</div>
                <div className="ex-info">
                  <h4>{ex.name}</h4>
                  <p>{ex.sets} sets × {ex.reps} reps{ex.weight ? ` • ${ex.weight}kg` : ''}</p>
                </div>
                <div className="ex-calories-tag" style={{ marginLeft: 'auto', marginRight: '8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Flame size={12} color="var(--brand-primary, #cdfd50)" fill="rgba(217,249,36,0.1)" />
                  <span style={{ color: 'var(--brand-primary, #cdfd50)', fontSize: '11px', fontWeight: 600 }}>
                    {estimateExerciseCalories(ex)} kcal
                  </span>
                </div>
                <ChevronRight size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adapted-footer">
        <button className="btn btn-primary start-btn" onClick={() => onStart(workout)}>
          <Play size={16} fill="currentColor" /> Let's Go!
        </button>
      </div>

      {/* Exercise Details — fully self-contained overlay inside this screen */}
      {selectedExercise && (
        <ExerciseDetails
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

export default AdaptedWorkout;
