/**
 * Exercise Validation Utilities
 * Functions to validate exercise data integrity and completeness
 */

import { getAllExercises, getCachedExercises } from './exerciseParser.js';

/**
 * Required fields for a valid exercise
 */
const REQUIRED_FIELDS = [
  'name',
  'category',
  'muscleGroups',
  'description',
  'image',
  'instructions',
  'difficulty'
];

/**
 * Valid values for specific fields
 */
const VALID_VALUES = {
  category: ['upper body', 'lower body', 'core', 'full body', 'cardio'],
  difficulty: ['beginner', 'intermediate', 'advanced']
};

/**
 * Validates a single exercise object
 * @param {Object} exercise - Exercise object to validate
 * @returns {Object} Validation result with isValid and errors array
 */
export function validateExercise(exercise) {
  const errors = [];
  
  if (!exercise || typeof exercise !== 'object') {
    return {
      isValid: false,
      errors: ['Exercise must be a valid object']
    };
  }
  
  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!exercise[field]) {
      errors.push(`Missing required field: ${field}`);
    } else if (typeof exercise[field] === 'string' && exercise[field].trim() === '') {
      errors.push(`Field '${field}' cannot be empty`);
    }
  });
  
  // Validate specific field types and values
  if (exercise.name && typeof exercise.name !== 'string') {
    errors.push('Exercise name must be a string');
  }
  
  if (exercise.category && !VALID_VALUES.category.includes(exercise.category.toLowerCase())) {
    errors.push(`Invalid category: ${exercise.category}. Must be one of: ${VALID_VALUES.category.join(', ')}`);
  }
  
  if (exercise.difficulty && !VALID_VALUES.difficulty.includes(exercise.difficulty.toLowerCase())) {
    errors.push(`Invalid difficulty: ${exercise.difficulty}. Must be one of: ${VALID_VALUES.difficulty.join(', ')}`);
  }
  
  if (exercise.muscleGroups) {
    if (!Array.isArray(exercise.muscleGroups)) {
      errors.push('Muscle groups must be an array');
    } else if (exercise.muscleGroups.length === 0) {
      errors.push('At least one muscle group must be specified');
    }
  }
  
  if (exercise.image && typeof exercise.image !== 'string') {
    errors.push('Image path must be a string');
  }
  
  if (exercise.description && typeof exercise.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  if (exercise.instructions && typeof exercise.instructions !== 'string') {
    errors.push('Instructions must be a string');
  }
  
  // Validate image path format
  if (exercise.image && !exercise.image.startsWith('/images/exercises/')) {
    errors.push('Image path should start with /images/exercises/');
  }
  
  // Validate description length
  if (exercise.description && exercise.description.length < 20) {
    errors.push('Description should be at least 20 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    exercise
  };
}

/**
 * Validates all exercises in the database
 * @returns {Object} Validation results for all exercises
 */
export function validateAllExercises() {
  const allExercises = getAllExercises();
  const results = {
    totalExercises: allExercises.length,
    validExercises: 0,
    invalidExercises: 0,
    validationResults: [],
    summary: {
      missingFields: {},
      invalidValues: {},
      duplicateNames: []
    }
  };
  
  const exerciseNames = new Set();
  const duplicates = new Set();
  
  allExercises.forEach((exercise, index) => {
    const validation = validateExercise(exercise);
    results.validationResults.push({
      index,
      exerciseName: exercise.name || `Exercise ${index + 1}`,
      ...validation
    });
    
    if (validation.isValid) {
      results.validExercises++;
    } else {
      results.invalidExercises++;
      
      // Categorize errors
      validation.errors.forEach(error => {
        if (error.startsWith('Missing required field:')) {
          const field = error.replace('Missing required field: ', '');
          results.summary.missingFields[field] = (results.summary.missingFields[field] || 0) + 1;
        } else if (error.startsWith('Invalid')) {
          const category = error.split(':')[0];
          results.summary.invalidValues[category] = (results.summary.invalidValues[category] || 0) + 1;
        }
      });
    }
    
    // Check for duplicate names
    if (exercise.name) {
      if (exerciseNames.has(exercise.name.toLowerCase())) {
        duplicates.add(exercise.name);
      } else {
        exerciseNames.add(exercise.name.toLowerCase());
      }
    }
  });
  
  results.summary.duplicateNames = Array.from(duplicates);
  
  return results;
}

/**
 * Validates exercise distribution across categories
 * @returns {Object} Category distribution analysis
 */
export function validateCategoryDistribution() {
  const exercises = getCachedExercises();
  const distribution = {
    categories: {},
    recommendations: [],
    isBalanced: true
  };
  
  const totalExercises = getAllExercises().length;
  const idealPercentage = 20; // 20% per category for 5 categories
  const tolerance = 10; // Allow 10% variance
  
  Object.entries(exercises).forEach(([category, exerciseList]) => {
    const count = exerciseList.length;
    const percentage = (count / totalExercises) * 100;
    
    distribution.categories[category] = {
      count,
      percentage: Math.round(percentage * 10) / 10
    };
    
    if (percentage < idealPercentage - tolerance) {
      distribution.recommendations.push(`${category} category needs more exercises (${count} exercises, ${percentage.toFixed(1)}%)`);
      distribution.isBalanced = false;
    } else if (percentage > idealPercentage + tolerance) {
      distribution.recommendations.push(`${category} category has too many exercises (${count} exercises, ${percentage.toFixed(1)}%)`);
      distribution.isBalanced = false;
    }
  });
  
  return distribution;
}

/**
 * Validates difficulty distribution
 * @returns {Object} Difficulty distribution analysis
 */
export function validateDifficultyDistribution() {
  const allExercises = getAllExercises();
  const distribution = {
    difficulties: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    },
    percentages: {},
    recommendations: [],
    isBalanced: true
  };
  
  allExercises.forEach(exercise => {
    if (exercise.difficulty && distribution.difficulties[exercise.difficulty] !== undefined) {
      distribution.difficulties[exercise.difficulty]++;
    }
  });
  
  const total = allExercises.length;
  Object.entries(distribution.difficulties).forEach(([difficulty, count]) => {
    distribution.percentages[difficulty] = Math.round((count / total) * 100 * 10) / 10;
  });
  
  // Check for reasonable distribution (30% beginner, 50% intermediate, 20% advanced)
  const idealDistribution = { beginner: 30, intermediate: 50, advanced: 20 };
  const tolerance = 15;
  
  Object.entries(idealDistribution).forEach(([difficulty, idealPercentage]) => {
    const actualPercentage = distribution.percentages[difficulty];
    if (Math.abs(actualPercentage - idealPercentage) > tolerance) {
      distribution.recommendations.push(
        `${difficulty} exercises: ${actualPercentage}% (ideal: ${idealPercentage}%)`
      );
      distribution.isBalanced = false;
    }
  });
  
  return distribution;
}

