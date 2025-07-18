import React from 'react';
import { TabataWorkout } from '../types/workout';
import { useTabataTimer } from '../hooks/useTabataTimer';
import { useWorkoutProgress } from '../hooks/useWorkoutProgress';
import { useAudioManager } from '../utils/audioManager';
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

  const { markWorkoutComplete, saveCurrentSession } = useWorkoutProgress([workout]);
  const { settings: audioSettings, playCue, setEnabled, setVolume, initializeAudio, testAudio } = useAudioManager();
  const [showAudioControls, setShowAudioControls] = React.useState(false);

  // Track previous phase to detect transitions
  const prevPhaseRef = React.useRef(timerState.currentPhase);
  const prevTimeRemainingRef = React.useRef(timerState.timeRemaining);

  React.useEffect(() => {
    if (isWorkoutComplete && onWorkoutComplete) {
      markWorkoutComplete(workout.id);
      playCue('workoutComplete');
      onWorkoutComplete();
    }
  }, [isWorkoutComplete, onWorkoutComplete, markWorkoutComplete, workout.id, playCue]);

  // Auto-save progress as workout progresses
  React.useEffect(() => {
    if (timerState.isActive || timerState.isPaused) {
      saveCurrentSession(workout.id, timerState);
    }
  }, [timerState, workout.id, saveCurrentSession]);

  // Audio cues for phase transitions and countdown
  React.useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    const prevTimeRemaining = prevTimeRemainingRef.current;
    const currentPhase = timerState.currentPhase;
    const currentTimeRemaining = timerState.timeRemaining;

    // Phase transition audio cues
    if (prevPhase !== currentPhase && timerState.isActive) {
      switch (currentPhase) {
        case 'work':
          playCue('workStart');
          break;
        case 'rest':
          playCue('restStart');
          break;
        case 'pairRest':
          playCue('pairRestStart');
          break;
      }
    }

    // Countdown audio cues (last 3 seconds of work or rest, but not pairRest)
    if (timerState.isActive && 
        (currentPhase === 'work' || currentPhase === 'rest') &&
        currentTimeRemaining <= 3 && 
        currentTimeRemaining > 0 &&
        prevTimeRemaining > currentTimeRemaining) {
      playCue('countdown');
    }

    // Update refs
    prevPhaseRef.current = currentPhase;
    prevTimeRemainingRef.current = currentTimeRemaining;
  }, [timerState.currentPhase, timerState.timeRemaining, timerState.isActive, playCue]);

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
        return 'REST BETWEEN EXERCISES';
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

  const handleStartTimer = async () => {
    // Initialize audio context on user interaction
    await initializeAudio();
    startTimer();
  };

  const handleTestAudio = async () => {
    await initializeAudio();
    await testAudio();
  };

  return (
    <div className={`workout-session ${timerState.currentPhase}`}>
      <div className="workout-session-header">
        <div className="workout-info">
          <h1>{workout.name}</h1>
          <div className="workout-progress">
            <span>Exercise {timerState.currentPairIndex + 1} of {workout.pairs.length}</span>
            <span>•</span>
            <span>Round {timerState.currentRound} of {workout.rounds}</span>
          </div>
        </div>
        <button className="exit-button" onClick={handleExitWorkout}>
          Exit
        </button>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="progress-text">
            {Math.round(progressPercentage)}% Complete
          </div>
        </div>
        
        <div className="progress-indicators">
          <div className="pair-indicators">
            {workout.pairs.map((_, index) => (
              <div 
                key={index}
                className={`pair-indicator ${
                  index < timerState.currentPairIndex ? 'completed' : 
                  index === timerState.currentPairIndex ? 'active' : 'pending'
                }`}
              >
                <span className="pair-number">{index + 1}</span>
              </div>
            ))}
          </div>
          
          <div className="round-indicators">
            {Array.from({ length: workout.rounds }, (_, index) => (
              <div 
                key={index}
                className={`round-indicator ${
                  index < timerState.currentRound - 1 ? 'completed' : 
                  index === timerState.currentRound - 1 ? 'active' : 'pending'
                }`}
              >
                <span className="round-dot"></span>
              </div>
            ))}
          </div>
        </div>
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
          <p>Get ready for the next exercise</p>
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
              <span className="stat-label">Exercises</span>
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
            onClick={handleStartTimer}
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

        <div className="secondary-controls">
          <button 
            className="control-button audio-toggle-button" 
            onClick={() => setShowAudioControls(!showAudioControls)}
            title="Audio Settings"
          >
            🔊 Audio
          </button>
        </div>
      </div>

      {showAudioControls && (
        <div className="audio-controls">
          <div className="audio-control-header">
            <h3>Audio Settings</h3>
            <button 
              className="close-audio-controls" 
              onClick={() => setShowAudioControls(false)}
            >
              ×
            </button>
          </div>
          
          <div className="audio-control-row">
            <label className="audio-control-label">
              <input
                type="checkbox"
                checked={audioSettings.enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enable Sound Effects
            </label>
          </div>
          
          {audioSettings.enabled && (
            <>
              <div className="audio-control-row">
                <label className="audio-control-label">
                  Volume: {Math.round(audioSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioSettings.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                />
              </div>
              <div className="audio-control-row">
                <button 
                  className="control-button test-audio-button" 
                  onClick={handleTestAudio}
                >
                  Test Audio
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};