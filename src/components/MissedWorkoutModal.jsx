import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import './MissedWorkoutModal.css';

function MissedWorkoutModal({ missedCalories, onDismiss, onStartWorkout }) {
  return (
    <div className="missed-workout-overlay">
      <div className="missed-workout-modal">
        <div className="missed-icon-wrapper">
          <AlertCircle size={32} />
        </div>
        
        <h2>See what you missed!</h2>
        
        <div className="missed-stats">
          <p>
            If you had worked out over the last 2 days, you would have burned approximately:
          </p>
          <strong>{missedCalories} Calories</strong>
        </div>
        
        <p className="missed-motivation">
          "Don't let a few days off derail your progress. Come on man, finish strong!"
        </p>
        
        <div className="missed-actions">
          <button className="btn-primary" onClick={onStartWorkout}>
            Start Today's Workout <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
          </button>
          <button className="btn-secondary" onClick={onDismiss}>
            Not right now
          </button>
        </div>
      </div>
    </div>
  );
}

export default MissedWorkoutModal;