/**
 * Gets a comprehensive validation report
 * @returns {Object} Complete validation report
 */
export function getValidationReport() {
  const exerciseValidation = validateAllExercises();
  const categoryDistribution = validateCategoryDistribution();
  const difficultyDistribution = validateDifficultyDistribution();
  
  return {
    timestamp: new Date().toISOString(),
    exerciseValidation,
    categoryDistribution,
    difficultyDistribution,
    overallHealth: {
      isHealthy: exerciseValidation.invalidExercises === 0 && 
                  categoryDistribution.isBalanced && 
                  difficultyDistribution.isBalanced,
      totalIssues: exerciseValidation.invalidExercises + 
                   categoryDistribution.recommendations.length + 
                   difficultyDistribution.recommendations.length
    }
  };
}

/**
 * Formats validation report for console output
 * @param {Object} report - Validation report
 * @returns {string} Formatted report string
 */
export function formatValidationReport(report) {
  let output = '\n=== EXERCISE DATABASE VALIDATION REPORT ===\n\n';
  
  // Exercise validation summary
  output += `📊 EXERCISE VALIDATION:\n`;
  output += `   Total Exercises: ${report.exerciseValidation.totalExercises}\n`;
  output += `   Valid: ${report.exerciseValidation.validExercises}\n`;
  output += `   Invalid: ${report.exerciseValidation.invalidExercises}\n\n`;
  
  if (report.exerciseValidation.invalidExercises > 0) {
    output += `⚠️  VALIDATION ERRORS:\n`;
    report.exerciseValidation.validationResults
      .filter(result => !result.isValid)
      .forEach(result => {
        output += `   • ${result.exerciseName}:\n`;
        result.errors.forEach(error => {
          output += `     - ${error}\n`;
        });
      });
    output += '\n';
  }
  
  // Category distribution
  output += `📈 CATEGORY DISTRIBUTION:\n`;
  Object.entries(report.categoryDistribution.categories).forEach(([category, data]) => {
    output += `   ${category}: ${data.count} exercises (${data.percentage}%)\n`;
  });
  
  if (!report.categoryDistribution.isBalanced) {
    output += `\n⚠️  CATEGORY RECOMMENDATIONS:\n`;
    report.categoryDistribution.recommendations.forEach(rec => {
      output += `   • ${rec}\n`;
    });
  }
  
  // Difficulty distribution
  output += `\n🎯 DIFFICULTY DISTRIBUTION:\n`;
  Object.entries(report.difficultyDistribution.percentages).forEach(([difficulty, percentage]) => {
    output += `   ${difficulty}: ${report.difficultyDistribution.difficulties[difficulty]} exercises (${percentage}%)\n`;
  });
  
  if (!report.difficultyDistribution.isBalanced) {
    output += `\n⚠️  DIFFICULTY RECOMMENDATIONS:\n`;
    report.difficultyDistribution.recommendations.forEach(rec => {
      output += `   • ${rec}\n`;
    });
  }
  
  // Overall health
  output += `\n🏥 OVERALL HEALTH: ${report.overallHealth.isHealthy ? '✅ HEALTHY' : '❌ NEEDS ATTENTION'}\n`;
  output += `   Total Issues: ${report.overallHealth.totalIssues}\n`;
  
  return output;
}

export default {
  validateExercise,
  validateAllExercises,
  validateCategoryDistribution,
  validateDifficultyDistribution,
  getValidationReport,
  formatValidationReport
};