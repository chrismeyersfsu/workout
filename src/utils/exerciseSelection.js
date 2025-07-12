/**
 * Exercise Selection Utilities
 * Functions for filtering, selecting, and randomizing exercises
 */

import { 
  getCachedExercises, 
  getAllExercises, 
  getExercisesByCategory,
  getExercisesByDifficulty 
} from './exerciseParser.js';

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Selects random exercises from a given array
 * @param {Array} exercises - Array of exercises to select from
 * @param {number} count - Number of exercises to select
 * @param {boolean} allowDuplicates - Whether to allow duplicate exercises
 * @returns {Array} Array of selected exercises
 */
export function selectRandomExercises(exercises, count, allowDuplicates = false) {
  if (!exercises || exercises.length === 0) {
    return [];
  }
  
  if (allowDuplicates) {
    const selected = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * exercises.length);
      selected.push(exercises[randomIndex]);
    }
    return selected;
  } else {
    const shuffled = shuffleArray(exercises);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}

/**
 * Selects random exercises from specific categories
 * @param {Object} categoryCount - Object with category names as keys and counts as values
 * @param {string} difficulty - Optional difficulty filter
 * @returns {Array} Array of selected exercises
 */
export function selectExercisesByCategory(categoryCount, difficulty = null) {
  const selectedExercises = [];
  
  Object.entries(categoryCount).forEach(([category, count]) => {
    let categoryExercises = getExercisesByCategory(category);
    
    if (difficulty) {
      categoryExercises = categoryExercises.filter(ex => ex.difficulty === difficulty.toLowerCase());
    }
    
    const selected = selectRandomExercises(categoryExercises, count);
    selectedExercises.push(...selected);
  });
  
  return shuffleArray(selectedExercises);
}

/**
 * Creates a balanced workout by selecting exercises from all categories
 * @param {number} totalExercises - Total number of exercises needed
 * @param {string} difficulty - Difficulty level (optional)
 * @param {Object} categoryWeights - Optional weights for each category
 * @returns {Array} Balanced array of exercises
 */
export function createBalancedWorkout(totalExercises, difficulty = null, categoryWeights = null) {
  const defaultWeights = {
    'upper body': 0.25,
    'lower body': 0.25,
    'core': 0.20,
    'full body': 0.20,
    'cardio': 0.10
  };
  
  const weights = categoryWeights || defaultWeights;
  const categoryCount = {};
  
  // Calculate exercises per category based on weights
  Object.entries(weights).forEach(([category, weight]) => {
    categoryCount[category] = Math.round(totalExercises * weight);
  });
  
  // Adjust if total doesn't match due to rounding
  const currentTotal = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
  const difference = totalExercises - currentTotal;
  
  if (difference !== 0) {
    // Add or subtract from the largest category
    const largestCategory = Object.entries(categoryCount)
      .reduce((max, [cat, count]) => count > max[1] ? [cat, count] : max)[0];
    categoryCount[largestCategory] += difference;
  }
  
  return selectExercisesByCategory(categoryCount, difficulty);
}

/**
 * Filters exercises by multiple criteria
 * @param {Object} filters - Filter criteria object
 * @param {string} filters.category - Category to filter by
 * @param {string} filters.difficulty - Difficulty to filter by
 * @param {Array} filters.muscleGroups - Muscle groups to include
 * @param {boolean} filters.bodyweightOnly - Only bodyweight exercises
 * @param {string} filters.searchTerm - Search term for name/description
 * @returns {Array} Filtered exercises
 */
