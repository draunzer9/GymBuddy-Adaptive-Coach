import React from 'react';
import { ArrowLeft, PlayCircle, Dumbbell } from 'lucide-react';
import { getMuscleAnatomy, getVideoId } from '../data/exerciseData';
import './ExerciseDetails.css';

function ExerciseDetails({ exercise, onClose }) {
  if (!exercise) return null;

  // Get a reliable video ID from our curated map first,
  // then fall back to extracting from whatever URL Gemini returned.
  let videoId = getVideoId(exercise.name);

  if (!videoId && exercise.videoUrl) {
    const embedMatch = exercise.videoUrl.match(/embed\/([^?&]+)/);
    const watchMatch = exercise.videoUrl.match(/[?&]v=([^&]+)/);
    const shortMatch = exercise.videoUrl.match(/youtu\.be\/([^?]+)/);
    if (embedMatch) videoId = embedMatch[1];
    else if (watchMatch) videoId = watchMatch[1];
    else if (shortMatch) videoId = shortMatch[1];
  }

  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  const watchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' exercise tutorial')}`;

  // Get the SVG anatomy diagram for the primary muscle group
  const anatomySvg = getMuscleAnatomy(exercise.muscles || []);

  return (
    <div className="exercise-details-overlay">
      <div className="exercise-details-modal">

        {/* Back button top bar */}
        <div className="modal-top-bar">
          <button className="btn-icon" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <ArrowLeft size={22} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Back to Exercises</span>
          </button>
        </div>

        {/* Video / Preview Section */}
        <div className="video-section">
          <div
            className="video-preview"
            onClick={() => window.open(watchUrl, '_blank')}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={`${exercise.name} tutorial`}
                className="preview-bg"
                onError={(e) => {
                  // If YouTube thumbnail fails, show a dark gradient fallback
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="no-thumbnail-bg" />
            )}
            <div className="play-overlay">
              <div className="play-button-circle">
                <PlayCircle size={56} color="white" />
              </div>
              <p className="watch-label">Watch on YouTube</p>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="details-content-scroll">
          <h2 className="exercise-title">{exercise.name}</h2>

          <div className="exercise-meta-row">
            <div className="meta-badge">
              <Dumbbell size={13} />
              <span>{exercise.type || 'Free Weight'}</span>
            </div>
            <div className="meta-badge">
              <span>{exercise.difficulty || 'Beginner'}</span>
            </div>
            {exercise.sets && (
              <div className="meta-badge">
                <span>{exercise.sets} sets × {exercise.reps} reps</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h3>Instructions</h3>
            <ul className="steps-list">
              {(exercise.instructions || []).map((step, idx) => (
                <li key={idx}>
                  <div className="step-num">{idx + 1}</div>
                  <p>{step}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Muscles + Anatomy Diagram */}
          <div className="muscles-section">
            <h3>Target Muscles</h3>
            <div className="muscle-tags">
              {(exercise.muscles || []).map((m, idx) => (
                <span
                  className={`muscle-tag ${idx === 0 ? 'primary' : 'secondary'}`}
                  key={idx}
                >
                  {m}{idx === 0 ? ' (Primary)' : ''}
                </span>
              ))}
            </div>

            {/* Anatomy SVG Diagram */}
            <div className="body-diagram">
              <div
                className="anatomy-svg-container"
                dangerouslySetInnerHTML={{ __html: anatomySvg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;
