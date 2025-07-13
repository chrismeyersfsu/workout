import React, { useState } from 'react';
import { TabataWorkout, WorkoutProgress } from '../types/workout';
import { predefinedWorkouts } from '../data/workouts';

interface WorkoutSelectorProps {
  onWorkoutSelect: (workout: TabataWorkout) => void;
  workoutProgress?: Record<string, WorkoutProgress>;
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
        <span className="detail-item">{workout.pairs.length} pairs</span>
        <span className="detail-item">{workout.rounds} rounds</span>
        <span className="detail-item">{workout.restBetweenPairs}s rest</span>
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
            <strong>Rest between pairs:</strong> {workout.restBetweenPairs} seconds
          </div>
          <div className="detail">
            <strong>Total time:</strong> ~{Math.ceil((workout.pairs.length * workout.rounds * 30 + workout.pairs.length * workout.restBetweenPairs) / 60)} minutes
          </div>
        </div>
        <div className="exercise-pairs">
          <h3>Exercise Pairs</h3>
          {workout.pairs.map((pair, index) => (
            <div key={index} className="exercise-pair">
              <div className="pair-header">Pair {index + 1}</div>
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
  onWorkoutSelect,
  workoutProgress = {}
}) => {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<TabataWorkout | null>(null);

  const handleWorkoutSelect = (workout: TabataWorkout) => {
    setSelectedWorkoutId(workout.id);
  };

  const handleStartWorkout = () => {
    const selectedWorkout = predefinedWorkouts.find(w => w.id === selectedWorkoutId);
    if (selectedWorkout) {
      onWorkoutSelect(selectedWorkout);
    }
  };

  const isWorkoutCompleted = (workoutId: string): boolean => {
    return workoutProgress[workoutId]?.isCompleted || false;
  };

  return (
    <div className="workout-selector">
      <div className="selector-header">
        <h1>Choose Your Tabata Workout</h1>
        <p>Select a workout to get started with your training session</p>
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