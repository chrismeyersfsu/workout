// Workout creation, selection, and generation logic for HIIT Workout App

class Workouts {
    constructor() {
        this.preBuiltWorkouts = this.initializePreBuiltWorkouts();
        this.workoutTemplates = this.initializeWorkoutTemplates();
        
        this.initializeWorkouts();
    }

    initializeWorkouts() {
        // Initialize workout functionality
        console.log('Workouts module initialized');
    }

    initializePreBuiltWorkouts() {
        return {
            beginner: {
                10: {
                    name: "Beginner Blast",
                    duration: 10,
                    workInterval: 20,
                    restInterval: 10,
                    exercises: ['jumping-jacks', 'squats', 'push-ups', 'plank', 'high-knees', 'lunges']
                },
                15: {
                    name: "Starter Circuit",
                    duration: 15,
                    workInterval: 20,
                    restInterval: 10,
                    exercises: ['jumping-jacks', 'squats', 'push-ups', 'plank', 'high-knees', 'lunges', 'tricep-dips', 'mountain-climbers', 'calf-raises']
                },
                20: {
                    name: "Foundation Flow",
                    duration: 20,
                    workInterval: 20,
                    restInterval: 10,
                    exercises: ['jumping-jacks', 'squats', 'push-ups', 'plank', 'high-knees', 'lunges', 'tricep-dips', 'mountain-climbers', 'bicycle-crunches', 'butt-kicks', 'arm-circles', 'dead-bug']
                },
                30: {
                    name: "Complete Beginner",
                    duration: 30,
                    workInterval: 20,
                    restInterval: 10,
                    exercises: ['jumping-jacks', 'squats', 'push-ups', 'plank', 'high-knees', 'lunges', 'tricep-dips', 'mountain-climbers', 'bicycle-crunches', 'butt-kicks', 'arm-circles', 'dead-bug', 'reverse-lunges', 'side-plank', 'star-jumps', 'calf-raises', 'russian-twists', 'wall-sit']
                }
            },
            intermediate: {
                10: {
                    name: "Power Surge",
                    duration: 10,
                    workInterval: 30,
                    restInterval: 15,
                    exercises: ['burpees', 'jump-squats', 'diamond-push-ups', 'mountain-climbers', 'cross-country-skiers', 'single-leg-glute-bridge']
                },
                15: {
                    name: "Intensity Build",
                    duration: 15,
                    workInterval: 30,
                    restInterval: 15,
                    exercises: ['burpees', 'jump-squats', 'diamond-push-ups', 'mountain-climbers', 'cross-country-skiers', 'single-leg-glute-bridge', 'pike-push-ups', 'side-plank', 'leg-raises']
                },
                20: {
                    name: "Athletic Challenge",
                    duration: 20,
                    workInterval: 30,
                    restInterval: 15,
                    exercises: ['burpees', 'jump-squats', 'diamond-push-ups', 'mountain-climbers', 'cross-country-skiers', 'single-leg-glute-bridge', 'pike-push-ups', 'side-plank', 'leg-raises', 'inchworms', 'bear-crawl', 'russian-twists']
                },
                30: {
                    name: "Intermediate Warrior",
                    duration: 30,
                    workInterval: 30,
                    restInterval: 15,
                    exercises: ['burpees', 'jump-squats', 'diamond-push-ups', 'mountain-climbers', 'cross-country-skiers', 'single-leg-glute-bridge', 'pike-push-ups', 'side-plank', 'leg-raises', 'inchworms', 'bear-crawl', 'russian-twists', 'sprawls', 'wall-sit', 'yoga-flow', 'reverse-lunges', 'bicycle-crunches', 'star-jumps']
                }
            },
            advanced: {
                10: {
                    name: "Elite Rush",
                    duration: 10,
                    workInterval: 45,
                    restInterval: 15,
                    exercises: ['burpees', 'handstand-hold', 'turkish-get-up', 'commando-crawl', 'mountain-climbers']
                },
                15: {
                    name: "Beast Mode",
                    duration: 15,
                    workInterval: 45,
                    restInterval: 15,
                    exercises: ['burpees', 'handstand-hold', 'turkish-get-up', 'commando-crawl', 'mountain-climbers', 'single-leg-glute-bridge', 'pike-push-ups', 'bear-crawl']
                },
                20: {
                    name: "Ultimate Test",
                    duration: 20,
                    workInterval: 45,
                    restInterval: 15,
                    exercises: ['burpees', 'handstand-hold', 'turkish-get-up', 'commando-crawl', 'mountain-climbers', 'single-leg-glute-bridge', 'pike-push-ups', 'bear-crawl', 'diamond-push-ups', 'side-plank', 'leg-raises']
                },
                30: {
                    name: "Advanced Destroyer",
                    duration: 30,
                    workInterval: 45,
                    restInterval: 15,
                    exercises: ['burpees', 'handstand-hold', 'turkish-get-up', 'commando-crawl', 'mountain-climbers', 'single-leg-glute-bridge', 'pike-push-ups', 'bear-crawl', 'diamond-push-ups', 'side-plank', 'leg-raises', 'inchworms', 'sprawls', 'cross-country-skiers', 'jump-squats']
                }
            }
        };
    }

