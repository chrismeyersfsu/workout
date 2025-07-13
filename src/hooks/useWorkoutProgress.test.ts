import { renderHook, act } from '@testing-library/react';
import { useWorkoutProgress } from './useWorkoutProgress';
import { TabataWorkout, TimerState } from '../types/workout';

const mockWorkouts: TabataWorkout[] = [
  {
    id: 'workout1',
    name: 'Test Workout 1',
    description: 'First test workout',
    rounds: 8,
    restBetweenPairs: 60,
    pairs: [
      {
        exerciseA: { name: 'Exercise A1' },
        exerciseB: { name: 'Exercise B1' }
      }
    ]
  },
  {
    id: 'workout2',
    name: 'Test Workout 2',
    description: 'Second test workout',
    rounds: 6,
    restBetweenPairs: 45,
    pairs: [
      {
        exerciseA: { name: 'Exercise A2' },
        exerciseB: { name: 'Exercise B2' }
      }
    ]
  }
];

const mockTimerState: TimerState = {
  isActive: true,
  isPaused: false,
  currentPhase: 'work',
  timeRemaining: 15,
  currentRound: 3,
  currentPairIndex: 1,
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useWorkoutProgress', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    jest.clearAllMocks();
  });

  test('initializes with empty progress when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    expect(result.current.workoutProgress).toEqual({});
    expect(result.current.getCompletedWorkoutsCount()).toBe(0);
    expect(result.current.getTotalWorkoutsCount()).toBe(2);
    expect(result.current.getOverallProgress()).toBe(0);
  });

  test('loads progress from localStorage on mount', () => {
    const storedProgress = {
      workout1: {
        workoutId: 'workout1',
        currentPairIndex: 0,
        currentRound: 1,
        isCompleted: true,
        completedAt: '2023-01-01T00:00:00.000Z'
      }
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedProgress));

    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    expect(result.current.workoutProgress.workout1).toBeDefined();
    expect(result.current.workoutProgress.workout1.isCompleted).toBe(true);
    expect(result.current.workoutProgress.workout1.completedAt).toBeInstanceOf(Date);
  });

  test('saves progress to localStorage when progress changes', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.updateProgress('workout1', {
        currentPairIndex: 1,
        currentRound: 5,
        isCompleted: false
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tabata-workout-progress',
      expect.stringContaining('workout1')
    );
  });

  test('updates workout progress correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.updateProgress('workout1', {
        currentPairIndex: 1,
        currentRound: 5,
        isCompleted: false
      });
    });

    const progress = result.current.getWorkoutProgress('workout1');
    expect(progress).toBeDefined();
    expect(progress!.currentPairIndex).toBe(1);
    expect(progress!.currentRound).toBe(5);
    expect(progress!.isCompleted).toBe(false);
  });

  test('marks workout as complete', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.markWorkoutComplete('workout1');
    });

    const progress = result.current.getWorkoutProgress('workout1');
    expect(progress).toBeDefined();
    expect(progress!.isCompleted).toBe(true);
    expect(progress!.completedAt).toBeInstanceOf(Date);
    expect(result.current.isWorkoutCompleted('workout1')).toBe(true);
  });

  test('resets workout progress', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.updateProgress('workout1', {
        currentPairIndex: 1,
        currentRound: 5,
        isCompleted: false
      });
    });

    expect(result.current.getWorkoutProgress('workout1')).toBeDefined();

    act(() => {
      result.current.resetWorkoutProgress('workout1');
    });

    expect(result.current.getWorkoutProgress('workout1')).toBeUndefined();
  });

  test('checks if workout is completed', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    expect(result.current.isWorkoutCompleted('workout1')).toBe(false);

    act(() => {
      result.current.markWorkoutComplete('workout1');
    });

    expect(result.current.isWorkoutCompleted('workout1')).toBe(true);
  });

  test('counts completed workouts correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    expect(result.current.getCompletedWorkoutsCount()).toBe(0);

    act(() => {
      result.current.markWorkoutComplete('workout1');
    });

    expect(result.current.getCompletedWorkoutsCount()).toBe(1);

    act(() => {
      result.current.markWorkoutComplete('workout2');
    });

    expect(result.current.getCompletedWorkoutsCount()).toBe(2);
  });

  test('calculates overall progress percentage correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    expect(result.current.getOverallProgress()).toBe(0);

    act(() => {
      result.current.markWorkoutComplete('workout1');
    });

    expect(result.current.getOverallProgress()).toBe(50); // 1 of 2 workouts = 50%

    act(() => {
      result.current.markWorkoutComplete('workout2');
    });

    expect(result.current.getOverallProgress()).toBe(100); // 2 of 2 workouts = 100%
  });

  test('saves current session and marks complete when finished', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    const finishedTimerState: TimerState = {
      ...mockTimerState,
      currentPhase: 'finished',
      isActive: false
    };

    act(() => {
      result.current.saveCurrentSession('workout1', finishedTimerState);
    });

    expect(result.current.isWorkoutCompleted('workout1')).toBe(true);
  });

  test('saves current session progress when workout is active', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.saveCurrentSession('workout1', mockTimerState);
    });

    const progress = result.current.getWorkoutProgress('workout1');
    expect(progress).toBeDefined();
    expect(progress!.currentPairIndex).toBe(mockTimerState.currentPairIndex);
    expect(progress!.currentRound).toBe(mockTimerState.currentRound);
    expect(progress!.isCompleted).toBe(false);
  });

  test('saves current session progress when workout is paused', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    const pausedTimerState: TimerState = {
      ...mockTimerState,
      isActive: false,
      isPaused: true
    };

    act(() => {
      result.current.saveCurrentSession('workout1', pausedTimerState);
    });

    const progress = result.current.getWorkoutProgress('workout1');
    expect(progress).toBeDefined();
    expect(progress!.currentPairIndex).toBe(pausedTimerState.currentPairIndex);
    expect(progress!.currentRound).toBe(pausedTimerState.currentRound);
    expect(progress!.isCompleted).toBe(false);
  });

  test('clears all progress', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.markWorkoutComplete('workout1');
      result.current.markWorkoutComplete('workout2');
    });

    expect(result.current.getCompletedWorkoutsCount()).toBe(2);

    act(() => {
      result.current.clearAllProgress();
    });

    expect(result.current.getCompletedWorkoutsCount()).toBe(0);
    expect(result.current.workoutProgress).toEqual({});
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tabata-workout-progress');
  });

  test('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    expect(result.current.workoutProgress).toEqual({});
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load workout progress from localStorage:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  test('handles localStorage save errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage save error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.updateProgress('workout1', { currentRound: 2 });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save workout progress to localStorage:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  test('returns correct total workouts count when no workouts provided', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress([]));

    expect(result.current.getTotalWorkoutsCount()).toBe(0);
    expect(result.current.getOverallProgress()).toBe(0);
  });

  test('merges partial progress updates with existing progress', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useWorkoutProgress(mockWorkouts));

    act(() => {
      result.current.updateProgress('workout1', {
        currentPairIndex: 1,
        currentRound: 3,
        isCompleted: false
      });
    });

    act(() => {
      result.current.updateProgress('workout1', {
        currentRound: 5
      });
    });

    const progress = result.current.getWorkoutProgress('workout1');
    expect(progress!.currentPairIndex).toBe(1); // Should remain from first update
    expect(progress!.currentRound).toBe(5); // Should be updated
    expect(progress!.isCompleted).toBe(false); // Should remain from first update
  });
});