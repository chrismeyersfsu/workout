// Unit tests for workouts.js

require('../js/utils.js');
require('../js/exercises.js');
require('../js/workouts.js');

describe('Workouts', () => {
    let workouts;

    beforeEach(() => {
        // Set up DOM
        global.testUtils.mockDOM();
        
        workouts = new window.Workouts.constructor();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        test('initializes with pre-built workouts', () => {
            expect(workouts.preBuiltWorkouts).toBeDefined();
            expect(workouts.workoutTemplates).toBeDefined();
        });

        test('has workouts for all difficulty levels', () => {
            const difficulties = ['beginner', 'intermediate', 'advanced'];
            difficulties.forEach(difficulty => {
                expect(workouts.preBuiltWorkouts[difficulty]).toBeDefined();
            });
        });

        test('has workouts for all durations', () => {
            const durations = [10, 15, 20, 30];
            Object.values(workouts.preBuiltWorkouts).forEach(difficultyWorkouts => {
                durations.forEach(duration => {
                    expect(difficultyWorkouts[duration]).toBeDefined();
                });
            });
        });

        test('has workout templates with correct properties', () => {
            Object.values(workouts.workoutTemplates).forEach(template => {
                expect(template).toHaveProperty('workInterval');
                expect(template).toHaveProperty('restInterval');
                expect(template).toHaveProperty('description');
            });
        });
    });

    describe('generateQuickWorkout', () => {
        test('generates workout for valid duration and difficulty', () => {
            const workout = workouts.generateQuickWorkout(20, 'beginner');
            
            expect(workout).toBeDefined();
            expect(workout.duration).toBe(20);
            expect(workout.type).toBe('quick-start');
            expect(workout.exercises).toBeDefined();
            expect(workout.name).toBe('Foundation Flow');
        });

        test('returns null for invalid duration', () => {
            const workout = workouts.generateQuickWorkout(99, 'beginner');
            expect(workout).toBeNull();
        });

        test('falls back to balanced workout for missing template', () => {
            const workout = workouts.generateQuickWorkout(20, 'nonexistent');
            expect(workout).toBeDefined();
            expect(workout.type).toBe('balanced');
        });

        test('returns null when Exercises module unavailable', () => {
            const originalExercises = window.Exercises;
            window.Exercises = null;
            
            const workout = workouts.generateQuickWorkout(20, 'beginner');
            expect(workout).toBeNull();
            
            window.Exercises = originalExercises;
        });
    });

    describe('createWorkoutFromTemplate', () => {
        test('creates workout from valid template', () => {
            const template = {
                name: 'Test Workout',
                duration: 15,
                workInterval: 30,
                restInterval: 15,
                exercises: ['push-ups', 'squats']
            };
            
            const workout = workouts.createWorkoutFromTemplate(template);
            
            expect(workout).toBeDefined();
            expect(workout.name).toBe('Test Workout');
            expect(workout.duration).toBe(15);
            expect(workout.exercises).toHaveLength(2);
            expect(workout.id).toBeDefined();
            expect(workout.created).toBeInstanceOf(Date);
        });

        test('filters out invalid exercise IDs', () => {
            const template = {
                name: 'Test Workout',
                duration: 15,
                workInterval: 30,
                restInterval: 15,
                exercises: ['push-ups', 'invalid-exercise-id', 'squats']
            };
            
            const workout = workouts.createWorkoutFromTemplate(template);
            
            expect(workout).toBeDefined();
            expect(workout.exercises).toHaveLength(2);
        });

        test('returns null for template with no valid exercises', () => {
            const template = {
                name: 'Test Workout',
                duration: 15,
                workInterval: 30,
                restInterval: 15,
                exercises: ['invalid-1', 'invalid-2']
            };
            
            const workout = workouts.createWorkoutFromTemplate(template);
            expect(workout).toBeNull();
        });
    });

    describe('generateBalancedWorkout', () => {
        test('generates balanced workout with correct duration', () => {
            const workout = workouts.generateBalancedWorkout(20, 'intermediate');
            
            expect(workout).toBeDefined();
            expect(workout.duration).toBe(20);
            expect(workout.type).toBe('balanced');
            expect(workout.exercises.length).toBeGreaterThan(0);
        });

        test('uses appropriate template for difficulty', () => {
            const beginnerWorkout = workouts.generateBalancedWorkout(20, 'beginner');
            const advancedWorkout = workouts.generateBalancedWorkout(20, 'advanced');
            
            expect(beginnerWorkout.workInterval).toBe(20);
            expect(advancedWorkout.workInterval).toBe(45);
        });

        test('calculates exercise count based on duration', () => {
            const shortWorkout = workouts.generateBalancedWorkout(10, 'beginner');
            const longWorkout = workouts.generateBalancedWorkout(30, 'beginner');
            
            expect(longWorkout.exercises.length).toBeGreaterThan(shortWorkout.exercises.length);
        });
    });

    describe('createCustomWorkout', () => {
        test('creates custom workout from selected exercises', () => {
            const selectedExercises = [
                global.testUtils.createMockExercise(),
                global.testUtils.createMockExercise({ id: 'exercise-2', name: 'Exercise 2' })
            ];
            
            const workout = workouts.createCustomWorkout(selectedExercises, 10); // Use shorter duration
            
            expect(workout).toBeDefined();
            expect(workout.duration).toBe(10);
            expect(workout.type).toBe('custom');
            expect(workout.exercises.length).toBeGreaterThanOrEqual(2);
            expect(workout.name).toContain('Custom');
        });

        test('expands exercise selection when needed', () => {
            const selectedExercises = [global.testUtils.createMockExercise()];
            
            const workout = workouts.createCustomWorkout(selectedExercises, 20);
            
            expect(workout).toBeDefined();
            expect(workout.exercises.length).toBeGreaterThan(1);
        });

        test('trims exercise selection when too many', () => {
            const manyExercises = Array.from({ length: 50 }, (_, i) => 
                global.testUtils.createMockExercise({ id: `exercise-${i}`, name: `Exercise ${i}` })
            );
            
            const workout = workouts.createCustomWorkout(manyExercises, 10);
            
            expect(workout).toBeDefined();
            expect(workout.exercises.length).toBeLessThan(50);
        });

        test('returns null for invalid inputs', () => {
            expect(workouts.createCustomWorkout([], 20)).toBeNull();
            expect(workouts.createCustomWorkout(null, 20)).toBeNull();
            expect(workouts.createCustomWorkout([global.testUtils.createMockExercise()], 99)).toBeNull();
        });

        test('uses custom options when provided', () => {
            const selectedExercises = [global.testUtils.createMockExercise()];
            const options = {
                name: 'My Custom Workout',
                template: workouts.workoutTemplates.advanced
            };
            
            const workout = workouts.createCustomWorkout(selectedExercises, 15, options);
            
            expect(workout.name).toBe('My Custom Workout');
            expect(workout.workInterval).toBe(45);
        });
    });

    describe('expandExerciseSelection', () => {
        test('adds exercises from similar categories', () => {
            const selectedExercises = [
                global.testUtils.createMockExercise({ category: 'upper' })
            ];
            
            const expanded = workouts.expandExerciseSelection(selectedExercises, 5);
            
            expect(expanded.length).toBe(5);
            expect(expanded[0]).toEqual(selectedExercises[0]);
        });

        test('returns original when Exercises module unavailable', () => {
            const originalExercises = window.Exercises;
            window.Exercises = null;
            
            const selectedExercises = [global.testUtils.createMockExercise()];
            const expanded = workouts.expandExerciseSelection(selectedExercises, 5);
            
            expect(expanded).toEqual(selectedExercises);
            
            window.Exercises = originalExercises;
        });
    });

    describe('getTemplateForDifficulty', () => {
        test('returns correct template for each difficulty', () => {
            expect(workouts.getTemplateForDifficulty('beginner')).toEqual(workouts.workoutTemplates.tabata);
            expect(workouts.getTemplateForDifficulty('intermediate')).toEqual(workouts.workoutTemplates.intermediate);
            expect(workouts.getTemplateForDifficulty('advanced')).toEqual(workouts.workoutTemplates.advanced);
        });

        test('returns default template for unknown difficulty', () => {
            expect(workouts.getTemplateForDifficulty('unknown')).toEqual(workouts.workoutTemplates.tabata);
        });
    });

    describe('getPreBuiltWorkoutOptions', () => {
        test('returns options for valid duration', () => {
            const options = workouts.getPreBuiltWorkoutOptions(20);
            
            expect(options).toHaveLength(3); // beginner, intermediate, advanced
            options.forEach(option => {
                expect(option).toHaveProperty('difficulty');
                expect(option).toHaveProperty('name');
                expect(option).toHaveProperty('duration', 20);
                expect(option).toHaveProperty('id');
            });
        });

        test('returns empty array for invalid duration', () => {
            const options = workouts.getPreBuiltWorkoutOptions(99);
            expect(options).toHaveLength(0);
        });
    });

    describe('calculateWorkoutStats', () => {
        test('calculates stats for valid workout', () => {
            const workout = global.testUtils.createMockWorkout();
            const stats = workouts.calculateWorkoutStats(workout);
            
            expect(stats).toBeDefined();
            expect(stats).toHaveProperty('totalExercises');
            expect(stats).toHaveProperty('estimatedTime');
            expect(stats).toHaveProperty('workTime');
            expect(stats).toHaveProperty('restTime');
            expect(stats).toHaveProperty('categoryBreakdown');
            expect(stats).toHaveProperty('difficultyBreakdown');
            expect(stats).toHaveProperty('muscleGroups');
            expect(stats).toHaveProperty('calorieEstimate');
        });

        test('returns null for invalid workout', () => {
            expect(workouts.calculateWorkoutStats(null)).toBeNull();
            expect(workouts.calculateWorkoutStats({})).toBeNull();
        });

        test('calculates category breakdown correctly', () => {
            const workout = {
                exercises: [
                    global.testUtils.createMockExercise({ category: 'upper' }),
                    global.testUtils.createMockExercise({ category: 'upper' }),
                    global.testUtils.createMockExercise({ category: 'lower' })
                ],
                workInterval: 20,
                restInterval: 10
            };
            
            const stats = workouts.calculateWorkoutStats(workout);
            expect(stats.categoryBreakdown.upper).toBe(2);
            expect(stats.categoryBreakdown.lower).toBe(1);
        });
    });

    describe('estimateCaloriesBurned', () => {
        test('estimates calories based on duration and intensity', () => {
            const lowIntensity = { duration: 20, workInterval: 20 };
            const highIntensity = { duration: 20, workInterval: 45 };
            
            const lowCalories = workouts.estimateCaloriesBurned(lowIntensity);
            const highCalories = workouts.estimateCaloriesBurned(highIntensity);
            
            expect(highCalories).toBeGreaterThan(lowCalories);
            expect(typeof lowCalories).toBe('number');
            expect(typeof highCalories).toBe('number');
        });
    });

    describe('validateWorkout', () => {
        test('validates correct workout', () => {
            const workout = global.testUtils.createMockWorkout();
            const validation = workouts.validateWorkout(workout);
            
            expect(validation.valid).toBe(true);
        });

        test('rejects workout missing required fields', () => {
            const invalidWorkout = { name: 'Test' };
            const validation = workouts.validateWorkout(invalidWorkout);
            
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Missing required field');
        });

        test('rejects workout with invalid duration', () => {
            const workout = global.testUtils.createMockWorkout({ duration: 99 });
            const validation = workouts.validateWorkout(workout);
            
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Invalid workout duration');
        });

        test('rejects workout with no exercises', () => {
            const workout = global.testUtils.createMockWorkout({ exercises: [] });
            const validation = workouts.validateWorkout(workout);
            
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('at least one exercise');
        });

        test('rejects workout with invalid exercises', () => {
            const workout = global.testUtils.createMockWorkout({
                exercises: [{ invalidExercise: true }]
            });
            const validation = workouts.validateWorkout(workout);
            
            expect(validation.valid).toBe(false);
            expect(validation.error).toContain('Invalid exercise');
        });
    });

    describe('cloneWorkout', () => {
        test('creates deep copy of workout', () => {
            const original = global.testUtils.createMockWorkout();
            const cloned = workouts.cloneWorkout(original);
            
            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
            expect(cloned.exercises).not.toBe(original.exercises);
        });
    });

    describe('modifyWorkout', () => {
        test('modifies workout with new properties', () => {
            const original = global.testUtils.createMockWorkout();
            const modifications = { name: 'Modified Workout', duration: 20 }; // Use valid duration
            
            const modified = workouts.modifyWorkout(original, modifications);
            
            expect(modified).toBeDefined();
            expect(modified.name).toBe('Modified Workout');
            expect(modified.duration).toBe(20);
            expect(modified.id).not.toBe(original.id);
            expect(modified.originalId).toBe(original.id);
            expect(modified.modified).toBeInstanceOf(Date);
        });

        test('handles exercise modifications', () => {
            const original = global.testUtils.createMockWorkout();
            const newExercises = [global.testUtils.createMockExercise({ name: 'New Exercise' })];
            
            const modified = workouts.modifyWorkout(original, { exercises: newExercises });
            
            expect(modified.exercises).toHaveLength(1);
            expect(modified.exercises[0].name).toBe('New Exercise');
        });

        test('returns null for invalid modifications', () => {
            const original = global.testUtils.createMockWorkout();
            const invalidModifications = { exercises: [] }; // No exercises
            
            const modified = workouts.modifyWorkout(original, invalidModifications);
            expect(modified).toBeNull();
        });
    });

    describe('searchWorkouts', () => {
        test('searches workouts by name', () => {
            const workouts_list = [
                global.testUtils.createMockWorkout({ name: 'Upper Body Blast' }),
                global.testUtils.createMockWorkout({ name: 'Lower Body Power' }),
                global.testUtils.createMockWorkout({ name: 'Full Body Challenge' })
            ];
            
            const results = workouts.searchWorkouts(workouts_list, 'upper');
            expect(results).toHaveLength(1);
            expect(results[0].name).toBe('Upper Body Blast');
        });

        test('searches workouts by exercise name', () => {
            const workouts_list = [
                global.testUtils.createMockWorkout({
                    exercises: [global.testUtils.createMockExercise({ name: 'Push-ups' })]
                }),
                global.testUtils.createMockWorkout({
                    exercises: [global.testUtils.createMockExercise({ name: 'Squats' })]
                })
            ];
            
            const results = workouts.searchWorkouts(workouts_list, 'push');
            expect(results).toHaveLength(1);
        });

        test('returns all workouts for empty query', () => {
            const workouts_list = [
                global.testUtils.createMockWorkout(),
                global.testUtils.createMockWorkout()
            ];
            
            const results = workouts.searchWorkouts(workouts_list, '');
            expect(results).toEqual(workouts_list);
        });
    });

    describe('sortWorkouts', () => {
        test('sorts workouts by name', () => {
            const workouts_list = [
                global.testUtils.createMockWorkout({ name: 'Z Workout' }),
                global.testUtils.createMockWorkout({ name: 'A Workout' })
            ];
            
            const sorted = workouts.sortWorkouts(workouts_list, 'name', 'asc');
            expect(sorted[0].name).toBe('A Workout');
            expect(sorted[1].name).toBe('Z Workout');
        });

        test('sorts workouts by duration', () => {
            const workouts_list = [
                global.testUtils.createMockWorkout({ duration: 30 }),
                global.testUtils.createMockWorkout({ duration: 10 })
            ];
            
            const sorted = workouts.sortWorkouts(workouts_list, 'duration', 'asc');
            expect(sorted[0].duration).toBe(10);
            expect(sorted[1].duration).toBe(30);
        });

        test('sorts in descending order by default', () => {
            const workouts_list = [
                global.testUtils.createMockWorkout({ duration: 10 }),
                global.testUtils.createMockWorkout({ duration: 30 })
            ];
            
            const sorted = workouts.sortWorkouts(workouts_list, 'duration');
            expect(sorted[0].duration).toBe(30);
            expect(sorted[1].duration).toBe(10);
        });
    });

    describe('import/export', () => {
        test('exports workout as JSON string', () => {
            const workout = global.testUtils.createMockWorkout();
            const exported = workouts.exportWorkout(workout);
            
            expect(typeof exported).toBe('string');
            const parsed = JSON.parse(exported);
            expect(parsed).toEqual(workout);
        });

        test('imports valid workout JSON', () => {
            const workout = global.testUtils.createMockWorkout();
            const jsonData = JSON.stringify(workout);
            
            const imported = workouts.importWorkout(jsonData);
            
            expect(imported).toBeDefined();
            expect(imported.name).toBe(workout.name);
            expect(imported.id).not.toBe(workout.id); // Should get new ID
            expect(imported.imported).toBeInstanceOf(Date);
        });

        test('rejects invalid JSON', () => {
            const imported = workouts.importWorkout('invalid json');
            expect(imported).toBeNull();
        });

        test('rejects invalid workout structure', () => {
            const invalidWorkout = { name: 'Invalid' };
            const imported = workouts.importWorkout(JSON.stringify(invalidWorkout));
            expect(imported).toBeNull();
        });
    });
});