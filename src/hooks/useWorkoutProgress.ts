import { useState, useEffect, useCallback } from 'react';
import { WorkoutProgress, TabataWorkout, TimerState } from '../types/workout';

const STORAGE_KEY = 'tabata-workout-progress';

export interface UseWorkoutProgressReturn {
  workoutProgress: Record<string, WorkoutProgress>;
  updateProgress: (workoutId: string, progress: Partial<WorkoutProgress>) => void;
  markWorkoutComplete: (workoutId: string) => void;
  resetWorkoutProgress: (workoutId: string) => void;
  getWorkoutProgress: (workoutId: string) => WorkoutProgress | undefined;
  isWorkoutCompleted: (workoutId: string) => boolean;
  getCompletedWorkoutsCount: () => number;
  getTotalWorkoutsCount: () => number;
  getOverallProgress: () => number;
  saveCurrentSession: (workoutId: string, timerState: TimerState) => void;
  clearAllProgress: () => void;
}

export const useWorkoutProgress = (
  availableWorkouts: TabataWorkout[] = []
): UseWorkoutProgressReturn => {
  const [workoutProgress, setWorkoutProgress] = useState<Record<string, WorkoutProgress>>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const progressWithDates: Record<string, WorkoutProgress> = {};
        Object.keys(parsed).forEach(key => {
          progressWithDates[key] = {
            ...parsed[key],
            completedAt: parsed[key].completedAt ? new Date(parsed[key].completedAt) : undefined
          };
        });
        setWorkoutProgress(progressWithDates);
      }
    } catch (error) {
      console.error('Failed to load workout progress from localStorage:', error);
      setWorkoutProgress({});
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutProgress));
    } catch (error) {
      console.error('Failed to save workout progress to localStorage:', error);
    }
  }, [workoutProgress]);

  const updateProgress = useCallback((workoutId: string, progress: Partial<WorkoutProgress>) => {
    setWorkoutProgress(prev => ({
      ...prev,
      [workoutId]: {
        workoutId,
        currentPairIndex: 0,
        currentRound: 1,
        isCompleted: false,
        ...prev[workoutId],
        ...progress,
      }
    }));
  }, []);

  const markWorkoutComplete = useCallback((workoutId: string) => {
    setWorkoutProgress(prev => ({
      ...prev,
      [workoutId]: {
        ...prev[workoutId],
        workoutId,
        isCompleted: true,
        completedAt: new Date(),
        currentPairIndex: 0,
        currentRound: 1,
      }
    }));
  }, []);

  const resetWorkoutProgress = useCallback((workoutId: string) => {
    setWorkoutProgress(prev => {
      const updated = { ...prev };
      delete updated[workoutId];
      return updated;
    });
  }, []);

  const getWorkoutProgress = useCallback((workoutId: string): WorkoutProgress | undefined => {
    return workoutProgress[workoutId];
  }, [workoutProgress]);

  const isWorkoutCompleted = useCallback((workoutId: string): boolean => {
    return workoutProgress[workoutId]?.isCompleted || false;
  }, [workoutProgress]);

  const getCompletedWorkoutsCount = useCallback((): number => {
    return Object.values(workoutProgress).filter(progress => progress.isCompleted).length;
  }, [workoutProgress]);

  const getTotalWorkoutsCount = useCallback((): number => {
    return availableWorkouts.length;
  }, [availableWorkouts.length]);

  const getOverallProgress = useCallback((): number => {
    const totalWorkouts = getTotalWorkoutsCount();
    if (totalWorkouts === 0) return 0;
    
    const completedWorkouts = getCompletedWorkoutsCount();
    return Math.round((completedWorkouts / totalWorkouts) * 100);
  }, [getCompletedWorkoutsCount, getTotalWorkoutsCount]);

  const saveCurrentSession = useCallback((workoutId: string, timerState: TimerState) => {
    // Only save if workout is not complete and is in progress
    if (timerState.currentPhase === 'finished') {
      markWorkoutComplete(workoutId);
    } else if (timerState.isActive || timerState.isPaused) {
      updateProgress(workoutId, {
        currentPairIndex: timerState.currentPairIndex,
        currentRound: timerState.currentRound,
        isCompleted: false,
      });
    }
  }, [updateProgress, markWorkoutComplete]);

  const clearAllProgress = useCallback(() => {
    setWorkoutProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear progress from localStorage:', error);
    }
  }, []);

  return {
    workoutProgress,
    updateProgress,
    markWorkoutComplete,
    resetWorkoutProgress,
    getWorkoutProgress,
    isWorkoutCompleted,
    getCompletedWorkoutsCount,
    getTotalWorkoutsCount,
    getOverallProgress,
    saveCurrentSession,
    clearAllProgress,
  };
};