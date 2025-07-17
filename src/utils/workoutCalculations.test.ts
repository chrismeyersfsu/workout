import { describe, test, expect } from 'vitest';
import {
  calculateWorkoutDuration,
  calculatePairDuration,
  formatWorkoutDuration,
  getWorkoutBreakdown,
  calculateRestTime,
  formatRestTime
} from './workoutCalculations';
import { TabataWorkout } from '../types/workout';

describe('workoutCalculations', () => {
  const mockWorkout: TabataWorkout = {
    id: 'test-workout',
    name: 'Test Workout',
    description: 'A test workout',
    rounds: 8,
    restBetweenPairs: 60,
    pairs: [
      {
        exerciseA: { name: 'Push-ups' },
        exerciseB: { name: 'Squats' }
      },
      {
        exerciseA: { name: 'Burpees' },
        exerciseB: { name: 'Lunges' }
      }
    ]
  };

  describe('calculatePairDuration', () => {
    test('should calculate correct duration for a single round', () => {
      expect(calculatePairDuration(1)).toBe(20); // 20s work, no rest
    });

    test('should calculate correct duration for multiple rounds', () => {
      expect(calculatePairDuration(4)).toBe(110); // 4 * 30 - 10 = 110s
      expect(calculatePairDuration(8)).toBe(230); // 8 * 30 - 10 = 230s
    });

    test('should handle zero rounds', () => {
      expect(calculatePairDuration(0)).toBe(-10);
    });
  });

  describe('calculateWorkoutDuration', () => {
    test('should calculate total workout duration correctly', () => {
      const duration = calculateWorkoutDuration(mockWorkout);
      // 2 pairs * 230s each = 460s + 60s rest between pairs = 520s
      expect(duration).toBe(520);
    });

    test('should handle workout wtesth single pair', () => {
      const singlePairWorkout = {
        ...mockWorkout,
        pairs: [mockWorkout.pairs[0]]
      };
      const duration = calculateWorkoutDuration(singlePairWorkout);
      // 1 pair * 230s + 0 rest = 230s
      expect(duration).toBe(230);
    });

    test('should handle empty workout', () => {
      const emptyWorkout = {
        ...mockWorkout,
        pairs: []
      };
      expect(calculateWorkoutDuration(emptyWorkout)).toBe(0);
    });

    test('should handle null/undefined workout', () => {
      expect(calculateWorkoutDuration(null as any)).toBe(0);
      expect(calculateWorkoutDuration(undefined as any)).toBe(0);
    });

    test('should handle workout wtesth different rest between pairs', () => {
      const customRestWorkout = {
        ...mockWorkout,
        restBetweenPairs: 30
      };
      const duration = calculateWorkoutDuration(customRestWorkout);
      // 2 pairs * 230s each = 460s + 30s rest between pairs = 490s
      expect(duration).toBe(490);
    });

    test('should handle workout wtesth different rounds', () => {
      const customRoundsWorkout = {
        ...mockWorkout,
        rounds: 4
      };
      const duration = calculateWorkoutDuration(customRoundsWorkout);
      // 2 pairs * 110s each = 220s + 60s rest between pairs = 280s
      expect(duration).toBe(280);
    });
  });

  describe('formatWorkoutDuration', () => {
    test('should format minutes and seconds correctly', () => {
      expect(formatWorkoutDuration(65)).toBe('1:05');
      expect(formatWorkoutDuration(125)).toBe('2:05');
      expect(formatWorkoutDuration(600)).toBe('10:00');
    });

    test('should format hours, minutes, and seconds for long workouts', () => {
      expect(formatWorkoutDuration(3665)).toBe('1:01:05');
      expect(formatWorkoutDuration(7200)).toBe('2:00:00');
    });

    test('should handle zero duration', () => {
      expect(formatWorkoutDuration(0)).toBe('0:00');
    });

    test('should handle negative duration', () => {
      expect(formatWorkoutDuration(-10)).toBe('0:00');
    });

    test('should pad single digtests correctly', () => {
      expect(formatWorkoutDuration(5)).toBe('0:05');
      expect(formatWorkoutDuration(65)).toBe('1:05');
      expect(formatWorkoutDuration(3605)).toBe('1:00:05');
    });
  });

  describe('getWorkoutBreakdown', () => {
    test('should provide correct workout breakdown', () => {
      const breakdown = getWorkoutBreakdown(mockWorkout);
      
      expect(breakdown).toEqual({
        totalDuration: 520, // 320 work + 140 rest + 60 pair rest
        workTime: 320, // 2 pairs * 8 rounds * 20s
        restTime: 140, // 2 pairs * 7 rest periods * 10s
        pairRestTime: 60, // 1 rest period * 60s
        pairs: 2,
        rounds: 8
      });
    });

    test('should handle single pair workout', () => {
      const singlePairWorkout = {
        ...mockWorkout,
        pairs: [mockWorkout.pairs[0]]
      };
      const breakdown = getWorkoutBreakdown(singlePairWorkout);
      
      expect(breakdown).toEqual({
        totalDuration: 230, // 160 work + 70 rest + 0 pair rest
        workTime: 160, // 1 pair * 8 rounds * 20s
        restTime: 70, // 1 pair * 7 rest periods * 10s
        pairRestTime: 0, // 0 rest periods
        pairs: 1,
        rounds: 8
      });
    });

    test('should handle empty workout', () => {
      const emptyWorkout = {
        ...mockWorkout,
        pairs: []
      };
      const breakdown = getWorkoutBreakdown(emptyWorkout);
      
      expect(breakdown).toEqual({
        totalDuration: 0,
        workTime: 0,
        restTime: 0,
        pairRestTime: 0,
        pairs: 0,
        rounds: 8
      });
    });

    test('should handle null/undefined workout', () => {
      const breakdown = getWorkoutBreakdown(null as any);
      
      expect(breakdown).toEqual({
        totalDuration: 0,
        workTime: 0,
        restTime: 0,
        pairRestTime: 0,
        pairs: 0,
        rounds: 0
      });
    });

    test('should handle workout wtesth single round', () => {
      const singleRoundWorkout = {
        ...mockWorkout,
        rounds: 1
      };
      const breakdown = getWorkoutBreakdown(singleRoundWorkout);
      
      expect(breakdown).toEqual({
        totalDuration: 100, // 40 work + 0 rest + 60 pair rest
        workTime: 40, // 2 pairs * 1 round * 20s
        restTime: 0, // 2 pairs * 0 rest periods * 10s
        pairRestTime: 60, // 1 rest period * 60s
        pairs: 2,
        rounds: 1
      });
    });
  });

  describe('calculateRestTime', () => {
    test('should calculate correct rest time for standard workout', () => {
      const restTime = calculateRestTime(mockWorkout);
      // Rest within pairs: 2 pairs * (8-1) rounds * 10s = 140s
      // Rest between pairs: (2-1) pairs * 60s = 60s
      // Total: 140s + 60s = 200s
      expect(restTime).toBe(200);
    });

    test('should calculate correct rest time for single pair workout', () => {
      const singlePairWorkout = {
        ...mockWorkout,
        pairs: [mockWorkout.pairs[0]]
      };
      const restTime = calculateRestTime(singlePairWorkout);
      // Rest within pairs: 1 pair * (8-1) rounds * 10s = 70s
      // Rest between pairs: (1-1) pairs * 60s = 0s
      // Total: 70s + 0s = 70s
      expect(restTime).toBe(70);
    });

    test('should calculate correct rest time for single round workout', () => {
      const singleRoundWorkout = {
        ...mockWorkout,
        rounds: 1
      };
      const restTime = calculateRestTime(singleRoundWorkout);
      // Rest within pairs: 2 pairs * (1-1) rounds * 10s = 0s
      // Rest between pairs: (2-1) pairs * 60s = 60s
      // Total: 0s + 60s = 60s
      expect(restTime).toBe(60);
    });

    test('should handle workout with different rest between pairs', () => {
      const customRestWorkout = {
        ...mockWorkout,
        restBetweenPairs: 30
      };
      const restTime = calculateRestTime(customRestWorkout);
      // Rest within pairs: 2 pairs * (8-1) rounds * 10s = 140s
      // Rest between pairs: (2-1) pairs * 30s = 30s
      // Total: 140s + 30s = 170s
      expect(restTime).toBe(170);
    });

    test('should handle empty workout', () => {
      const emptyWorkout = {
        ...mockWorkout,
        pairs: []
      };
      expect(calculateRestTime(emptyWorkout)).toBe(0);
    });

    test('should handle null/undefined workout', () => {
      expect(calculateRestTime(null as any)).toBe(0);
      expect(calculateRestTime(undefined as any)).toBe(0);
    });

    test('should handle workout with multiple pairs', () => {
      const multiPairWorkout = {
        ...mockWorkout,
        pairs: [
          ...mockWorkout.pairs,
          { exerciseA: { name: 'Planks' }, exerciseB: { name: 'Mountain Climbers' } },
          { exerciseA: { name: 'Jumping Jacks' }, exerciseB: { name: 'High Knees' } }
        ]
      };
      const restTime = calculateRestTime(multiPairWorkout);
      // Rest within pairs: 4 pairs * (8-1) rounds * 10s = 280s
      // Rest between pairs: (4-1) pairs * 60s = 180s
      // Total: 280s + 180s = 460s
      expect(restTime).toBe(460);
    });
  });

  describe('formatRestTime', () => {
    test('should format seconds only for durations less than a minute', () => {
      expect(formatRestTime(30)).toBe('30s');
      expect(formatRestTime(45)).toBe('45s');
      expect(formatRestTime(59)).toBe('59s');
    });

    test('should format minutes and seconds correctly', () => {
      expect(formatRestTime(60)).toBe('1m');
      expect(formatRestTime(90)).toBe('1m 30s');
      expect(formatRestTime(125)).toBe('2m 5s');
      expect(formatRestTime(200)).toBe('3m 20s');
    });

    test('should format minutes only when no remaining seconds', () => {
      expect(formatRestTime(120)).toBe('2m');
      expect(formatRestTime(180)).toBe('3m');
      expect(formatRestTime(300)).toBe('5m');
    });

    test('should handle zero duration', () => {
      expect(formatRestTime(0)).toBe('0s');
    });

    test('should handle negative duration', () => {
      expect(formatRestTime(-10)).toBe('0s');
    });

    test('should handle large durations', () => {
      expect(formatRestTime(3600)).toBe('60m');
      expect(formatRestTime(3665)).toBe('61m 5s');
    });
  });
});