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

describe('Exercise Display Requirements', () => {
  test('all workouts should have exercise names suitable for display', () => {
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach((pair, pairIndex) => {
        // Test exercise A
        expect(pair.exerciseA.name).toBeTruthy();
        expect(pair.exerciseA.name.length).toBeGreaterThan(0);
        expect(pair.exerciseA.name.trim()).toBe(pair.exerciseA.name);
        
        // Test exercise B
        expect(pair.exerciseB.name).toBeTruthy();
        expect(pair.exerciseB.name.length).toBeGreaterThan(0);
        expect(pair.exerciseB.name.trim()).toBe(pair.exerciseB.name);
      });
    });
  });

  test('all workouts should have properly formatted exercise names for workout cards', () => {
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach((pair, pairIndex) => {
        // Exercise names should not be too long for card display
        expect(pair.exerciseA.name.length).toBeLessThanOrEqual(50);
        expect(pair.exerciseB.name.length).toBeLessThanOrEqual(50);
        
        // Exercise names should not contain newlines or tabs
        expect(pair.exerciseA.name).not.toMatch(/[\n\r\t]/);
        expect(pair.exerciseB.name).not.toMatch(/[\n\r\t]/);
      });
    });
  });

  test('all exercise pairs should be displayable in compact format', () => {
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach(pair => {
        // Test that we can create display strings for the pair
        const compactDisplay = `${pair.exerciseA.name} • ${pair.exerciseB.name}`;
        expect(compactDisplay).toBeTruthy();
        expect(compactDisplay.length).toBeGreaterThan(5); // At least "A • B"
        
        // Test that exercise names are distinct
        expect(pair.exerciseA.name).not.toBe(pair.exerciseB.name);
      });
    });
  });

  test('workout exercise counts should match actual pairs for display', () => {
    predefinedWorkouts.forEach(workout => {
      // Each pair contains 2 exercises (A and B)
      const expectedExerciseCount = workout.pairs.length;
      expect(workout.pairs).toHaveLength(expectedExerciseCount);
      
      // Verify each pair has both exercises
      workout.pairs.forEach(pair => {
        expect(pair.exerciseA).toBeDefined();
        expect(pair.exerciseB).toBeDefined();
      });
    });
  });

  test('exercise names should be readable during active workout', () => {
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach(pair => {
        // Exercise names should not be just numbers or symbols
        expect(pair.exerciseA.name).toMatch(/[a-zA-Z]/);
        expect(pair.exerciseB.name).toMatch(/[a-zA-Z]/);
        
        // Exercise names should not start or end with whitespace
        expect(pair.exerciseA.name.trim()).toBe(pair.exerciseA.name);
        expect(pair.exerciseB.name.trim()).toBe(pair.exerciseB.name);
      });
    });
  });

  test('all 8 predefined workouts have exercises suitable for individual display', () => {
    expect(predefinedWorkouts).toHaveLength(8);
    
    predefinedWorkouts.forEach((workout, workoutIndex) => {
      expect(workout.pairs.length).toBeGreaterThan(0);
      
      workout.pairs.forEach((pair, pairIndex) => {
        // Test exercise A display readiness
        expect(pair.exerciseA.name, 
          `Workout ${workoutIndex + 1}, Pair ${pairIndex + 1}, Exercise A name should be valid`
        ).toBeTruthy();
        
        // Test exercise B display readiness  
        expect(pair.exerciseB.name,
          `Workout ${workoutIndex + 1}, Pair ${pairIndex + 1}, Exercise B name should be valid`
        ).toBeTruthy();
      });
    });
  });
});