    initializeWorkoutTemplates() {
        return {
            tabata: {
                workInterval: 20,
                restInterval: 10,
                description: "Classic Tabata: 20 seconds work, 10 seconds rest"
            },
            intermediate: {
                workInterval: 30,
                restInterval: 15,
                description: "Intermediate: 30 seconds work, 15 seconds rest"
            },
            advanced: {
                workInterval: 45,
                restInterval: 15,
                description: "Advanced: 45 seconds work, 15 seconds rest"
            },
            endurance: {
                workInterval: 60,
                restInterval: 20,
                description: "Endurance: 60 seconds work, 20 seconds rest"
            }
        };
    }

    generateQuickWorkout(duration, difficulty = 'beginner') {
        // Validate inputs
        if (!Utils.validateDuration(duration)) {
            console.error('Invalid duration provided');
            return null;
        }

        // Get appropriate pre-built workout
        const preBuilt = this.preBuiltWorkouts[difficulty]?.[duration];
        if (preBuilt) {
            return this.createWorkoutFromTemplate(preBuilt);
        }

        // Fallback: generate balanced workout
        return this.generateBalancedWorkout(duration, difficulty);
    }

    createWorkoutFromTemplate(template) {
        if (!window.Exercises) {
            console.error('Exercises module not available');
            return null;
        }

        // Convert exercise IDs to exercise objects
        const exercises = template.exercises
            .map(id => window.Exercises.getExerciseById(id))
            .filter(Boolean);

        if (exercises.length === 0) {
            console.error('No valid exercises found for template');
            return null;
        }

        return {
            id: Utils.generateId(),
            name: template.name,
            duration: template.duration,
            workInterval: template.workInterval,
            restInterval: template.restInterval,
            exercises: exercises,
            type: 'quick-start',
            created: new Date()
        };
    }

