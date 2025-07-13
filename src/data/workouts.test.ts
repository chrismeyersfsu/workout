import { predefinedWorkouts, validateWorkout, validateWorkoutPair, validateExercise } from './workouts';
import { TabataWorkout, WorkoutPair, Exercise } from '../types/workout';

describe('Predefined Workouts', () => {
  test('should have exactly 8 predefined workouts', () => {
    expect(predefinedWorkouts).toHaveLength(8);
  });

  test('all predefined workouts should be valid', () => {
    predefinedWorkouts.forEach(workout => {
      expect(validateWorkout(workout)).toBe(true);
    });
  });

  test('all workouts should have unique IDs', () => {
    const ids = predefinedWorkouts.map(w => w.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all workouts should have names and non-empty pairs', () => {
    predefinedWorkouts.forEach(workout => {
      expect(workout.name).toBeTruthy();
      expect(workout.pairs.length).toBeGreaterThan(0);
      expect(workout.rounds).toBeGreaterThan(0);
      expect(workout.restBetweenPairs).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('validateWorkout', () => {
  const validWorkout: TabataWorkout = {
    id: 'test-workout',
    name: 'Test Workout',
    rounds: 8,
    restBetweenPairs: 30,
    pairs: [
      {
        exerciseA: { name: 'Exercise A' },
        exerciseB: { name: 'Exercise B' }
      }
    ]
  };

  test('should return true for valid workout', () => {
    expect(validateWorkout(validWorkout)).toBe(true);
  });

  test('should return false for workout without ID', () => {
    const invalidWorkout = { ...validWorkout, id: '' };
    expect(validateWorkout(invalidWorkout)).toBe(false);
  });

  test('should return false for workout without name', () => {
    const invalidWorkout = { ...validWorkout, name: '' };
    expect(validateWorkout(invalidWorkout)).toBe(false);
  });

  test('should return false for workout with no pairs', () => {
    const invalidWorkout = { ...validWorkout, pairs: [] };
    expect(validateWorkout(invalidWorkout)).toBe(false);
  });

  test('should return false for workout with invalid rounds', () => {
    const invalidWorkout = { ...validWorkout, rounds: 0 };
    expect(validateWorkout(invalidWorkout)).toBe(false);
  });

  test('should return false for workout with negative rest time', () => {
    const invalidWorkout = { ...validWorkout, restBetweenPairs: -1 };
    expect(validateWorkout(invalidWorkout)).toBe(false);
  });

  test('should return false for workout with invalid exercise pair', () => {
    const invalidWorkout = {
      ...validWorkout,
      pairs: [{ exerciseA: { name: '' }, exerciseB: { name: 'Exercise B' } }]
    };
    expect(validateWorkout(invalidWorkout)).toBe(false);
  });
});

describe('validateWorkoutPair', () => {
  test('should return true for valid workout pair', () => {
    const validPair: WorkoutPair = {
      exerciseA: { name: 'Exercise A' },
      exerciseB: { name: 'Exercise B' }
    };
    expect(validateWorkoutPair(validPair)).toBe(true);
  });

  test('should return false for pair with missing exercise A name', () => {
    const invalidPair: WorkoutPair = {
      exerciseA: { name: '' },
      exerciseB: { name: 'Exercise B' }
    };
    expect(validateWorkoutPair(invalidPair)).toBe(false);
  });

  test('should return false for pair with missing exercise B name', () => {
    const invalidPair: WorkoutPair = {
      exerciseA: { name: 'Exercise A' },
      exerciseB: { name: '' }
    };
    expect(validateWorkoutPair(invalidPair)).toBe(false);
  });

  test('should return false for pair with both exercises missing names', () => {
    const invalidPair: WorkoutPair = {
      exerciseA: { name: '' },
      exerciseB: { name: '' }
    };
    expect(validateWorkoutPair(invalidPair)).toBe(false);
  });
});

describe('validateExercise', () => {
  test('should return true for valid exercise', () => {
    const validExercise: Exercise = { name: 'Valid Exercise' };
    expect(validateExercise(validExercise)).toBe(true);
  });

  test('should return false for exercise with empty name', () => {
    const invalidExercise: Exercise = { name: '' };
    expect(validateExercise(invalidExercise)).toBe(false);
  });

  test('should return false for exercise with whitespace-only name', () => {
    const invalidExercise: Exercise = { name: '   ' };
    expect(validateExercise(invalidExercise)).toBe(false);
  });

  test('should return true for exercise with description', () => {
    const validExercise: Exercise = { 
      name: 'Valid Exercise',
      description: 'A great exercise for fitness'
    };
    expect(validateExercise(validExercise)).toBe(true);
  });
});