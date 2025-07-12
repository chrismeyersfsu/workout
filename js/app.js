// Main application controller for HIIT Workout App

class HiitApp {
    constructor() {
        this.currentScreen = 'home-screen';
        this.selectedDuration = 20; // Default 20 minutes
        this.wakeLock = null;
        
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        // Initialize all screens as hidden except home
        this.showScreen('home-screen');
        
        // Set default duration selection
        this.selectDuration(this.selectedDuration);
        
        // Initialize wake lock for workout sessions
        this.initializeWakeLock();
        
        // Initialize install prompt handling
        this.initializeInstallPrompt();
        
        console.log('HIIT Workout App initialized');
    }

    initializeWakeLock() {
        if ('wakeLock' in navigator) {
            document.addEventListener('visibilitychange', async () => {
                if (this.wakeLock !== null && document.visibilityState === 'visible') {
                    this.wakeLock = await Utils.requestWakeLock();
                }
            });
        }
    }

    initializeInstallPrompt() {
        window.addEventListener('beforeinstallprompt', Utils.handleInstallPrompt.bind(Utils));
    }

    bindEvents() {
        // Duration selection
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const duration = parseInt(e.target.dataset.duration);
                this.selectDuration(duration);
            });
        });

        // Main navigation buttons
        document.getElementById('quick-start-btn')?.addEventListener('click', () => {
            this.startQuickWorkout();
        });

        document.getElementById('custom-workout-btn')?.addEventListener('click', () => {
            this.showExerciseSelection();
        });

        document.getElementById('saved-workouts-btn')?.addEventListener('click', () => {
            this.showSavedWorkouts();
        });

        document.getElementById('history-btn')?.addEventListener('click', () => {
            this.showHistory();
        });

        // Back navigation
        document.getElementById('back-to-home')?.addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('back-to-selection')?.addEventListener('click', () => {
            this.showScreen('exercise-selection-screen');
        });

        document.getElementById('back-to-home-saved')?.addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('back-to-home-history')?.addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        // Exercise selection
        document.getElementById('preview-workout-btn')?.addEventListener('click', () => {
            this.previewWorkout();
        });

        // Workout preview
        document.getElementById('start-workout-btn')?.addEventListener('click', () => {
            this.startWorkout();
        });

        document.getElementById('save-workout-btn')?.addEventListener('click', () => {
            this.saveCurrentWorkout();
        });

        // Workout controls
        document.getElementById('pause-btn')?.addEventListener('click', () => {
            this.pauseWorkout();
        });

        document.getElementById('skip-btn')?.addEventListener('click', () => {
            this.skipExercise();
        });

        document.getElementById('end-workout-btn')?.addEventListener('click', () => {
            this.endWorkout();
        });

        // Exercise filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterExercises(e.target.dataset.category);
                
                // Update active filter button
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        // Handle browser back button
        window.addEventListener('popstate', (e) => {
            this.handleBackNavigation(e);
        });
    }

    selectDuration(duration) {
        if (!Utils.validateDuration(duration)) return;
        
        this.selectedDuration = duration;
        
        // Update UI
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (parseInt(btn.dataset.duration) === duration) {
                btn.classList.add('selected');
            }
        });
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            Utils.hideElement(screen);
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            Utils.showElement(targetScreen);
            this.currentScreen = screenId;
            
            // Update browser history
            if (screenId !== 'home-screen') {
                history.pushState({ screen: screenId }, '', `#${screenId}`);
            }
        }
    }

    startQuickWorkout() {
        if (!window.Workouts) {
            console.error('Workouts module not loaded');
            return;
        }

        // Generate a quick workout based on selected duration
        const workout = window.Workouts.generateQuickWorkout(this.selectedDuration);
        if (workout) {
            this.currentWorkout = workout;
            this.showWorkoutPreview();
        }
    }

    showExerciseSelection() {
        this.showScreen('exercise-selection-screen');
        
        // Load exercises if not already loaded
        if (window.Exercises) {
            window.Exercises.displayExercises();
        }
    }

    showSavedWorkouts() {
        this.showScreen('saved-workouts-screen');
        
        // Load saved workouts
        if (window.Storage && typeof window.Storage.getSavedWorkouts === 'function') {
            this.displaySavedWorkouts();
        }
    }

    showHistory() {
        this.showScreen('history-screen');
        
        // Load workout history
        if (window.Storage && typeof window.Storage.getWorkoutHistory === 'function') {
            this.displayWorkoutHistory();
        }
    }

    previewWorkout() {
        if (!window.Exercises) {
            console.error('Exercises module not loaded');
            return;
        }

        const selectedExercises = window.Exercises.getSelectedExercises();
        if (selectedExercises.length === 0) {
            alert('Please select at least one exercise');
            return;
        }

        // Generate workout from selected exercises
        if (window.Workouts) {
            this.currentWorkout = window.Workouts.createCustomWorkout(selectedExercises, this.selectedDuration);
            this.showWorkoutPreview();
        }
    }

    showWorkoutPreview() {
        this.showScreen('workout-preview-screen');
        this.displayWorkoutSummary();
    }

    displayWorkoutSummary() {
        if (!this.currentWorkout) return;

        const summaryContainer = document.getElementById('workout-summary');
        if (!summaryContainer) return;

        const totalRounds = this.currentWorkout.exercises.length;
        const workTime = this.currentWorkout.workInterval || 20;
        const restTime = this.currentWorkout.restInterval || 10;
        const totalTime = this.currentWorkout.duration;

        summaryContainer.innerHTML = `
            <h3>Workout Summary</h3>
            <div class="workout-info">
                <div class="info-item">
                    <span class="value">${totalTime}</span>
                    <span class="label">Minutes</span>
                </div>
                <div class="info-item">
                    <span class="value">${totalRounds}</span>
                    <span class="label">Exercises</span>
                </div>
                <div class="info-item">
                    <span class="value">${workTime}s</span>
                    <span class="label">Work</span>
                </div>
                <div class="info-item">
                    <span class="value">${restTime}s</span>
                    <span class="label">Rest</span>
                </div>
            </div>
            <div class="exercise-preview-list">
                ${this.currentWorkout.exercises.map((exercise, index) => `
                    <div class="exercise-preview-item">
                        <span class="exercise-number">${index + 1}.</span>
                        <span class="exercise-name">${exercise.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async startWorkout() {
        if (!this.currentWorkout) return;

        this.showScreen('workout-screen');
        
        // Request wake lock to keep screen on
        this.wakeLock = await Utils.requestWakeLock();
        
        // Start the timer
        if (window.Timer) {
            window.Timer.startWorkout(this.currentWorkout);
        }
    }

    pauseWorkout() {
        if (window.Timer) {
            window.Timer.pauseWorkout();
        }
    }

    skipExercise() {
        if (window.Timer) {
            window.Timer.skipExercise();
        }
    }

    async endWorkout() {
        const confirmed = confirm('Are you sure you want to end this workout?');
        if (!confirmed) return;

        if (window.Timer) {
            window.Timer.endWorkout();
        }

        // Release wake lock
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }

        this.showScreen('home-screen');
    }

    saveCurrentWorkout() {
        if (!this.currentWorkout || !window.Storage) return;

        const name = prompt('Enter a name for this workout:');
        if (!name) return;

        this.currentWorkout.name = name;
        this.currentWorkout.id = Utils.generateId();
        
        window.Storage.saveWorkout(this.currentWorkout);
        alert('Workout saved successfully!');
    }

    displaySavedWorkouts() {
        if (!window.Storage) return;

        const savedWorkouts = window.Storage.getSavedWorkouts();
        const container = document.getElementById('saved-workouts-list');
        
        if (!container) return;

        if (savedWorkouts.length === 0) {
            container.innerHTML = '<p>No saved workouts yet. Create a custom workout to get started!</p>';
            return;
        }

        container.innerHTML = savedWorkouts.map(workout => `
            <div class="workout-item" data-workout-id="${workout.id}">
                <h3>${workout.name}</h3>
                <div class="workout-details">
                    <span>${workout.duration} min</span> • 
                    <span>${workout.exercises.length} exercises</span>
                </div>
                <div class="workout-actions">
                    <button class="primary-btn start-saved-workout" data-workout-id="${workout.id}">Start</button>
                    <button class="secondary-btn delete-workout" data-workout-id="${workout.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Bind events for saved workout actions
        container.querySelectorAll('.start-saved-workout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workoutId = e.target.dataset.workoutId;
                this.startSavedWorkout(workoutId);
            });
        });

        container.querySelectorAll('.delete-workout').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workoutId = e.target.dataset.workoutId;
                this.deleteSavedWorkout(workoutId);
            });
        });
    }

    startSavedWorkout(workoutId) {
        if (!window.Storage) return;

        const workout = window.Storage.getWorkout(workoutId);
        if (workout) {
            this.currentWorkout = workout;
            this.showWorkoutPreview();
        }
    }

    deleteSavedWorkout(workoutId) {
        const confirmed = confirm('Are you sure you want to delete this workout?');
        if (!confirmed) return;

        if (window.Storage) {
            window.Storage.deleteWorkout(workoutId);
            this.displaySavedWorkouts(); // Refresh the list
        }
    }

    displayWorkoutHistory() {
        if (!window.Storage) return;

        const history = window.Storage.getWorkoutHistory();
        const container = document.getElementById('history-list');
        const statsContainer = document.getElementById('workout-stats');
        
        if (!container || !statsContainer) return;

        // Display stats
        const totalWorkouts = history.length;
        const totalTime = history.reduce((sum, session) => sum + session.duration, 0);
        const averageDuration = totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0;

        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="number">${totalWorkouts}</span>
                    <span class="label">Total Workouts</span>
                </div>
                <div class="stat-card">
                    <span class="number">${Math.round(totalTime)}</span>
                    <span class="label">Minutes Exercised</span>
                </div>
                <div class="stat-card">
                    <span class="number">${averageDuration}</span>
                    <span class="label">Avg Duration</span>
                </div>
            </div>
        `;

        // Display history
        if (history.length === 0) {
            container.innerHTML = '<p>No workout history yet. Complete your first workout to see it here!</p>';
            return;
        }

        container.innerHTML = history.map(session => `
            <div class="history-item">
                <div class="history-header">
                    <h3>${session.workoutName || 'Quick Workout'}</h3>
                    <span class="history-date">${Utils.formatDate(new Date(session.date))}</span>
                </div>
                <div class="history-details">
                    <span>${session.duration} min</span> • 
                    <span>${session.exercisesCompleted}/${session.totalExercises} exercises</span>
                    ${session.completed ? '<span class="completed">✓ Completed</span>' : '<span class="incomplete">Incomplete</span>'}
                </div>
            </div>
        `).join('');
    }

    filterExercises(category) {
        if (window.Exercises) {
            window.Exercises.filterByCategory(category);
        }
    }

    handleKeydown(e) {
        switch(e.key) {
            case 'Escape':
                if (this.currentScreen !== 'home-screen') {
                    this.showScreen('home-screen');
                }
                break;
            case ' ':
                if (this.currentScreen === 'workout-screen') {
                    e.preventDefault();
                    this.pauseWorkout();
                }
                break;
        }
    }

    handleBackNavigation(e) {
        if (e.state && e.state.screen) {
            this.showScreen(e.state.screen);
        } else {
            this.showScreen('home-screen');
        }
    }
}

// Make HiitApp available globally
window.HiitApp = HiitApp;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hiitApp = new HiitApp();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HiitApp;
}