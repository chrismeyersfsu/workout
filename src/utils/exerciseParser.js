/**
 * Exercise Data Parser
 * Converts markdown exercise database to JavaScript objects
 */

import exerciseMarkdown from '../data/exercises.md?raw';

/**
 * Parses a single exercise section from markdown text
 * @param {string} exerciseText - Raw markdown text for one exercise
 * @returns {Object} Parsed exercise object
 */
function parseExercise(exerciseText) {
  const lines = exerciseText.trim().split('\n');
  const exercise = {};
  
  // Extract exercise name from header (### Exercise Name)
  const nameMatch = lines[0].match(/^### (.+)$/);
  if (nameMatch) {
    exercise.name = nameMatch[1];
  }
  
  // Parse each field
  lines.slice(1).forEach(line => {
    const fieldMatch = line.match(/^- \*\*(.+?)\*\*: (.+)$/);
    if (fieldMatch) {
      const [, fieldName, fieldValue] = fieldMatch;
      
      switch (fieldName.toLowerCase()) {
        case 'name':
          exercise.name = fieldValue;
          break;
        case 'category':
          exercise.category = fieldValue;
          break;
        case 'muscle groups':
          exercise.muscleGroups = fieldValue.split(', ').map(group => group.trim());
          break;
        case 'description':
          exercise.description = fieldValue;
          break;
        case 'image':
          exercise.image = fieldValue;
          break;
        case 'instructions':
          exercise.instructions = fieldValue;
          break;
        case 'difficulty':
          exercise.difficulty = fieldValue.toLowerCase();
          break;
        case 'equipment':
          exercise.equipment = fieldValue === 'None' ? null : fieldValue;
          break;
      }
    }
  });
  
  return exercise;
}

/**
 * Parses the complete exercise markdown database
 * @returns {Object} Object with exercises organized by category
 */
export function parseExerciseDatabase() {
  const exercises = {
    'upper body': [],
    'lower body': [],
    'core': [],
    'full body': [],
    'cardio': []
  };
  
  // Split into sections by ## headers
  const sections = exerciseMarkdown.split(/^## /m).slice(1);
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const categoryMatch = lines[0].match(/^(.+)$/);
    
    if (categoryMatch) {
      const category = categoryMatch[1].toLowerCase();
      
      // Split section into individual exercises by ### headers
      const exerciseTexts = section.split(/^### /m).slice(1);
      
      exerciseTexts.forEach(exerciseText => {
        const exercise = parseExercise('### ' + exerciseText);
        if (exercise.name && exercises[category]) {
          exercises[category].push(exercise);
        }
      });
    }
  });
  
  return exercises;
}

/**
 * Gets all exercises as a flat array
 * @returns {Array} Array of all exercise objects
 */
export function getAllExercises() {
  const exercisesByCategory = parseExerciseDatabase();
  const allExercises = [];
  
  Object.values(exercisesByCategory).forEach(categoryExercises => {
    allExercises.push(...categoryExercises);
  });
  
  return allExercises;
}

/**
 * Gets exercises by category
 * @param {string} category - Category name (case insensitive)
 * @returns {Array} Array of exercises in the specified category
 */
export function getExercisesByCategory(category) {
  const exercisesByCategory = parseExerciseDatabase();
  return exercisesByCategory[category.toLowerCase()] || [];
}

/**
 * Gets exercises by difficulty level
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 * @returns {Array} Array of exercises with specified difficulty
 */
export function getExercisesByDifficulty(difficulty) {
  const allExercises = getAllExercises();
  return allExercises.filter(exercise => 
    exercise.difficulty === difficulty.toLowerCase()
  );
}

/**
 * Gets exercises that require no equipment
 * @returns {Array} Array of bodyweight exercises
 */
export function getBodyweightExercises() {
  const allExercises = getAllExercises();
  return allExercises.filter(exercise => exercise.equipment === null);
}

/**
 * Searches exercises by name or muscle groups
 * @param {string} searchTerm - Term to search for
 * @returns {Array} Array of matching exercises
 */
export function searchExercises(searchTerm) {
  const allExercises = getAllExercises();
  const term = searchTerm.toLowerCase();
  
  return allExercises.filter(exercise => 
    exercise.name.toLowerCase().includes(term) ||
    exercise.muscleGroups.some(group => group.toLowerCase().includes(term)) ||
    exercise.description.toLowerCase().includes(term)
  );
}

// Initialize and cache the parsed exercises
let cachedExercises = null;

/**
 * Gets cached exercises or parses them if not cached
 * @returns {Object} Cached exercise database
 */
export function getCachedExercises() {
  if (!cachedExercises) {
    cachedExercises = parseExerciseDatabase();
  }
  return cachedExercises;
}

export default {
  parseExerciseDatabase,
  getAllExercises,
  getExercisesByCategory,
  getExercisesByDifficulty,
  getBodyweightExercises,
  searchExercises,
  getCachedExercises
};