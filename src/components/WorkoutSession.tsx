import React from 'react';
import { TabataWorkout } from '../types/workout';
import { useTabataTimer } from '../hooks/useTabataTimer';
import { TabataTimer } from './TabataTimer';

interface WorkoutSessionProps {
  workout: TabataWorkout;
  onWorkoutComplete?: () => void;
  onWorkoutExit?: () => void;
}

export const WorkoutSession: React.FC<WorkoutSessionProps> = ({
  workout,
  onWorkoutComplete,
  onWorkoutExit
}) => {
  const {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    isWorkoutComplete,
    currentExercise,
    progressPercentage
  } = useTabataTimer(workout);

  React.useEffect(() => {
    if (isWorkoutComplete && onWorkoutComplete) {
      onWorkoutComplete();
    }
  }, [isWorkoutComplete, onWorkoutComplete]);

  const getCurrentPair = () => {
    return workout.pairs[timerState.currentPairIndex];
  };

  const getCurrentExerciseName = () => {
    const pair = getCurrentPair();
    if (!pair || !currentExercise) return '';
    return currentExercise === 'A' ? pair.exerciseA.name : pair.exerciseB.name;
  };

  const getCurrentExerciseDescription = () => {
    const pair = getCurrentPair();
    if (!pair || !currentExercise) return '';
    const exercise = currentExercise === 'A' ? pair.exerciseA : pair.exerciseB;
    return exercise.description || '';
  };

  const getPhaseDisplayText = () => {
    switch (timerState.currentPhase) {
      case 'work':
        return 'WORK';
      case 'rest':
        return 'REST';
      case 'pairRest':
        return 'REST BETWEEN PAIRS';
      case 'finished':
        return 'WORKOUT COMPLETE!';
      default:
        return '';
    }
  };

  const handleExitWorkout = () => {
    stopTimer();
    if (onWorkoutExit) {
      onWorkoutExit();
    }
  };

  return (
    <div className={`workout-session ${timerState.currentPhase}`}>
      <div className="workout-session-header">
        <div className="workout-info">
          <h1>{workout.name}</h1>
          <div className="workout-progress">
            <span>Pair {timerState.currentPairIndex + 1} of {workout.pairs.length}</span>
            <span>•</span>
            <span>Round {timerState.currentRound} of {workout.rounds}</span>
          </div>
        </div>
        <button className="exit-button" onClick={handleExitWorkout}>
          Exit
        </button>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="timer-section">
        <TabataTimer
          timeRemaining={timerState.timeRemaining}
          phase={timerState.currentPhase}
          isActive={timerState.isActive}
        />
      </div>

      <div className="phase-indicator">
        <h2 className="phase-text">{getPhaseDisplayText()}</h2>
      </div>

      {timerState.currentPhase !== 'finished' && timerState.currentPhase !== 'pairRest' && (
        <div className="exercise-display">
          <div className="current-exercise">
            <h3>{getCurrentExerciseName()}</h3>
            {getCurrentExerciseDescription() && (
              <p className="exercise-description">{getCurrentExerciseDescription()}</p>
            )}
          </div>
          
          <div className="exercise-indicator">
            <span className={`exercise-label ${currentExercise === 'A' ? 'active' : ''}`}>
              A: {getCurrentPair()?.exerciseA.name}
            </span>
            <span className={`exercise-label ${currentExercise === 'B' ? 'active' : ''}`}>
              B: {getCurrentPair()?.exerciseB.name}
            </span>
          </div>
        </div>
      )}

      {timerState.currentPhase === 'pairRest' && (
        <div className="rest-display">
          <h3>Rest Time</h3>
          <p>Get ready for the next exercise pair</p>
          {timerState.currentPairIndex + 1 < workout.pairs.length && (
            <div className="next-pair-preview">
              <h4>Next Exercises:</h4>
              <div className="next-exercises">
                <span>A: {workout.pairs[timerState.currentPairIndex + 1]?.exerciseA.name}</span>
                <span>B: {workout.pairs[timerState.currentPairIndex + 1]?.exerciseB.name}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {timerState.currentPhase === 'finished' && (
        <div className="completion-display">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You've completed the {workout.name} workout!</p>
          <div className="completion-stats">
            <div className="stat">
              <span className="stat-value">{workout.pairs.length}</span>
              <span className="stat-label">Exercise Pairs</span>
            </div>
            <div className="stat">
              <span className="stat-value">{workout.rounds}</span>
              <span className="stat-label">Rounds Each</span>
            </div>
            <div className="stat">
              <span className="stat-value">{workout.pairs.length * workout.rounds}</span>
              <span className="stat-label">Total Rounds</span>
            </div>
          </div>
        </div>
      )}

      <div className="workout-controls">
        {!timerState.isActive && !isWorkoutComplete && (
          <button 
            className="control-button start-button" 
            onClick={startTimer}
          >
            {timerState.isPaused ? 'Resume' : 'Start'}
          </button>
        )}
        
        {timerState.isActive && (
          <button 
            className="control-button pause-button" 
            onClick={pauseTimer}
          >
            Pause
          </button>
        )}
        
        {(timerState.isPaused || timerState.isActive) && (
          <button 
            className="control-button reset-button" 
            onClick={resetTimer}
          >
            Reset
          </button>
        )}

        {isWorkoutComplete && (
          <button 
            className="control-button restart-button" 
            onClick={resetTimer}
          >
            Do Again
          </button>
        )}
      </div>
    </div>
  );
};