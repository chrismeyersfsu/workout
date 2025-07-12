// Unit tests for exercises.js

require('../js/utils.js');
require('../js/exercises.js');

describe('Exercises', () => {
    let exercises;

    beforeEach(() => {
        // Set up DOM
        global.testUtils.mockDOM();
        
        // Add required elements
        document.body.innerHTML += `
            <div id="exercise-list"></div>
            <button id="preview-workout-btn">Preview Workout</button>
            <div class="filter-btn active" data-category="all">All</div>
            <div class="filter-btn" data-category="upper">Upper Body</div>
            <div class="filter-btn" data-category="lower">Lower Body</div>
            <div class="filter-btn" data-category="core">Core</div>
            <div class="filter-btn" data-category="cardio">Cardio</div>
        `;
        
        exercises = new window.Exercises.constructor();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        test('initializes with exercise database', () => {
            expect(exercises.exerciseDatabase).toBeDefined();
            expect(exercises.selectedExercises).toBeInstanceOf(Set);
            expect(exercises.currentFilter).toBe('all');
        });

        test('has all required exercise categories', () => {
            const expectedCategories = ['upper', 'lower', 'core', 'cardio', 'fullbody'];
            expectedCategories.forEach(category => {
                expect(exercises.exerciseDatabase[category]).toBeDefined();
                expect(Array.isArray(exercises.exerciseDatabase[category])).toBe(true);
            });
        });

        test('exercises have required properties', () => {
            const allExercises = exercises.getAllExercises();
            expect(allExercises.length).toBeGreaterThan(0);
            
            allExercises.forEach(exercise => {
                expect(exercise).toHaveProperty('id');
                expect(exercise).toHaveProperty('name');
                expect(exercise).toHaveProperty('category');
                expect(exercise).toHaveProperty('instructions');
                expect(exercise).toHaveProperty('imagePath');
                expect(exercise).toHaveProperty('muscleGroups');
                expect(exercise).toHaveProperty('difficulty');
            });
        });
    });

    describe('exercise retrieval', () => {
        test('getAllExercises returns all exercises', () => {
            const allExercises = exercises.getAllExercises();
            const expectedTotal = Object.values(exercises.exerciseDatabase)
                .reduce((sum, categoryExercises) => sum + categoryExercises.length, 0);
            
            expect(allExercises).toHaveLength(expectedTotal);
        });

        test('getExercisesByCategory returns correct exercises', () => {
            const upperExercises = exercises.getExercisesByCategory('upper');
            expect(upperExercises).toEqual(exercises.exerciseDatabase.upper);
            
            const allExercises = exercises.getExercisesByCategory('all');
            expect(allExercises).toEqual(exercises.getAllExercises());
            
            const invalidCategory = exercises.getExercisesByCategory('invalid');
            expect(invalidCategory).toEqual([]);
        });

        test('getExerciseById returns correct exercise', () => {
            const firstExercise = exercises.exerciseDatabase.upper[0];
            const foundExercise = exercises.getExerciseById(firstExercise.id);
            
            expect(foundExercise).toEqual(firstExercise);
            
            const notFound = exercises.getExerciseById('non-existent-id');
            expect(notFound).toBeUndefined();
        });
    });

    describe('filtering and search', () => {
        test('filterByCategory updates current filter', () => {
            exercises.filterByCategory('upper');
            expect(exercises.currentFilter).toBe('upper');
        });

        test('filterByDifficulty returns exercises of specified difficulty', () => {
            const beginnerExercises = exercises.filterByDifficulty('beginner');
            beginnerExercises.forEach(exercise => {
                expect(exercise.difficulty).toBe('beginner');
            });
        });

        test('searchExercises finds exercises by name', () => {
            const results = exercises.searchExercises('push');
            expect(results.length).toBeGreaterThan(0);
            results.forEach(exercise => {
                expect(exercise.name.toLowerCase()).toContain('push');
            });
        });

        test('searchExercises finds exercises by muscle group', () => {
            const results = exercises.searchExercises('chest');
            expect(results.length).toBeGreaterThan(0);
            results.forEach(exercise => {
                expect(exercise.muscleGroups.some(muscle => 
                    muscle.toLowerCase().includes('chest')
                )).toBe(true);
            });
        });

        test('searchExercises is case insensitive', () => {
            const lowerResults = exercises.searchExercises('push');
            const upperResults = exercises.searchExercises('PUSH');
            expect(lowerResults).toEqual(upperResults);
        });
    });

    describe('exercise selection', () => {
        test('toggleExerciseSelection adds and removes exercises', () => {
            const exerciseId = 'push-ups';
            
            expect(exercises.selectedExercises.has(exerciseId)).toBe(false);
            
            exercises.toggleExerciseSelection(exerciseId);
            expect(exercises.selectedExercises.has(exerciseId)).toBe(true);
            
            exercises.toggleExerciseSelection(exerciseId);
            expect(exercises.selectedExercises.has(exerciseId)).toBe(false);
        });

        test('getSelectedExercises returns selected exercise objects', () => {
            const exerciseId = 'push-ups';
            exercises.toggleExerciseSelection(exerciseId);
            
            const selected = exercises.getSelectedExercises();
            expect(selected).toHaveLength(1);
            expect(selected[0].id).toBe(exerciseId);
        });

        test('clearSelection removes all selected exercises', () => {
            exercises.toggleExerciseSelection('push-ups');
            exercises.toggleExerciseSelection('squats');
            
            expect(exercises.selectedExercises.size).toBe(2);
            
            exercises.clearSelection();
            expect(exercises.selectedExercises.size).toBe(0);
        });

        test('updateSelectionCount updates preview button', () => {
            const previewBtn = document.getElementById('preview-workout-btn');
            
            exercises.updateSelectionCount();
            expect(previewBtn.textContent).toBe('Select Exercises');
            expect(previewBtn.disabled).toBe(true);
            
            exercises.toggleExerciseSelection('push-ups');
            exercises.updateSelectionCount();
            expect(previewBtn.textContent).toBe('Preview Workout (1)');
            expect(previewBtn.disabled).toBe(false);
        });
    });

    describe('workout generation', () => {
        test('getRandomExercises returns requested number of exercises', () => {
            const randomExercises = exercises.getRandomExercises(5);
            expect(randomExercises).toHaveLength(5);
            
            // Should return unique exercises
            const ids = randomExercises.map(ex => ex.id);
            const uniqueIds = [...new Set(ids)];
            expect(uniqueIds).toHaveLength(5);
        });

        test('getRandomExercises respects category filters', () => {
            const upperExercises = exercises.getRandomExercises(3, ['upper']);
            expect(upperExercises).toHaveLength(3);
            upperExercises.forEach(exercise => {
                expect(exercise.category).toBe('upper');
            });
        });

        test('getBalancedWorkout returns exercises from different categories', () => {
            const balancedWorkout = exercises.getBalancedWorkout(8);
            expect(balancedWorkout).toHaveLength(8);
            
            // Should have exercises from multiple categories
            const categories = [...new Set(balancedWorkout.map(ex => ex.category))];
            expect(categories.length).toBeGreaterThan(1);
        });

        test('getBalancedWorkout handles small workout sizes', () => {
            const smallWorkout = exercises.getBalancedWorkout(2);
            expect(smallWorkout).toHaveLength(2);
        });
    });

    describe('display functionality', () => {
        test('createExerciseCard generates correct HTML', () => {
            const testExercise = {
                id: 'test-exercise',
                name: 'Test Exercise',
                instructions: 'Test instructions',
                imagePath: 'test/path.jpg',
                difficulty: 'beginner',
                muscleGroups: ['test', 'muscles']
            };
            
            const cardHTML = exercises.createExerciseCard(testExercise);
            
            expect(cardHTML).toContain('test-exercise');
            expect(cardHTML).toContain('Test Exercise');
            expect(cardHTML).toContain('Test instructions');
            expect(cardHTML).toContain('test/path.jpg');
            expect(cardHTML).toContain('beginner');
            expect(cardHTML).toContain('test, muscles');
        });

        test('createExerciseCard shows selected state', () => {
            const testExercise = global.testUtils.createMockExercise();
            
            exercises.toggleExerciseSelection(testExercise.id);
            const cardHTML = exercises.createExerciseCard(testExercise);
            
            expect(cardHTML).toContain('selected');
        });

        test('displayExercises populates container', () => {
            exercises.displayExercises();
            
            const container = document.getElementById('exercise-list');
            expect(container.innerHTML).not.toBe('');
            expect(container.innerHTML).toContain('exercise-card');
        });
    });

    describe('validation', () => {
        test('validateExerciseData validates required fields', () => {
            const validExercise = {
                id: 'test',
                name: 'Test',
                category: 'upper',
                instructions: 'Test instructions',
                muscleGroups: ['test']
            };
            
            expect(exercises.validateExerciseData(validExercise)).toBe(true);
            
            const invalidExercise = {
                id: 'test',
                name: 'Test'
                // missing required fields
            };
            
            expect(exercises.validateExerciseData(invalidExercise)).toBe(false);
        });
    });

    describe('data import/export', () => {
        test('exportExerciseData returns JSON string', () => {
            const exported = exercises.exportExerciseData();
            expect(typeof exported).toBe('string');
            
            const parsed = JSON.parse(exported);
            expect(parsed).toEqual(exercises.exerciseDatabase);
        });

        test('importExerciseData imports valid JSON', () => {
            const testData = {
                test: [
                    {
                        id: 'imported-exercise',
                        name: 'Imported Exercise',
                        category: 'test',
                        instructions: 'Test',
                        muscleGroups: ['test']
                    }
                ]
            };
            
            const result = exercises.importExerciseData(JSON.stringify(testData));
            expect(result).toBe(true);
            expect(exercises.exerciseDatabase.test).toEqual(testData.test);
        });

        test('importExerciseData rejects invalid JSON', () => {
            const result = exercises.importExerciseData('invalid json');
            expect(result).toBe(false);
        });
    });

    describe('error handling', () => {
        test('handles missing DOM elements gracefully', () => {
            document.getElementById('exercise-list').remove();
            
            expect(() => exercises.displayExercises()).not.toThrow();
        });

        test('handles missing preview button gracefully', () => {
            document.getElementById('preview-workout-btn').remove();
            
            expect(() => exercises.updateSelectionCount()).not.toThrow();
        });
    });
});