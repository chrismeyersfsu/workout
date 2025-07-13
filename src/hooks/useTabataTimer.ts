import { useState, useEffect, useCallback, useRef } from 'react';
import { TabataWorkout, TimerState } from '../types/workout';

export interface TabataTimerConfig {
  workTime: number; // seconds
  restTime: number; // seconds
  pairRestTime: number; // seconds between pairs
}

export interface UseTabataTimerReturn {
  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  isWorkoutComplete: boolean;
  currentExercise: 'A' | 'B' | null;
  progressPercentage: number;
}

const DEFAULT_CONFIG: TabataTimerConfig = {
  workTime: 20,
  restTime: 10,
  pairRestTime: 60,
};

export const useTabataTimer = (
  workout: TabataWorkout,
  config: TabataTimerConfig = DEFAULT_CONFIG
): UseTabataTimerReturn => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    currentPhase: 'work',
    timeRemaining: config.workTime,
    currentRound: 1,
    currentPairIndex: 0,
  });

  const totalRounds = workout.rounds;
  const totalPairs = workout.pairs.length;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const calculateProgressPercentage = useCallback((): number => {
    const completedPairs = timerState.currentPairIndex;
    const completedRoundsInCurrentPair = timerState.currentRound - 1;
    const totalCompletedRounds = completedPairs * totalRounds + completedRoundsInCurrentPair;
    const totalPossibleRounds = totalPairs * totalRounds;
    
    if (timerState.currentPhase === 'finished') {
      return 100;
    }
    
    // Add partial progress for current round based on phase and time remaining
    let currentRoundProgress = 0;
    if (timerState.currentPhase === 'work') {
      currentRoundProgress = (config.workTime - timerState.timeRemaining) / config.workTime * 0.5;
    } else if (timerState.currentPhase === 'rest') {
      currentRoundProgress = 0.5 + (config.restTime - timerState.timeRemaining) / config.restTime * 0.5;
    }
    
    return Math.min(100, ((totalCompletedRounds + currentRoundProgress) / totalPossibleRounds) * 100);
  }, [timerState, totalRounds, totalPairs, config]);

  const getCurrentExercise = useCallback((): 'A' | 'B' | null => {
    if (timerState.currentPhase === 'finished' || timerState.currentPhase === 'pairRest') {
      return null;
    }
    
    // In tabata, we alternate between exercises A and B each round
    return timerState.currentRound % 2 === 1 ? 'A' : 'B';
  }, [timerState]);

  const advanceTimer = useCallback(() => {
    setTimerState(prevState => {
      const newState = { ...prevState };
      const now = Date.now();
      const timeSinceLastTick = now - lastTickRef.current;
      lastTickRef.current = now;
      
      // Calculate how much time should advance based on actual elapsed time
      // This helps maintain accuracy even if the tab becomes inactive
      const timeToAdvance = Math.min(Math.round(timeSinceLastTick / 1000), newState.timeRemaining);
      
      if (newState.timeRemaining > timeToAdvance) {
        newState.timeRemaining -= timeToAdvance;
        return newState;
      }

      // Time's up for current phase, advance to next phase
      if (newState.currentPhase === 'work') {
        // Work phase finished, move to rest
        newState.currentPhase = 'rest';
        newState.timeRemaining = config.restTime;
      } else if (newState.currentPhase === 'rest') {
        // Rest phase finished, check if round is complete
        if (newState.currentRound < totalRounds) {
          // More rounds in this pair
          newState.currentRound += 1;
          newState.currentPhase = 'work';
          newState.timeRemaining = config.workTime;
        } else {
          // Pair complete, check if more pairs
          if (newState.currentPairIndex < totalPairs - 1) {
            // More pairs to go, start pair rest
            newState.currentPhase = 'pairRest';
            newState.timeRemaining = config.pairRestTime;
          } else {
            // All pairs complete, workout finished
            newState.currentPhase = 'finished';
            newState.timeRemaining = 0;
            newState.isActive = false;
          }
        }
      } else if (newState.currentPhase === 'pairRest') {
        // Pair rest finished, move to next pair
        newState.currentPairIndex += 1;
        newState.currentRound = 1;
        newState.currentPhase = 'work';
        newState.timeRemaining = config.workTime;
      }

      return newState;
    });
  }, [config, totalRounds, totalPairs]);

  const startTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isPaused: true,
    }));
  }, []);

  const stopTimer = useCallback(() => {
    clearTimer();
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
    }));
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    lastTickRef.current = Date.now();
    setTimerState({
      isActive: false,
      isPaused: false,
      currentPhase: 'work',
      timeRemaining: config.workTime,
      currentRound: 1,
      currentPairIndex: 0,
    });
  }, [clearTimer, config.workTime]);

  // Timer effect
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused && timerState.currentPhase !== 'finished') {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(advanceTimer, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [timerState.isActive, timerState.isPaused, timerState.currentPhase, advanceTimer, clearTimer]);

  // Handle visibility change to maintain accuracy when tab becomes active again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && timerState.isActive && !timerState.isPaused) {
        // Reset last tick time when tab becomes visible to avoid large time jumps
        lastTickRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerState.isActive, timerState.isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    timerState,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    isWorkoutComplete: timerState.currentPhase === 'finished',
    currentExercise: getCurrentExercise(),
    progressPercentage: calculateProgressPercentage(),
  };
};