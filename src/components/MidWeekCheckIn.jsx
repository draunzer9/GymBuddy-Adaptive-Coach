import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import './MidWeekCheckIn.css';

function MidWeekCheckIn({ onComplete, onCancel }) {
  const [motivation, setMotivation] = useState('');
  const [time, setTime] = useState('');
  const [soreness, setSoreness] = useState('');
  const [details, setDetails] = useState('');

  const handleNext = () => {
    onComplete({ motivation, time, soreness, details: details.trim() || 'None' });
  };

  const isFormValid = motivation && time && soreness;

  return (
    <div className="midweek-checkin-container">
      <div className="midweek-checkin-header">
        <button className="btn-icon" onClick={onCancel}>
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <div className="midweek-checkin-content">
        <h1 className="midweek-checkin-title">Weekly Coach Checkpoint</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Let's see how you're recovering and adapt the rest of your week!</p>
        
        <div className="midweek-checkin-section">
          <h3>1. Motivation & Energy</h3>
          <div className="pill-group">
            {['High', 'Medium', 'Low', 'Burnt out'].map(f => (
              <div 
                key={f}
                className={`pill ${motivation === f ? 'selected' : ''}`}
                onClick={() => setMotivation(f)}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="midweek-checkin-section">
          <h3>2. Time for remaining week</h3>
          <div className="pill-group">
            {['Same as planned', 'Less time', 'Barely any time'].map(t => (
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

        <div className="midweek-checkin-section">
          <h3>3. Soreness & Pain</h3>
          <div className="pill-group">
            {['None', 'Normal DOMS', 'Sharp Pain/Injury'].map(s => (
              <div 
                key={s}
                className={`pill ${soreness === s ? 'selected' : ''}`}
                onClick={() => setSoreness(s)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="midweek-checkin-section">
          <h3>4. Anything else I should know? (Optional)</h3>
          <textarea
            className="issues-textarea"
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="Equipment changes, travel, or specific pain..."
            rows={3}
          />
        </div>
      </div>

      <div className="midweek-checkin-footer">
        <button 
          className="btn btn-primary start-ai-btn"
          disabled={!isFormValid}
          onClick={handleNext}
        >
          Let AI Adapt My Week
        </button>
      </div>
    </div>
  );
}

export default MidWeekCheckIn;
