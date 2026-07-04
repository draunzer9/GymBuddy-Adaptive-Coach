import React, { useState } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import './Progress.css';

// Mock data based on the screenshot
const mockStrengthData = [
  { id: 'bench', name: 'Bench Press', startWeight: 60, currentWeight: 65, increaseStr: '+8.3%', chartData: [40, 45, 50, 55, 60, 65], maxWeight: 65, totalSets: 18, totalReps: 126 },
  { id: 'squat', name: 'Barbell Squat', startWeight: 80, currentWeight: 90, increaseStr: '+12.5%', chartData: [70, 75, 75, 80, 85, 90], maxWeight: 90, totalSets: 15, totalReps: 120 },
  { id: 'deadlift', name: 'Deadlift', startWeight: 100, currentWeight: 110, increaseStr: '+10.0%', chartData: [90, 95, 100, 100, 105, 110], maxWeight: 110, totalSets: 12, totalReps: 60 },
];

const mockConsistencyDays = [
  { day: 'M', height: 40 },
  { day: 'T', height: 30 },
  { day: 'W', height: 45 },
  { day: 'T', height: 50 },
  { day: 'F', height: 80 },
  { day: 'S', height: 60 },
  { day: 'S', height: 75 },
];

function Progress() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('Strength');

  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="progress-header">
        <h1 className="progress-title">Progress</h1>
        <div className="week-dropdown">
          This Week <ChevronDown size={14} />
        </div>
      </div>
      
      <div className="consistency-card">
        <h3 className="card-title">Consistency Score</h3>
        <div className="score-container">
          <div className="score-value">72<span>%</span></div>
          <div className="score-message">Great job! Keep it up!</div>
        </div>
        <div className="bar-chart-container">
          {mockConsistencyDays.map((d, i) => (
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
        {mockStrengthData.map(ex => (
          <div className="strength-item" key={ex.id} onClick={() => setSelectedExercise(ex)}>
            <div className="item-icon-box">
              {/* Simple dumbbell SVG icon matching the screenshot */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m14.5 9.5-9 9" /><path d="m11 13-2-2" /><path d="m13 11-2-2" /><path d="M4 14.5a3 3 0 0 1-2-2l3-3a3 3 0 0 1 2 2" /><path d="M5.5 16a3 3 0 0 0 2 2l3-3a3 3 0 0 0-2-2" /><path d="m9.5 20 9-9" /><path d="m13 11 2 2" /><path d="m11 13 2 2" /><path d="M20 9.5a3 3 0 0 1 2 2l-3 3a3 3 0 0 1-2-2" /><path d="M18.5 8a3 3 0 0 0-2-2l-3 3a3 3 0 0 0 2 2" />
              </svg>
            </div>
            <div className="item-details">
              <h4>{ex.name}</h4>
              <p className="weight-flow">{ex.startWeight} kg <span className="arrow">→</span> {ex.currentWeight} kg <span className="increase-tag">{ex.increaseStr}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailedView = () => {
    // Generate SVG path for the line chart
    const maxVal = Math.max(...selectedExercise.chartData) + 10;
    const minVal = Math.min(...selectedExercise.chartData) - 10;
    const range = maxVal - minVal;
    
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
          <div style={{ width: 24 }}></div> {/* Spacer for centering */}
        </div>
        
        <div className="detailed-tabs">
          <div 
            className={`tab ${activeTab === 'Strength' ? 'active' : ''}`}
            onClick={() => setActiveTab('Strength')}
          >
            Strength
          </div>
          <div 
            className={`tab ${activeTab === 'History' ? 'active' : ''}`}
            onClick={() => setActiveTab('History')}
          >
            History
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="chart-svg-container">
            <svg viewBox={`0 -20 ${width} ${height + 40}`} className="line-chart">
              <polyline
                fill="none"
                stroke="var(--chart-line, #6366f1)"
                strokeWidth="2"
                points={points}
              />
              {selectedExercise.chartData.map((val, idx) => {
                const x = (idx / (selectedExercise.chartData.length - 1)) * width;
                const y = height - ((val - minVal) / range) * height;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="var(--chart-line, #6366f1)" />
                    <text x={x} y={y - 12} textAnchor="middle" className="chart-label">{val} kg</text>
                    <text x={x} y={height + 24} textAnchor="middle" className="chart-x-label">Wk {idx + 1}</text>
                    <line x1={x} y1={y + 8} x2={x} y2={height} stroke="var(--border-color, rgba(255,255,255,0.1))" strokeDasharray="2,2" strokeWidth="1" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="stats-grid-row">
          <div className="stat-box">
            <span className="stat-lbl">Max Weight</span>
            <span className="stat-val">{selectedExercise.maxWeight} <small>kg</small></span>
          </div>
          <div className="stat-box">
            <span className="stat-lbl">Total Sets</span>
            <span className="stat-val">{selectedExercise.totalSets}</span>
          </div>
          <div className="stat-box">
            <span className="stat-lbl">Total Reps</span>
            <span className="stat-val">{selectedExercise.totalReps}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="progress-page">
      <div className="progress-content-wrapper" style={{ padding: 0 }}>
        {selectedExercise ? renderDetailedView() : renderDashboard()}
      </div>
      {!selectedExercise && <BottomNavigation />}
    </div>
  );
}

export default Progress;
