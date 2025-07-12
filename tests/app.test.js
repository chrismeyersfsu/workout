// Unit tests for app.js

// Import the app after DOM setup
require('../js/utils.js');

describe('HiitApp', () => {
    let hiitApp;
    
    beforeEach(() => {
        // Set up DOM
        global.testUtils.mockDOM();
        
        // Add required elements for app initialization
        document.body.innerHTML += `
            <button class="duration-btn" data-duration="10">10 min</button>
            <button class="duration-btn" data-duration="15">15 min</button>
            <button class="duration-btn" data-duration="20">20 min</button>
            <button class="duration-btn" data-duration="30">30 min</button>
            <button id="quick-start-btn">Quick Start</button>
            <button id="custom-workout-btn">Custom Workout</button>
            <button id="saved-workouts-btn">Saved Workouts</button>
            <button id="history-btn">History</button>
            <button id="back-to-home">Back</button>
            <button id="back-to-selection">Back</button>
            <button id="back-to-home-saved">Back</button>
            <button id="back-to-home-history">Back</button>
            <button id="preview-workout-btn">Preview</button>
            <button id="start-workout-btn">Start</button>
            <button id="save-workout-btn">Save</button>
            <button id="pause-btn">Pause</button>
            <button id="skip-btn">Skip</button>
            <button id="end-workout-btn">End</button>
            <button class="filter-btn" data-category="all">All</button>
            <div id="workout-summary"></div>
            <div id="saved-workouts-list"></div>
            <div id="history-list"></div>
            <div id="workout-stats"></div>
        `;
        
        // Import and initialize the app
        require('../js/app.js');
        hiitApp = new window.HiitApp();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        test('initializes with default values', () => {
            expect(hiitApp.currentScreen).toBe('home-screen');
            expect(hiitApp.selectedDuration).toBe(20);
        });

        test('shows home screen on initialization', () => {
            const homeScreen = document.getElementById('home-screen');
            expect(homeScreen.classList.contains('active')).toBe(true);
        });

        test('selects default duration', () => {
            const duration20Btn = document.querySelector('[data-duration="20"]');
            expect(duration20Btn.classList.contains('selected')).toBe(true);
        });
    });

    describe('duration selection', () => {
        test('updates selected duration', () => {
            hiitApp.selectDuration(15);
            expect(hiitApp.selectedDuration).toBe(15);
        });

        test('updates UI when duration is selected', () => {
            hiitApp.selectDuration(15);
            const duration15Btn = document.querySelector('[data-duration="15"]');
            const duration20Btn = document.querySelector('[data-duration="20"]');
            
            expect(duration15Btn.classList.contains('selected')).toBe(true);
            expect(duration20Btn.classList.contains('selected')).toBe(false);
        });

        test('validates duration before setting', () => {
            const originalDuration = hiitApp.selectedDuration;
            hiitApp.selectDuration(99);
            expect(hiitApp.selectedDuration).toBe(originalDuration);
        });

        test('handles duration button clicks', () => {
            const duration15Btn = document.querySelector('[data-duration="15"]');
            global.testUtils.simulateClick(duration15Btn);
            expect(hiitApp.selectedDuration).toBe(15);
        });
    });

    describe('screen navigation', () => {
        test('shows correct screen', () => {
            hiitApp.showScreen('exercise-selection-screen');
            
            const homeScreen = document.getElementById('home-screen');
            const exerciseScreen = document.getElementById('exercise-selection-screen');
            
            expect(homeScreen.classList.contains('active')).toBe(false);
            expect(exerciseScreen.classList.contains('active')).toBe(true);
            expect(hiitApp.currentScreen).toBe('exercise-selection-screen');
        });

        test('handles back navigation', () => {
            hiitApp.showScreen('exercise-selection-screen');
            const backBtn = document.getElementById('back-to-home');
            global.testUtils.simulateClick(backBtn);
            
            expect(hiitApp.currentScreen).toBe('home-screen');
        });
    });

    describe('navigation buttons', () => {
        test('quick start button shows workout preview', () => {
            // Mock Workouts module
            window.Workouts = {
                generateQuickWorkout: jest.fn().mockReturnValue({
                    duration: 20,
                    exercises: [global.testUtils.createMockExercise()]
                })
            };

            const quickStartBtn = document.getElementById('quick-start-btn');
            global.testUtils.simulateClick(quickStartBtn);
            
            expect(window.Workouts.generateQuickWorkout).toHaveBeenCalledWith(20);
        });

        test('custom workout button shows exercise selection', () => {
            const customBtn = document.getElementById('custom-workout-btn');
            global.testUtils.simulateClick(customBtn);
            
            expect(hiitApp.currentScreen).toBe('exercise-selection-screen');
        });

        test('saved workouts button shows saved workouts screen', () => {
            const savedBtn = document.getElementById('saved-workouts-btn');
            global.testUtils.simulateClick(savedBtn);
            
            expect(hiitApp.currentScreen).toBe('saved-workouts-screen');
        });

        test('history button shows history screen', () => {
            const historyBtn = document.getElementById('history-btn');
            global.testUtils.simulateClick(historyBtn);
            
            expect(hiitApp.currentScreen).toBe('history-screen');
        });
    });

    describe('workout preview', () => {
        beforeEach(() => {
            hiitApp.currentWorkout = global.testUtils.createMockWorkout();
        });

        test('displays workout summary', () => {
            hiitApp.displayWorkoutSummary();
            
            const summaryContainer = document.getElementById('workout-summary');
            expect(summaryContainer.innerHTML).toContain('20');
            expect(summaryContainer.innerHTML).toContain('Minutes');
            expect(summaryContainer.innerHTML).toContain('Test Exercise');
        });
    });

    describe('keyboard navigation', () => {
        test('handles escape key to go home', () => {
            hiitApp.showScreen('exercise-selection-screen');
            
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            
            expect(hiitApp.currentScreen).toBe('home-screen');
        });

        test('handles space key to pause workout', () => {
            window.Timer = { pauseWorkout: jest.fn() };
            hiitApp.showScreen('workout-screen');
            
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
            spaceEvent.preventDefault = jest.fn();
            document.dispatchEvent(spaceEvent);
            
            expect(window.Timer.pauseWorkout).toHaveBeenCalled();
            expect(spaceEvent.preventDefault).toHaveBeenCalled();
        });
    });

    describe('workout management', () => {
        beforeEach(() => {
            window.Timer = {
                startWorkout: jest.fn(),
                pauseWorkout: jest.fn(),
                skipExercise: jest.fn(),
                endWorkout: jest.fn()
            };
            hiitApp.currentWorkout = global.testUtils.createMockWorkout();
        });

        test('starts workout correctly', async () => {
            await hiitApp.startWorkout();
            
            expect(hiitApp.currentScreen).toBe('workout-screen');
            expect(window.Timer.startWorkout).toHaveBeenCalledWith(hiitApp.currentWorkout);
        });

        test('pauses workout', () => {
            hiitApp.pauseWorkout();
            expect(window.Timer.pauseWorkout).toHaveBeenCalled();
        });

        test('skips exercise', () => {
            hiitApp.skipExercise();
            expect(window.Timer.skipExercise).toHaveBeenCalled();
        });

        test('ends workout with confirmation', () => {
            window.confirm = jest.fn().mockReturnValue(true);
            hiitApp.endWorkout();
            
            expect(window.Timer.endWorkout).toHaveBeenCalled();
            expect(hiitApp.currentScreen).toBe('home-screen');
        });

        test('cancels workout end without confirmation', () => {
            window.confirm = jest.fn().mockReturnValue(false);
            const originalScreen = hiitApp.currentScreen;
            hiitApp.endWorkout();
            
            expect(window.Timer.endWorkout).not.toHaveBeenCalled();
            expect(hiitApp.currentScreen).toBe(originalScreen);
        });
    });

    describe('data management', () => {
        beforeEach(() => {
            window.Storage = {
                saveWorkout: jest.fn(),
                getSavedWorkouts: jest.fn().mockReturnValue([]),
                getWorkoutHistory: jest.fn().mockReturnValue([]),
                getWorkout: jest.fn(),
                deleteWorkout: jest.fn()
            };
        });

        test('saves current workout', () => {
            hiitApp.currentWorkout = global.testUtils.createMockWorkout();
            window.prompt = jest.fn().mockReturnValue('My Custom Workout');
            window.alert = jest.fn();
            
            hiitApp.saveCurrentWorkout();
            
            expect(window.Storage.saveWorkout).toHaveBeenCalled();
            expect(hiitApp.currentWorkout.name).toBe('My Custom Workout');
            expect(window.alert).toHaveBeenCalledWith('Workout saved successfully!');
        });

        test('cancels save when no name provided', () => {
            hiitApp.currentWorkout = global.testUtils.createMockWorkout();
            window.prompt = jest.fn().mockReturnValue(null);
            
            hiitApp.saveCurrentWorkout();
            
            expect(window.Storage.saveWorkout).not.toHaveBeenCalled();
        });
    });
});