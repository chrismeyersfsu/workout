// Exercise database and management for HIIT Workout App

class Exercises {
    constructor() {
        this.exerciseDatabase = this.initializeExerciseDatabase();
        this.selectedExercises = new Set();
        this.currentFilter = 'all';
        
        this.initializeExerciseSelection();
    }

    initializeExerciseDatabase() {
        return {
            upper: [
                {
                    id: 'push-ups',
                    name: 'Push-ups',
                    category: 'upper',
                    instructions: 'Keep your body straight and lower yourself until your chest nearly touches the floor. Push back up to starting position.',
                    imagePath: 'assets/exercises/push-ups.jpg',
                    muscleGroups: ['chest', 'triceps', 'shoulders'],
                    difficulty: 'beginner'
                },
                {
                    id: 'diamond-push-ups',
                    name: 'Diamond Push-ups',
                    category: 'upper',
                    instructions: 'Form a diamond shape with your hands and perform push-ups. This targets the triceps more intensely.',
                    imagePath: 'assets/exercises/diamond-push-ups.jpg',
                    muscleGroups: ['triceps', 'chest', 'shoulders'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'pike-push-ups',
                    name: 'Pike Push-ups',
                    category: 'upper',
                    instructions: 'Start in downward dog position and lower your head toward the ground, focusing on shoulder strength.',
                    imagePath: 'assets/exercises/pike-push-ups.jpg',
                    muscleGroups: ['shoulders', 'triceps'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'tricep-dips',
                    name: 'Tricep Dips',
                    category: 'upper',
                    instructions: 'Using a chair or edge, lower your body by bending your arms, then push back up.',
                    imagePath: 'assets/exercises/tricep-dips.jpg',
                    muscleGroups: ['triceps', 'shoulders'],
                    difficulty: 'beginner'
                },
                {
                    id: 'arm-circles',
                    name: 'Arm Circles',
                    category: 'upper',
                    instructions: 'Extend arms to sides and make small circles, gradually increasing size.',
                    imagePath: 'assets/exercises/arm-circles.jpg',
                    muscleGroups: ['shoulders', 'arms'],
                    difficulty: 'beginner'
                },
                {
                    id: 'handstand-hold',
                    name: 'Handstand Hold',
                    category: 'upper',
                    instructions: 'Hold a handstand against a wall, engaging your core and shoulders.',
                    imagePath: 'assets/exercises/handstand-hold.jpg',
                    muscleGroups: ['shoulders', 'core', 'arms'],
                    difficulty: 'advanced'
                }
            ],
            lower: [
                {
                    id: 'squats',
                    name: 'Squats',
                    category: 'lower',
                    instructions: 'Lower your body as if sitting back into a chair, keeping your chest up and knees behind toes.',
                    imagePath: 'assets/exercises/squats.jpg',
                    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
                    difficulty: 'beginner'
                },
                {
                    id: 'jump-squats',
                    name: 'Jump Squats',
                    category: 'lower',
                    instructions: 'Perform a squat and explode up into a jump, landing softly back into squat position.',
                    imagePath: 'assets/exercises/jump-squats.jpg',
                    muscleGroups: ['quadriceps', 'glutes', 'calves'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'lunges',
                    name: 'Lunges',
                    category: 'lower',
                    instructions: 'Step forward into a lunge position, lowering your back knee toward the ground.',
                    imagePath: 'assets/exercises/lunges.jpg',
                    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
                    difficulty: 'beginner'
                },
                {
                    id: 'reverse-lunges',
                    name: 'Reverse Lunges',
                    category: 'lower',
                    instructions: 'Step backward into a lunge position, focusing on control and balance.',
                    imagePath: 'assets/exercises/reverse-lunges.jpg',
                    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
                    difficulty: 'beginner'
                },
                {
                    id: 'single-leg-glute-bridge',
                    name: 'Single Leg Glute Bridge',
                    category: 'lower',
                    instructions: 'Lift one leg and bridge up with the other, squeezing your glutes at the top.',
                    imagePath: 'assets/exercises/single-leg-glute-bridge.jpg',
                    muscleGroups: ['glutes', 'hamstrings', 'core'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'calf-raises',
                    name: 'Calf Raises',
                    category: 'lower',
                    instructions: 'Rise up onto your toes, hold briefly, then lower back down with control.',
                    imagePath: 'assets/exercises/calf-raises.jpg',
                    muscleGroups: ['calves'],
                    difficulty: 'beginner'
                },
                {
                    id: 'wall-sit',
                    name: 'Wall Sit',
                    category: 'lower',
                    instructions: 'Slide down a wall until your thighs are parallel to the ground and hold the position.',
                    imagePath: 'assets/exercises/wall-sit.jpg',
                    muscleGroups: ['quadriceps', 'glutes'],
                    difficulty: 'intermediate'
                }
            ],
            core: [
                {
                    id: 'plank',
                    name: 'Plank',
                    category: 'core',
                    instructions: 'Hold a straight line from head to heels, engaging your core muscles.',
                    imagePath: 'assets/exercises/plank.jpg',
                    muscleGroups: ['core', 'shoulders'],
                    difficulty: 'beginner'
                },
                {
                    id: 'side-plank',
                    name: 'Side Plank',
                    category: 'core',
                    instructions: 'Hold a side plank position, keeping your body in a straight line.',
                    imagePath: 'assets/exercises/side-plank.jpg',
                    muscleGroups: ['core', 'obliques'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'mountain-climbers',
                    name: 'Mountain Climbers',
                    category: 'core',
                    instructions: 'In plank position, alternate bringing knees to chest in a running motion.',
                    imagePath: 'assets/exercises/mountain-climbers.jpg',
                    muscleGroups: ['core', 'shoulders', 'legs'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'bicycle-crunches',
                    name: 'Bicycle Crunches',
                    category: 'core',
                    instructions: 'Alternate bringing opposite elbow to knee in a bicycle pedaling motion.',
                    imagePath: 'assets/exercises/bicycle-crunches.jpg',
                    muscleGroups: ['core', 'obliques'],
                    difficulty: 'beginner'
                },
                {
                    id: 'dead-bug',
                    name: 'Dead Bug',
                    category: 'core',
                    instructions: 'Lie on back, extend opposite arm and leg while keeping core stable.',
                    imagePath: 'assets/exercises/dead-bug.jpg',
                    muscleGroups: ['core', 'hip flexors'],
                    difficulty: 'beginner'
                },
                {
                    id: 'russian-twists',
                    name: 'Russian Twists',
                    category: 'core',
                    instructions: 'Sit with knees bent, lean back slightly and rotate your torso side to side.',
                    imagePath: 'assets/exercises/russian-twists.jpg',
                    muscleGroups: ['core', 'obliques'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'leg-raises',
                    name: 'Leg Raises',
                    category: 'core',
                    instructions: 'Lie on back and raise legs up and down while keeping core engaged.',
                    imagePath: 'assets/exercises/leg-raises.jpg',
                    muscleGroups: ['core', 'hip flexors'],
                    difficulty: 'intermediate'
                }
            ],
            cardio: [
                {
                    id: 'jumping-jacks',
                    name: 'Jumping Jacks',
                    category: 'cardio',
                    instructions: 'Jump while spreading legs and raising arms overhead, then return to starting position.',
                    imagePath: 'assets/exercises/jumping-jacks.jpg',
                    muscleGroups: ['full body', 'cardiovascular'],
                    difficulty: 'beginner'
                },
                {
                    id: 'high-knees',
                    name: 'High Knees',
                    category: 'cardio',
                    instructions: 'Run in place while bringing knees up toward your chest.',
                    imagePath: 'assets/exercises/high-knees.jpg',
                    muscleGroups: ['legs', 'core', 'cardiovascular'],
                    difficulty: 'beginner'
                },
                {
                    id: 'butt-kicks',
                    name: 'Butt Kicks',
                    category: 'cardio',
                    instructions: 'Run in place while kicking your heels toward your glutes.',
                    imagePath: 'assets/exercises/butt-kicks.jpg',
                    muscleGroups: ['legs', 'cardiovascular'],
                    difficulty: 'beginner'
                },
                {
                    id: 'burpees',
                    name: 'Burpees',
                    category: 'cardio',
                    instructions: 'Squat down, jump back to plank, do a push-up, jump feet forward, then jump up.',
                    imagePath: 'assets/exercises/burpees.jpg',
                    muscleGroups: ['full body', 'cardiovascular'],
                    difficulty: 'advanced'
                },
                {
                    id: 'star-jumps',
                    name: 'Star Jumps',
                    category: 'cardio',
                    instructions: 'Jump up spreading arms and legs wide like a star, then return to center.',
                    imagePath: 'assets/exercises/star-jumps.jpg',
                    muscleGroups: ['full body', 'cardiovascular'],
                    difficulty: 'beginner'
                },
                {
                    id: 'cross-country-skiers',
                    name: 'Cross Country Skiers',
                    category: 'cardio',
                    instructions: 'Alternate jumping forward with opposite arm and leg like skiing motion.',
                    imagePath: 'assets/exercises/cross-country-skiers.jpg',
                    muscleGroups: ['full body', 'cardiovascular'],
                    difficulty: 'intermediate'
                }
            ],
            fullbody: [
                {
                    id: 'inchworms',
                    name: 'Inchworms',
                    category: 'fullbody',
                    instructions: 'Bend forward, walk hands out to plank, walk feet toward hands, and stand up.',
                    imagePath: 'assets/exercises/inchworms.jpg',
                    muscleGroups: ['full body', 'core', 'hamstrings'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'bear-crawl',
                    name: 'Bear Crawl',
                    category: 'fullbody',
                    instructions: 'Crawl forward on hands and feet, keeping knees close to ground.',
                    imagePath: 'assets/exercises/bear-crawl.jpg',
                    muscleGroups: ['full body', 'core', 'shoulders'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'turkish-get-up',
                    name: 'Turkish Get-up',
                    category: 'fullbody',
                    instructions: 'Complex movement from lying to standing while maintaining arm overhead.',
                    imagePath: 'assets/exercises/turkish-get-up.jpg',
                    muscleGroups: ['full body', 'core', 'shoulders'],
                    difficulty: 'advanced'
                },
                {
                    id: 'sprawls',
                    name: 'Sprawls',
                    category: 'fullbody',
                    instructions: 'Similar to burpees but without the jump at the end.',
                    imagePath: 'assets/exercises/sprawls.jpg',
                    muscleGroups: ['full body', 'cardiovascular'],
                    difficulty: 'intermediate'
                },
                {
                    id: 'commando-crawl',
                    name: 'Commando Crawl',
                    category: 'fullbody',
                    instructions: 'Low crawl forward using elbows and dragging your body along the ground.',
                    imagePath: 'assets/exercises/commando-crawl.jpg',
                    muscleGroups: ['full body', 'core'],
                    difficulty: 'advanced'
                },
                {
                    id: 'yoga-flow',
                    name: 'Yoga Flow',
                    category: 'fullbody',
                    instructions: 'Flow through downward dog, plank, low push-up, and upward dog.',
                    imagePath: 'assets/exercises/yoga-flow.jpg',
                    muscleGroups: ['full body', 'flexibility'],
                    difficulty: 'intermediate'
                }
            ]
        };
    }

    initializeExerciseSelection() {
        // This will be called when the exercises module is loaded
        this.bindExerciseEvents();
    }

    bindExerciseEvents() {
        // Exercise card click events will be bound when displayExercises is called
    }

    getAllExercises() {
        const allExercises = [];
        Object.values(this.exerciseDatabase).forEach(categoryExercises => {
            allExercises.push(...categoryExercises);
        });
        return allExercises;
    }

    getExercisesByCategory(category) {
        if (category === 'all') {
            return this.getAllExercises();
        }
        return this.exerciseDatabase[category] || [];
    }

    getExerciseById(id) {
        const allExercises = this.getAllExercises();
        return allExercises.find(exercise => exercise.id === id);
    }

    filterByCategory(category) {
        this.currentFilter = category;
        this.displayExercises();
    }

    filterByDifficulty(difficulty) {
        // Optional method for future enhancement
        const exercises = this.getExercisesByCategory(this.currentFilter);
        return exercises.filter(exercise => exercise.difficulty === difficulty);
    }

    searchExercises(query) {
        const exercises = this.getExercisesByCategory(this.currentFilter);
        return exercises.filter(exercise => 
            exercise.name.toLowerCase().includes(query.toLowerCase()) ||
            exercise.muscleGroups.some(muscle => 
                muscle.toLowerCase().includes(query.toLowerCase())
            )
        );
    }

    displayExercises() {
        const container = document.getElementById('exercise-list');
        if (!container) return;

        const exercises = this.getExercisesByCategory(this.currentFilter);
        
        container.innerHTML = exercises.map(exercise => this.createExerciseCard(exercise)).join('');
        
        // Bind click events for exercise selection
        this.bindExerciseCardEvents();
    }

    createExerciseCard(exercise) {
        const isSelected = this.selectedExercises.has(exercise.id);
        const selectedClass = isSelected ? 'selected' : '';
        
        return `
            <div class="exercise-card ${selectedClass}" data-exercise-id="${exercise.id}">
                <img src="${exercise.imagePath}" alt="${exercise.name}" 
                     onerror="this.src='assets/exercises/placeholder.jpg'">
                <h3>${exercise.name}</h3>
                <p>${exercise.instructions}</p>
                <div class="exercise-meta">
                    <span class="difficulty ${exercise.difficulty}">${exercise.difficulty}</span>
                    <span class="muscle-groups">${exercise.muscleGroups.join(', ')}</span>
                </div>
            </div>
        `;
    }

    bindExerciseCardEvents() {
        const exerciseCards = document.querySelectorAll('.exercise-card');
        exerciseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const exerciseId = card.dataset.exerciseId;
                this.toggleExerciseSelection(exerciseId);
                card.classList.toggle('selected');
                this.updateSelectionCount();
            });
        });
    }

    toggleExerciseSelection(exerciseId) {
        if (this.selectedExercises.has(exerciseId)) {
            this.selectedExercises.delete(exerciseId);
        } else {
            this.selectedExercises.add(exerciseId);
        }
    }

    getSelectedExercises() {
        const selectedIds = Array.from(this.selectedExercises);
        return selectedIds.map(id => this.getExerciseById(id)).filter(Boolean);
    }

    clearSelection() {
        this.selectedExercises.clear();
        this.displayExercises();
        this.updateSelectionCount();
    }

    updateSelectionCount() {
        const count = this.selectedExercises.size;
        const previewBtn = document.getElementById('preview-workout-btn');
        
        if (previewBtn) {
            previewBtn.textContent = count > 0 ? `Preview Workout (${count})` : 'Select Exercises';
            previewBtn.disabled = count === 0;
        }
    }

    getRandomExercises(count, categories = ['all']) {
        let availableExercises = [];
        
        if (categories.includes('all')) {
            availableExercises = this.getAllExercises();
        } else {
            categories.forEach(category => {
                availableExercises.push(...this.getExercisesByCategory(category));
            });
        }
        
        return Utils.getRandomItems(availableExercises, count);
    }

    getBalancedWorkout(totalExercises) {
        // Create a balanced workout with exercises from different categories
        const exercisesPerCategory = Math.ceil(totalExercises / 4);
        const balancedExercises = [];
        
        // Get exercises from each main category
        ['upper', 'lower', 'core', 'cardio'].forEach(category => {
            const categoryExercises = Utils.getRandomItems(
                this.getExercisesByCategory(category), 
                exercisesPerCategory
            );
            balancedExercises.push(...categoryExercises);
        });
        
        // Shuffle and trim to exact count
        const shuffled = Utils.shuffleArray(balancedExercises);
        return shuffled.slice(0, totalExercises);
    }

    // Validation methods
    validateExerciseData(exercise) {
        const requiredFields = ['id', 'name', 'category', 'instructions', 'muscleGroups'];
        return requiredFields.every(field => exercise[field]);
    }

    exportExerciseData() {
        return JSON.stringify(this.exerciseDatabase, null, 2);
    }

    importExerciseData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            // Validate imported data structure
            if (this.validateImportedData(importedData)) {
                this.exerciseDatabase = { ...this.exerciseDatabase, ...importedData };
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to import exercise data:', error);
            return false;
        }
    }

    validateImportedData(data) {
        // Basic validation for imported exercise data
        return typeof data === 'object' && data !== null;
    }
}

// Make Exercises available globally
window.Exercises = new Exercises();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Exercises;
}