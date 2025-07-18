import React, { useState } from 'react';
import { TabataWorkout, WorkoutProgress } from '../types/workout';
import { predefinedWorkouts } from '../data/workouts';
import { useWorkoutProgress } from '../hooks/useWorkoutProgress';
import { calculateWorkoutDuration, formatWorkoutDuration, calculateRestTime, formatRestTime } from '../utils/workoutCalculations';

interface WorkoutSelectorProps {
  onWorkoutSelect: (workout: TabataWorkout) => void;
}

interface WorkoutCardProps {
  workout: TabataWorkout;
  isSelected: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  isSelected,
  isCompleted,
  onSelect,
  onPreview
}) => {
  return (
    <div 
      className={`workout-card ${isSelected ? 'selected' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={onSelect}
    >
      <div className="workout-header">
        <h3>{workout.name}</h3>
        {isCompleted && <span className="completion-badge">✓</span>}
      </div>
      <p className="workout-description">{workout.description}</p>
      <div className="workout-details">
        <span className="detail-item">{workout.pairs.length} exercises</span>
        <span className="detail-item">{workout.rounds} rounds</span>
        <span className="detail-item">Total: {formatWorkoutDuration(calculateWorkoutDuration(workout))}</span>
        <span className="detail-item">Rest: {formatRestTime(calculateRestTime(workout))}</span>
      </div>
      
      <div className="exercise-list">
        <h4 className="exercise-list-title">Exercises:</h4>
        <div className="exercise-items">
          {workout.pairs.map((pair, index) => (
            <div key={index} className="exercise-pair-compact">
              <span className="exercise-compact">{pair.exerciseA.name}</span>
              <span className="exercise-separator">•</span>
              <span className="exercise-compact">{pair.exerciseB.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="preview-button"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
      >
        Preview Exercises
      </button>
    </div>
  );
};

interface WorkoutPreviewProps {
  workout: TabataWorkout;
  onClose: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout, onClose }) => {
  return (
    <div className="workout-preview-overlay" onClick={onClose}>
      <div className="workout-preview" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h2>{workout.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <p className="preview-description">{workout.description}</p>
        <div className="preview-details">
          <div className="detail">
            <strong>Rounds:</strong> {workout.rounds} × 20s work / 10s rest per exercise
          </div>
          <div className="detail">
            <strong>Rest between exercises:</strong> {workout.restBetweenPairs} seconds
          </div>
          <div className="detail">
            <strong>Total time:</strong> {formatWorkoutDuration(calculateWorkoutDuration(workout))}
          </div>
          <div className="detail">
            <strong>Total rest time:</strong> {formatRestTime(calculateRestTime(workout))}
          </div>
        </div>
        <div className="exercise-pairs">
          <h3>Exercises</h3>
          {workout.pairs.map((pair, index) => (
            <div key={index} className="exercise-pair">
              <div className="pair-header">Exercise {index + 1}</div>
              <div className="exercises">
                <div className="exercise">
                  <span className="exercise-label">A:</span>
                  <span className="exercise-name">{pair.exerciseA.name}</span>
                  {pair.exerciseA.description && (
                    <span className="exercise-description">{pair.exerciseA.description}</span>
                  )}
                </div>
                <div className="exercise">
                  <span className="exercise-label">B:</span>
                  <span className="exercise-name">{pair.exerciseB.name}</span>
                  {pair.exerciseB.description && (
                    <span className="exercise-description">{pair.exerciseB.description}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({
  onWorkoutSelect
}) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<TabataWorkout | null>(null);
  
  const { 
    workoutProgress, 
    isWorkoutCompleted, 
    getCompletedWorkoutsCount,
    getTotalWorkoutsCount,
    getOverallProgress 
  } = useWorkoutProgress(predefinedWorkouts);

  const handleWorkoutSelect = (workout: TabataWorkout) => {
    setSelectedWorkoutId(workout.id);
  };

  const handleStartWorkout = () => {
    const selectedWorkout = predefinedWorkouts.find(w => w.id === selectedWorkoutId);
    if (selectedWorkout) {
      onWorkoutSelect(selectedWorkout);
    }
  };

  return (
    <div className="workout-selector">
      <div className="selector-header">
        <h1>Choose Your Tabata Workout</h1>
        <p>Select a workout to get started with your training session</p>
        
        <div className="overall-progress">
          <div className="progress-stats">
            <span className="progress-label">Overall Progress:</span>
            <span className="progress-count">
              {getCompletedWorkoutsCount()} of {getTotalWorkoutsCount()} workouts completed
            </span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-overall">
              <div 
                className="progress-fill-overall" 
                style={{ width: `${getOverallProgress()}%` }}
              />
            </div>
            <span className="progress-percentage">{getOverallProgress()}%</span>
          </div>
        </div>
      </div>

      <div className="workout-grid">
        {predefinedWorkouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            isSelected={selectedWorkoutId === workout.id}
            isCompleted={isWorkoutCompleted(workout.id)}
            onSelect={() => handleWorkoutSelect(workout)}
            onPreview={() => setPreviewWorkout(workout)}
          />
        ))}
      </div>

      {selectedWorkoutId && (
        <div className="start-workout-section">
          <button 
            className="start-workout-button"
            onClick={handleStartWorkout}
          >
            Start Workout
          </button>
        </div>
      )}

      {previewWorkout && (
        <WorkoutPreview
          workout={previewWorkout}
          onClose={() => setPreviewWorkout(null)}
        />
      )}
    </div>
  );
};