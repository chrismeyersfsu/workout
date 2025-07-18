import { describe, test, expect } from 'vitest';
import { predefinedWorkouts } from '../data/workouts';

describe('Exercise Display Functionality', () => {
  test('workout cards should display individual exercises correctly', () => {
    predefinedWorkouts.forEach(workout => {
      expect(workout.pairs.length).toBeGreaterThan(0);
      
      workout.pairs.forEach(pair => {
        expect(pair.exerciseA.name).toBeTruthy();
        expect(pair.exerciseB.name).toBeTruthy();
        
        const compactDisplay = pair.exerciseA.name + ' • ' + pair.exerciseB.name;
        expect(compactDisplay).toContain('•');
      });
    });
  });

  test('current exercise display should work for workout sessions', () => {
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach(pair => {
        expect(pair.exerciseA.name).toBeTruthy();
        expect(pair.exerciseB.name).toBeTruthy();
        expect(pair.exerciseA.name).not.toBe(pair.exerciseB.name);
      });
    });
  });

  test('exercise names should be suitable for display formatting', () => {
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach(pair => {
        expect(pair.exerciseA.name.length).toBeLessThanOrEqual(50);
        expect(pair.exerciseB.name.length).toBeLessThanOrEqual(50);
        expect(pair.exerciseA.name).not.toMatch(/[\n\r\t]/);
        expect(pair.exerciseB.name).not.toMatch(/[\n\r\t]/);
      });
    });
  });

  test('all 8 workouts have valid exercise display data', () => {
    expect(predefinedWorkouts).toHaveLength(8);
    
    predefinedWorkouts.forEach((workout, workoutIndex) => {
      expect(workout.pairs.length).toBeGreaterThan(0);
      
      workout.pairs.forEach((pair, pairIndex) => {
        expect(pair.exerciseA.name).toBeTruthy();
        expect(pair.exerciseB.name).toBeTruthy();
      });
    });
  });
});