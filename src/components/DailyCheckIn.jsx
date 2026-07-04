import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import './DailyCheckIn.css';

function DailyCheckIn({ onComplete, onCancel }) {
  const [feeling, setFeeling] = useState('');
  const [time, setTime] = useState('');
  const [hasIssues, setHasIssues] = useState(''); // 'yes' or 'no'
  const [issuesText, setIssuesText] = useState('');

  const handleNext = () => {
    const finalIssues = hasIssues === 'yes' ? [issuesText.trim()] : ['None'];
    onComplete({ feeling, time, issues: finalIssues });
  };

  const isFormValid = feeling && time && (hasIssues === 'no' || (hasIssues === 'yes' && issuesText.trim().length > 0));

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <button className="btn-icon" onClick={onCancel}>
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="checkin-content">
        <h1 className="checkin-title">Quick check before your workout:</h1>
        
        <div className="checkin-section">
          <h3>1. How are you feeling?</h3>
          <div className="pill-group">
            {['Great', 'Good', 'Tired', 'Unwell'].map(f => (
              <div 
                key={f}
                className={`pill ${feeling === f ? 'selected' : ''}`}
                onClick={() => setFeeling(f)}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="checkin-section">
          <h3>2. How much time do you have?</h3>
          <div className="pill-group">
            {['15 min', '20 min', '30 min', '45 min', '60+ min'].map(t => (
              <div 
                key={t}
                className={`pill ${time === t ? 'selected' : ''}`}
                onClick={() => setTime(t)}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="checkin-section">
          <h3>3. Any health issues today?</h3>
          <div className="pill-group" style={{ marginBottom: hasIssues === 'yes' ? '12px' : '0px' }}>
            <div 
              className={`pill ${hasIssues === 'no' ? 'selected' : ''}`}
              onClick={() => { setHasIssues('no'); setIssuesText(''); }}
            >
              No
            </div>
            <div 
              className={`pill ${hasIssues === 'yes' ? 'selected' : ''}`}
              onClick={() => setHasIssues('yes')}
            >
              Yes
            </div>
          </div>

          {hasIssues === 'yes' && (
            <textarea
              className="issues-textarea"
              value={issuesText}
              onChange={e => setIssuesText(e.target.value)}
              placeholder="Describe your health issue or pain (e.g. knee pain, back stiffness, shoulder soreness)..."
              rows={3}
            />
          )}
        </div>
      </div>

      <div className="checkin-footer">
        <button 
          className="btn btn-primary start-ai-btn"
          disabled={!isFormValid}
          onClick={handleNext}
        >
          Let AI Adapt My Workout
        </button>
      </div>
    </div>
  );
}

export default DailyCheckIn;
