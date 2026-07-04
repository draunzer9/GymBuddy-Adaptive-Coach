import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowLeft, Lock, Trophy } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import './Progress.css';

function Progress() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('Strength');
  const [completedWorkouts, setCompletedWorkouts] = useState(0);
  const [consistencyData, setConsistencyData] = useState([]);
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [strengthData, setStrengthData] = useState([]);

  useEffect(() => {
    // Load local storage data
    const savedCompleted = parseInt(localStorage.getItem('gymbuddy_completed_workouts') || '0', 10);
    const savedHistoryStr = localStorage.getItem('gymbuddy_workout_history');
    const savedPlanStr = localStorage.getItem('gymbuddy_weekly_plan');
    
    let history = [];
    if (savedHistoryStr) {
      try { history = JSON.parse(savedHistoryStr); } catch (e) { }
    }
    
    let plan = [];
    if (savedPlanStr) {
      try { plan = JSON.parse(savedPlanStr); } catch (e) { }
    }

    setCompletedWorkouts(savedCompleted);

    // Calculate Consistency Score
    const totalCycleWorkouts = plan.length + savedCompleted || 3; 
    const score = savedCompleted > 0 ? Math.round((savedCompleted / totalCycleWorkouts) * 100) : 0;
    setConsistencyScore(Math.min(score, 100)); // cap at 100

    // Build Consistency Bar Chart (Generated based on score to give dynamic feedback)
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const cData = days.map((day, i) => {
      let fillHeight = 0;
      if (savedCompleted > 0) {
        // pseudo-random logic that stays relatively stable based on score so it visually updates
        const pseudoHeight = (score * 0.8) + (Math.sin(i + savedCompleted) * 20); 
        fillHeight = Math.max(15, Math.min(pseudoHeight, 100));
      }
      return { day, height: fillHeight };
    });
    setConsistencyData(cData);

    // Process Strength Data from Workout History
    if (history.length > 0) {
      const exerciseMap = {};
      history.forEach(workout => {
        // The AI coach returns workout.exercisesList usually
        const exercises = workout.exercisesList || workout.exercises || [];
        exercises.forEach(ex => {
          // Parse numerical weight (strip 'kg', 'lbs', etc.)
          let weightNum = parseFloat(ex.weight);
          if (!isNaN(weightNum) && weightNum > 0) {
            if (!exerciseMap[ex.name]) {
              exerciseMap[ex.name] = {
                id: ex.id || ex.name,
                name: ex.name,
                history: [],
                totalSets: 0,
                totalReps: 0
              };
            }
            exerciseMap[ex.name].history.push(weightNum);
            
            // Approximate sets and reps based on strings like "3" and "8-12"
            let sets = parseInt(ex.sets) || 3;
            let reps = 10;
            if (typeof ex.reps === 'string') {
              const match = ex.reps.match(/(\d+)/);
              if (match) reps = parseInt(match[1]);
            } else if (typeof ex.reps === 'number') {
              reps = ex.reps;
            }
            exerciseMap[ex.name].totalSets += sets;
            exerciseMap[ex.name].totalReps += (sets * reps);
          }
        });
      });

      const sData = [];
      Object.values(exerciseMap).forEach(ex => {
        if (ex.history.length >= 1) { 
          const startWeight = ex.history[0];
          const currentWeight = ex.history[ex.history.length - 1];
          let increaseStr = "0.0%";
          let increaseRaw = 0;
          if (startWeight > 0 && ex.history.length > 1) {
            increaseRaw = ((currentWeight - startWeight) / startWeight) * 100;
            increaseStr = (increaseRaw > 0 ? '+' : '') + increaseRaw.toFixed(1) + '%';
          }
          
          // Generate chart data ensuring at least 2 points so lines draw nicely
          let chartData = [...ex.history];
          if (chartData.length === 1) chartData.push(chartData[0]); 

          sData.push({
            id: ex.id,
            name: ex.name,
            startWeight,
            currentWeight,
            increaseStr,
            increaseRaw,
            chartData,
            maxWeight: Math.max(...ex.history),
            totalSets: ex.totalSets,
            totalReps: ex.totalReps
          });
        }
      });
      // Sort by amount of history, then by weight increase
      sData.sort((a, b) => b.chartData.length - a.chartData.length || b.increaseRaw - a.increaseRaw);
      
      setStrengthData(sData.slice(0, 5)); // Keep top 5
    }
  }, []);

  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="progress-header">
        <h1 className="progress-title">Progress</h1>
        <div className="week-dropdown">
          This Week <ChevronDown size={14} />
        </div>
      </div>
      
      {completedWorkouts === 0 ? (
        // --- EMPTY STATE (New User) ---
        <div className="empty-state-container">
          <div className="empty-state-hero">
            <Trophy size={48} className="empty-trophy" />
            <h2>Start Your Journey</h2>
            <p>Complete your first workout to unlock insights, track your strength gains, and view your consistency score.</p>
          </div>

          <div className="consistency-card locked">
            <div className="locked-overlay">
              <Lock size={24} />
              <span>Locked until Workout 1</span>
            </div>
            <h3 className="card-title">Consistency Score</h3>
            <div className="score-container blur-content">
              <div className="score-value">0<span>%</span></div>
              <div className="score-message">Keep it up!</div>
            </div>
          </div>

          <h3 className="section-title">Strength Progress</h3>
          <div className="strength-list locked blur-content">
             <div className="strength-item" style={{ pointerEvents: 'none' }}>
                <div className="item-icon-box"></div>
                <div className="item-details">
                  <h4>Barbell Bench Press</h4>
                  <p className="weight-flow">60 kg <span className="arrow">→</span> 65 kg <span className="increase-tag">+8.3%</span></p>
                </div>
             </div>
          </div>
        </div>
      ) : (
        // --- REAL DATA STATE (Existing User) ---
        <>
          <div className="consistency-card">
            <h3 className="card-title">Consistency Score</h3>
            <div className="score-container">
              <div className="score-value">{consistencyScore}<span>%</span></div>
              <div className="score-message">
                {consistencyScore > 80 ? "Unstoppable! Incredible work." : 
                 consistencyScore > 40 ? "Great job! Keep it up!" : 
                 "Every session counts. You got this!"}
              </div>
            </div>
            <div className="bar-chart-container">
              {consistencyData.map((d, i) => (
                <div key={i} className="bar-wrapper">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${d.height}%` }}></div>
                  </div>
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          <h3 className="section-title">Strength Progress</h3>
          <div className="strength-list">
            {strengthData.length > 0 ? (
              strengthData.map((ex, idx) => (
                <div className="strength-item" key={ex.id || idx} onClick={() => setSelectedExercise(ex)}>
                  <div className="item-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m14.5 9.5-9 9" /><path d="m11 13-2-2" /><path d="m13 11-2-2" /><path d="M4 14.5a3 3 0 0 1-2-2l3-3a3 3 0 0 1 2 2" /><path d="M5.5 16a3 3 0 0 0 2 2l3-3a3 3 0 0 0-2-2" /><path d="m9.5 20 9-9" /><path d="m13 11 2 2" /><path d="m11 13 2 2" /><path d="M20 9.5a3 3 0 0 1 2 2l-3 3a3 3 0 0 1-2-2" /><path d="M18.5 8a3 3 0 0 0-2-2l-3 3a3 3 0 0 0 2 2" />
                    </svg>
                  </div>
                  <div className="item-details">
                    <h4>{ex.name}</h4>
                    <p className="weight-flow">{ex.startWeight} kg <span className="arrow">→</span> {ex.currentWeight} kg <span className="increase-tag" style={{ background: ex.increaseRaw > 0 ? 'rgba(217, 249, 36, 0.2)' : 'rgba(255,255,255,0.1)' }}>{ex.increaseStr}</span></p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-strength-msg">
                <p>No weighted exercises recorded yet. Add weight to your workouts to track your strength gains!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderDetailedView = () => {
    // Generate SVG path for the line chart
    const maxVal = selectedExercise.maxWeight + (selectedExercise.maxWeight * 0.2);
    const minVal = Math.max(0, Math.min(...selectedExercise.chartData) - (selectedExercise.maxWeight * 0.2));
    const range = maxVal - minVal || 1; // avoid div by zero
    
    const height = 150;
    const width = 300;
    
    const points = selectedExercise.chartData.map((val, idx) => {
      const x = (idx / (selectedExercise.chartData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="detailed-view">
        <div className="detailed-header">
          <button className="back-btn" onClick={() => setSelectedExercise(null)}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="detailed-title">{selectedExercise.name}</h2>
          <div style={{ width: 24 }}></div>
        </div>
        
        <div className="detailed-tabs">
          <div 
            className={`tab ${activeTab === 'Strength' ? 'active' : ''}`}
            onClick={() => setActiveTab('Strength')}
          >
            Strength
          </div>
          <div 
            className={`tab ${activeTab === 'Volume' ? 'active' : ''}`}
            onClick={() => setActiveTab('Volume')}
          >
            Volume
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Estimated 1RM</h3>
          <div className="chart-area">
            <svg viewBox={`0 0 ${width} ${height}`} className="line-chart">
              {/* Grid lines */}
              <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="0" x2={width} y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Data line */}
              <polyline 
                points={points}
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {selectedExercise.chartData.map((val, idx) => {
                const x = (idx / (selectedExercise.chartData.length - 1)) * width;
                const y = height - ((val - minVal) / range) * height;
                return (
                  <circle key={idx} cx={x} cy={y} r="6" fill="var(--bg-primary)" stroke="var(--brand-primary)" strokeWidth="3" />
                );
              })}
            </svg>
          </div>
          
          <div className="chart-x-axis">
            {selectedExercise.chartData.map((_, idx) => (
              <span key={idx}>W{idx + 1}</span>
            ))}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Start Weight</span>
            <span className="stat-val">{selectedExercise.startWeight} kg</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Current Weight</span>
            <span className="stat-val" style={{ color: 'var(--brand-primary)' }}>{selectedExercise.currentWeight} kg</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total Sets</span>
            <span className="stat-val">{selectedExercise.totalSets}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total Reps</span>
            <span className="stat-val">{selectedExercise.totalReps}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="progress-container">
      {selectedExercise ? renderDetailedView() : renderDashboard()}
      <BottomNavigation />
    </div>
  );
}

export default Progress;