    generateBalancedWorkout(duration, difficulty = 'beginner') {
        if (!window.Exercises) {
            console.error('Exercises module not available');
            return null;
        }

        // Calculate number of exercises needed
        const template = this.getTemplateForDifficulty(difficulty);
        const totalInterval = template.workInterval + template.restInterval;
        const totalSeconds = duration * 60;
        const exerciseCount = Math.floor(totalSeconds / totalInterval);

        // Get balanced exercises
        const exercises = window.Exercises.getBalancedWorkout(exerciseCount);

        return {
            id: Utils.generateId(),
            name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${duration}min`,
            duration: duration,
            workInterval: template.workInterval,
            restInterval: template.restInterval,
            exercises: exercises,
            type: 'balanced',
            created: new Date()
        };
    }

    getTemplateForDifficulty(difficulty) {
        switch (difficulty) {
            case 'beginner':
                return this.workoutTemplates.tabata;
            case 'intermediate':
                return this.workoutTemplates.intermediate;
            case 'advanced':
                return this.workoutTemplates.advanced;
            default:
                return this.workoutTemplates.tabata;
        }
    }

    createCustomWorkout(selectedExercises, duration, options = {}) {
        if (!selectedExercises || selectedExercises.length === 0) {
            console.error('No exercises provided for custom workout');
            return null;
        }

        if (!Utils.validateDuration(duration)) {
            console.error('Invalid duration provided');
            return null;
        }

        // Get template based on options or use default
        const template = options.template || this.workoutTemplates.tabata;
        const totalInterval = template.workInterval + template.restInterval;
        const totalSeconds = duration * 60;
        const targetExerciseCount = Math.floor(totalSeconds / totalInterval);

        let finalExercises = [...selectedExercises];

        // Adjust exercise list if needed
        if (selectedExercises.length < targetExerciseCount) {
            // Need more exercises - use intelligent generation
            finalExercises = this.expandExerciseSelection(selectedExercises, targetExerciseCount);
        } else if (selectedExercises.length > targetExerciseCount) {
            // Too many exercises - randomly select from provided
            finalExercises = Utils.getRandomItems(selectedExercises, targetExerciseCount);
        }

        return {
            id: Utils.generateId(),
            name: options.name || `Custom ${duration}min Workout`,
            duration: duration,
            workInterval: template.workInterval,
            restInterval: template.restInterval,
            exercises: finalExercises,
            type: 'custom',
            created: new Date()
        };
    }

    expandExerciseSelection(selectedExercises, targetCount) {
        if (!window.Exercises) {
            return selectedExercises;
        }

        const needed = targetCount - selectedExercises.length;
        const selectedIds = new Set(selectedExercises.map(ex => ex.id));

        // Get categories represented in selection
        const selectedCategories = [...new Set(selectedExercises.map(ex => ex.category))];
        
        // Get additional exercises from similar categories
        let additionalExercises = [];
        for (const category of selectedCategories) {
            const categoryExercises = window.Exercises.getExercisesByCategory(category)
                .filter(ex => !selectedIds.has(ex.id));
            additionalExercises.push(...categoryExercises);
        }

        // If still need more, get from all categories
        if (additionalExercises.length < needed) {
            const allExercises = window.Exercises.getAllExercises()
                .filter(ex => !selectedIds.has(ex.id));
            additionalExercises.push(...allExercises);
        }

        // Get random additional exercises
        const randomAdditional = Utils.getRandomItems(additionalExercises, needed);
        
        return [...selectedExercises, ...randomAdditional];
    }

    getPreBuiltWorkoutOptions(duration) {
        const options = [];
        
        Object.entries(this.preBuiltWorkouts).forEach(([difficulty, workouts]) => {
            if (workouts[duration]) {
                options.push({
                    difficulty,
                    ...workouts[duration],
                    id: `prebuilt-${difficulty}-${duration}`
                });
            }
        });

        return options;
    }

    calculateWorkoutStats(workout) {
        if (!workout || !workout.exercises) {
            return null;
        }

        const totalExercises = workout.exercises.length;
        const workTime = workout.workInterval || 20;
        const restTime = workout.restInterval || 10;
        const totalInterval = workTime + restTime;
        const estimatedTime = (totalExercises * totalInterval) / 60; // in minutes

        // Count exercises by category
        const categoryCount = {};
        workout.exercises.forEach(exercise => {
            categoryCount[exercise.category] = (categoryCount[exercise.category] || 0) + 1;
        });

        // Count exercises by difficulty
        const difficultyCount = {};
        workout.exercises.forEach(exercise => {
            difficultyCount[exercise.difficulty] = (difficultyCount[exercise.difficulty] || 0) + 1;
        });

        // Get muscle groups targeted
        const muscleGroups = new Set();
        workout.exercises.forEach(exercise => {
            exercise.muscleGroups.forEach(muscle => muscleGroups.add(muscle));
        });

        return {
            totalExercises,
            estimatedTime: Math.round(estimatedTime),
            workTime,
            restTime,
            categoryBreakdown: categoryCount,
            difficultyBreakdown: difficultyCount,
            muscleGroups: Array.from(muscleGroups),
            calorieEstimate: this.estimateCaloriesBurned(workout)
        };
    }

    estimateCaloriesBurned(workout) {
        // Simple estimation based on workout intensity and duration
        // This is a rough estimate - actual calories vary greatly by person
        const baseCaloriesPerMinute = 8; // HIIT average
        const intensityMultiplier = this.getIntensityMultiplier(workout);
        
        return Math.round(workout.duration * baseCaloriesPerMinute * intensityMultiplier);
    }

    getIntensityMultiplier(workout) {
        const workInterval = workout.workInterval || 20;
        
        // Higher work intervals = higher intensity
        if (workInterval >= 45) return 1.3;
        if (workInterval >= 30) return 1.1;
        return 1.0;
    }

    validateWorkout(workout) {
        const requiredFields = ['id', 'name', 'duration', 'exercises', 'workInterval', 'restInterval'];
        
        if (!workout || typeof workout !== 'object') {
            return { valid: false, error: 'Workout must be an object' };
        }

        for (const field of requiredFields) {
            if (!workout[field]) {
                return { valid: false, error: `Missing required field: ${field}` };
            }
        }

        if (!Utils.validateDuration(workout.duration)) {
            return { valid: false, error: 'Invalid workout duration' };
        }

        if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
            return { valid: false, error: 'Workout must have at least one exercise' };
        }

        // Validate each exercise
        for (const exercise of workout.exercises) {
            if (!exercise.id || !exercise.name || !exercise.category) {
                return { valid: false, error: 'Invalid exercise in workout' };
            }
        }

        return { valid: true };
    }

    cloneWorkout(workout) {
        return JSON.parse(JSON.stringify(workout));
    }

    modifyWorkout(workout, modifications) {
        const modified = this.cloneWorkout(workout);
        
        // Apply modifications
        Object.keys(modifications).forEach(key => {
            if (key === 'exercises' && Array.isArray(modifications[key])) {
                modified[key] = [...modifications[key]];
            } else {
                modified[key] = modifications[key];
            }
        });

        // Update metadata
        modified.modified = new Date();
        if (!modified.originalId) {
            modified.originalId = workout.id;
        }
        modified.id = Utils.generateId();

        // Validate modified workout
        const validation = this.validateWorkout(modified);
        if (!validation.valid) {
            console.error('Modified workout validation failed:', validation.error);
            return null;
        }

        return modified;
    }

    searchWorkouts(workouts, query) {
        if (!query) return workouts;
        
        const lowercaseQuery = query.toLowerCase();
        
        return workouts.filter(workout => {
            // Search in workout name
            if (workout.name.toLowerCase().includes(lowercaseQuery)) {
                return true;
            }
            
            // Search in exercise names
            return workout.exercises.some(exercise => 
                exercise.name.toLowerCase().includes(lowercaseQuery)
            );
        });
    }

    sortWorkouts(workouts, sortBy = 'created', order = 'desc') {
        const sorted = [...workouts];
        
        sorted.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'duration':
                    aValue = a.duration;
                    bValue = b.duration;
                    break;
                case 'created':
                default:
                    aValue = new Date(a.created || 0);
                    bValue = new Date(b.created || 0);
                    break;
            }
            
            if (order === 'desc') {
                return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
            } else {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
        });
        
        return sorted;
    }

    exportWorkout(workout) {
        return JSON.stringify(workout, null, 2);
    }

    importWorkout(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            const validation = this.validateWorkout(imported);
            
            if (!validation.valid) {
                console.error('Imported workout validation failed:', validation.error);
                return null;
            }
            
            // Ensure unique ID
            imported.id = Utils.generateId();
            imported.imported = new Date();
            
            return imported;
        } catch (error) {
            console.error('Failed to import workout:', error);
            return null;
        }
    }
}

// Make Workouts available globally
window.Workouts = new Workouts();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Workouts;
}