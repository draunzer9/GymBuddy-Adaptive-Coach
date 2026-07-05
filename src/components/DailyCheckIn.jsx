import React, { useState } from 'react';
import { X, Zap } from 'lucide-react';
import './DailyCheckIn.css';

function DailyCheckIn({ onComplete, onCancel }) {
  const [stage, setStage] = useState('ask'); // 'ask' | 'details'
  const [feeling, setFeeling] = useState('');
  const [time, setTime] = useState('');
  const [hasIssues, setHasIssues] = useState('');
  const [issuesText, setIssuesText] = useState('');

  const handleNoDeviation = () => {
    // Send optimal defaults so the AI generates the full planned workout
    onComplete({ feeling: 'Great', time: '60+ min', issues: ['None'] });
  };

  const handleYesDeviation = () => {
    setStage('details');
  };

  const handleSubmit = () => {
    const finalIssues = hasIssues === 'yes' ? [issuesText.trim()] : ['None'];
    onComplete({ feeling, time, issues: finalIssues });
  };

  const isDetailsValid = feeling && time && (hasIssues === 'no' || (hasIssues === 'yes' && issuesText.trim().length > 0));

  return (
    <div className="checkin-overlay">
      <div className="checkin-popup">
        {/* Close Button */}
        <button className="checkin-close-btn" onClick={onCancel}>
          <X size={20} />
        </button>

        {/* Stage 1: Ask about deviation */}
        {stage === 'ask' && (
          <div className="checkin-ask-stage">
            <div className="checkin-icon-wrap">
              <Zap size={28} className="checkin-zap-icon" />
            </div>
            <h2 className="checkin-popup-title">Daily Check-In</h2>
            <p className="checkin-popup-subtitle">
              Any deviation from your regular plan today?
            </p>
            <div className="checkin-yn-group">
              <button className="checkin-yn-btn no" onClick={handleNoDeviation}>
                No — Stick to Plan
              </button>
              <button className="checkin-yn-btn yes" onClick={handleYesDeviation}>
                Yes — Adapt It
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Detailed questions */}
        {stage === 'details' && (
          <div className="checkin-details-stage">
            <h2 className="checkin-popup-title">Let's Adapt Your Workout</h2>
            <p className="checkin-popup-subtitle">Answer a few quick questions so the AI can tailor today's session.</p>

            <div className="checkin-section">
              <h3>How are you feeling?</h3>
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
              <h3>How much time do you have?</h3>
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
              <h3>Any health issues today?</h3>
              <div className="pill-group">
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
                  placeholder="e.g. knee pain, back stiffness..."
                  rows={3}
                />
              )}
            </div>

            <button
              className="checkin-submit-btn"
              disabled={!isDetailsValid}
              onClick={handleSubmit}
            >
              Let AI Adapt My Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DailyCheckIn;