export function filterExercises(filters = {}) {
  let exercises = getAllExercises();
  
  if (filters.category) {
    exercises = exercises.filter(ex => ex.category.toLowerCase() === filters.category.toLowerCase());
  }
  
  if (filters.difficulty) {
    exercises = exercises.filter(ex => ex.difficulty === filters.difficulty.toLowerCase());
  }
  
  if (filters.muscleGroups && filters.muscleGroups.length > 0) {
    exercises = exercises.filter(ex => 
      filters.muscleGroups.some(group => 
        ex.muscleGroups.some(exGroup => 
          exGroup.toLowerCase().includes(group.toLowerCase())
        )
      )
    );
  }
  
  if (filters.bodyweightOnly) {
    exercises = exercises.filter(ex => ex.equipment === null);
  }
  
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    exercises = exercises.filter(ex => 
      ex.name.toLowerCase().includes(term) ||
      ex.description.toLowerCase().includes(term) ||
      ex.muscleGroups.some(group => group.toLowerCase().includes(term))
    );
  }
  
  return exercises;
}

/**
 * Generates a workout for specific time duration
 * @param {number} durationMinutes - Workout duration in minutes
 * @param {string} workoutType - 'tabata' or 'hiit'
 * @param {string} difficulty - Difficulty level
 * @returns {Object} Workout object with exercises and timing
 */
export function generateTimedWorkout(durationMinutes, workoutType = 'hiit', difficulty = null) {
  const timings = {
    tabata: { work: 20, rest: 10, rounds: 8 }, // 4 minutes per exercise
    hiit: { work: 45, rest: 15, rounds: 1 } // 1 minute per exercise
  };
  
  const timing = timings[workoutType.toLowerCase()] || timings.hiit;
  const exerciseTimeMinutes = workoutType === 'tabata' ? 4 : 1;
  const exercisesNeeded = Math.floor(durationMinutes / exerciseTimeMinutes);
  
  const exercises = createBalancedWorkout(exercisesNeeded, difficulty);
  
  return {
    exercises,
    workoutType,
    duration: durationMinutes,
    timing,
    totalExercises: exercises.length
  };
}

/**
 * Ensures no consecutive exercises work the same primary muscle group
 * @param {Array} exercises - Array of exercises to optimize
 * @returns {Array} Reordered exercises
 */
export function optimizeExerciseOrder(exercises) {
  if (exercises.length <= 2) return exercises;
  
  const optimized = [exercises[0]];
  const remaining = exercises.slice(1);
  
  for (let i = 0; i < remaining.length; i++) {
    const lastExercise = optimized[optimized.length - 1];
    const lastPrimaryMuscle = lastExercise.muscleGroups[0];
    
    // Find exercise that doesn't work the same primary muscle
    const nextExerciseIndex = remaining.findIndex(ex => 
      ex.muscleGroups[0] !== lastPrimaryMuscle
    );
    
    if (nextExerciseIndex !== -1) {
      optimized.push(remaining[nextExerciseIndex]);
      remaining.splice(nextExerciseIndex, 1);
    } else {
      // If no different muscle group available, take the first remaining
      optimized.push(remaining[0]);
      remaining.splice(0, 1);
    }
  }
  
  return optimized;
}

/**
 * Gets exercise statistics
 * @returns {Object} Statistics about the exercise database
 */
export function getExerciseStats() {
  const exercises = getCachedExercises();
  const allExercises = getAllExercises();
  
  const stats = {
    totalExercises: allExercises.length,
    byCategory: {},
    byDifficulty: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    },
    bodyweightCount: 0,
    equipmentCount: 0
  };
  
  // Count by category
  Object.entries(exercises).forEach(([category, exerciseList]) => {
    stats.byCategory[category] = exerciseList.length;
  });
  
  // Count by difficulty and equipment
  allExercises.forEach(exercise => {
    stats.byDifficulty[exercise.difficulty]++;
    if (exercise.equipment === null) {
      stats.bodyweightCount++;
    } else {
      stats.equipmentCount++;
    }
  });
  
  return stats;
}

export default {
  selectRandomExercises,
  selectExercisesByCategory,
  createBalancedWorkout,
  filterExercises,
  generateTimedWorkout,
  optimizeExerciseOrder,
  getExerciseStats
};