import { renderHook, act } from '@testing-library/react';
import { useTabataTimer } from './useTabataTimer';
import { TabataWorkout } from '../types/workout';

const mockWorkout: TabataWorkout = {
  id: 'test-workout',
  name: 'Test Workout',
  description: 'A test workout',
  rounds: 2,
  restBetweenPairs: 30,
  pairs: [
    {
      exerciseA: { name: 'Exercise A1' },
      exerciseB: { name: 'Exercise B1' }
    },
    {
      exerciseA: { name: 'Exercise A2' },
      exerciseB: { name: 'Exercise B2' }
    }
  ]
};

const mockConfig = {
  workTime: 5, // Use shorter times for testing
  restTime: 3,
  pairRestTime: 10,
};

describe('useTabataTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    expect(result.current.timerState).toEqual({
      isActive: false,
      isPaused: false,
      currentPhase: 'work',
      timeRemaining: 5,
      currentRound: 1,
      currentPairIndex: 0,
    });
    expect(result.current.isWorkoutComplete).toBe(false);
    expect(result.current.currentExercise).toBe('A');
    expect(result.current.progressPercentage).toBe(0);
  });

  test('starts timer correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timerState.isActive).toBe(true);
    expect(result.current.timerState.isPaused).toBe(false);
  });

  test('pauses timer correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.timerState.isActive).toBe(false);
    expect(result.current.timerState.isPaused).toBe(true);
  });

  test('stops timer correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      result.current.stopTimer();
    });

    expect(result.current.timerState.isActive).toBe(false);
    expect(result.current.timerState.isPaused).toBe(false);
  });

  test('resets timer correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(2000); // Advance by 2 seconds
    });

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.timerState).toEqual({
      isActive: false,
      isPaused: false,
      currentPhase: 'work',
      timeRemaining: 5,
      currentRound: 1,
      currentPairIndex: 0,
    });
  });

  test('advances timer correctly during work phase', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(1000); // Advance by 1 second
    });

    expect(result.current.timerState.timeRemaining).toBe(4);
    expect(result.current.timerState.currentPhase).toBe('work');
  });

  test('transitions from work to rest phase', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(5000); // Complete work phase
    });

    expect(result.current.timerState.currentPhase).toBe('rest');
    expect(result.current.timerState.timeRemaining).toBe(3);
  });

  test('transitions from rest to next round', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(8000); // Complete work + rest phase
    });

    expect(result.current.timerState.currentPhase).toBe('work');
    expect(result.current.timerState.currentRound).toBe(2);
    expect(result.current.timerState.timeRemaining).toBe(5);
  });

  test('transitions to pair rest after completing all rounds in a pair', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(16000); // Complete 2 rounds (2 x (5s work + 3s rest))
    });

    expect(result.current.timerState.currentPhase).toBe('pairRest');
    expect(result.current.timerState.timeRemaining).toBe(10);
    expect(result.current.timerState.currentPairIndex).toBe(0);
  });

  test('transitions to next pair after pair rest', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(26000); // Complete first pair + pair rest
    });

    expect(result.current.timerState.currentPhase).toBe('work');
    expect(result.current.timerState.currentPairIndex).toBe(1);
    expect(result.current.timerState.currentRound).toBe(1);
    expect(result.current.timerState.timeRemaining).toBe(5);
  });

  test('completes workout after all pairs and rounds', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    // Complete entire workout: 2 pairs × 2 rounds × (5s work + 3s rest) + 1 pair rest = 42s
    act(() => {
      jest.advanceTimersByTime(42000);
    });

    expect(result.current.timerState.currentPhase).toBe('finished');
    expect(result.current.isWorkoutComplete).toBe(true);
    expect(result.current.timerState.isActive).toBe(false);
  });

  test('calculates current exercise correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    // Round 1 should be exercise A
    expect(result.current.currentExercise).toBe('A');

    act(() => {
      result.current.startTimer();
    });

    // Complete first work + rest to get to round 2
    act(() => {
      jest.advanceTimersByTime(8000);
    });

    // Round 2 should be exercise B
    expect(result.current.currentExercise).toBe('B');
  });

  test('calculates progress percentage correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    expect(result.current.progressPercentage).toBe(0);

    act(() => {
      result.current.startTimer();
    });

    // After half of first work phase
    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.progressPercentage).toBeGreaterThan(0);
    expect(result.current.progressPercentage).toBeLessThan(25);
  });

  test('handles paused state correctly', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    const timeBeforePause = result.current.timerState.timeRemaining;

    act(() => {
      result.current.pauseTimer();
    });

    act(() => {
      jest.advanceTimersByTime(5000); // Time should not advance while paused
    });

    expect(result.current.timerState.timeRemaining).toBe(timeBeforePause);
  });

  test('returns null exercise during pair rest and finished phases', () => {
    const { result } = renderHook(() => useTabataTimer(mockWorkout, mockConfig));

    act(() => {
      result.current.startTimer();
    });

    // Advance to pair rest
    act(() => {
      jest.advanceTimersByTime(16000);
    });

    expect(result.current.currentExercise).toBe(null);

    // Advance to finished
    act(() => {
      jest.advanceTimersByTime(26000);
    });

    expect(result.current.currentExercise).toBe(null);
  });
});