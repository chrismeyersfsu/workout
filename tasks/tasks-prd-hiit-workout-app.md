# Tasks for HIIT Workout App Implementation

## Relevant Files

- `src/data/exercises.md` - Markdown file containing the exercise database with categorized bodyweight exercises
- `src/data/workouts.js` - Pre-built workout configurations for quick-start options
- `src/components/WorkoutSelector.jsx` - Component for selecting workout style (Tabata/HIIT) and duration
- `src/components/ExerciseSelector.jsx` - Component for custom workout creation and exercise selection
- `src/components/WorkoutTimer.jsx` - Main timer component with exercise display and controls
- `src/components/ExerciseDisplay.jsx` - Component showing current exercise, image, and instructions
- `src/utils/workoutGenerator.js` - Logic for generating balanced workouts and exercise selection
- `src/utils/timerUtils.js` - Timer functionality and interval calculations
- `src/utils/audioUtils.js` - Audio countdown alerts and cues
- `src/hooks/useWorkoutTimer.js` - Custom hook for managing workout state and timing
- `src/styles/mobile.css` - Mobile-optimized responsive styles
- `public/images/exercises/` - Directory for exercise demonstration images/GIFs

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `WorkoutTimer.jsx` and `WorkoutTimer.test.jsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Exercise images should be optimized for mobile loading and stored in categorized subdirectories.

## Tasks

- [ ] 1.0 Set up Exercise Database and Data Management
  - [x] 1.1 Create markdown file structure for exercise database with categories (upper body, lower body, core, full body, cardio)
  - [x] 1.2 Populate exercise database with comprehensive bodyweight exercises including names, descriptions, and image references
  - [x] 1.3 Implement exercise data parser to convert markdown to JavaScript objects
  - [x] 1.4 Create utility functions for filtering exercises by category and selecting random exercises
  - [x] 1.5 Add exercise validation to ensure all required fields are present

- [ ] 2.0 Implement Workout Selection Interface
  - [ ] 2.1 Create workout style selector component (Tabata vs HIIT) with clear visual differentiation
  - [ ] 2.2 Implement duration selection (10, 15, 20, 30 minutes) with mobile-friendly buttons
  - [ ] 2.3 Build quick-start workout grid displaying 10 pre-built Tabata and 10 HIIT workouts
  - [ ] 2.4 Create workout preview functionality showing exercise list and timing structure
  - [ ] 2.5 Implement navigation between workout selection and custom creation modes

- [ ] 3.0 Build Custom Workout Creator
  - [ ] 3.1 Design exercise selection interface with category filtering and search functionality
  - [ ] 3.2 Implement drag-and-drop or tap-to-add exercise selection for mobile devices
  - [ ] 3.3 Create selected exercise list with reordering and removal capabilities
  - [ ] 3.4 Build intelligent workout generator to fill remaining time when user hasn't selected enough exercises
  - [ ] 3.5 Add workout validation to ensure balanced muscle group distribution
  - [ ] 3.6 Implement save/load functionality for custom workouts using local storage

- [ ] 4.0 Develop Core Timer and Exercise Display System
  - [ ] 4.1 Create accurate countdown timer with precise interval timing (20s work, 10s rest for Tabata)
  - [ ] 4.2 Implement exercise display component showing current exercise name, image, and instructions
  - [ ] 4.3 Build workout navigation controls (pause, resume, skip, end workout)
  - [ ] 4.4 Create exercise transition animations and visual countdown indicators
  - [ ] 4.5 Implement workout progress tracking showing current exercise, round, and overall progress
  - [ ] 4.6 Add rest period displays with longer breaks between exercise circuits

- [ ] 5.0 Implement Mobile-Optimized UI and Audio Features
  - [ ] 5.1 Design responsive mobile-first layout with thumb-friendly navigation and large touch targets
  - [ ] 5.2 Implement high-contrast timer display optimized for readability during intense activity
  - [ ] 5.3 Create audio countdown alerts for exercise transitions and interval changes
  - [ ] 5.4 Optimize exercise images for fast mobile loading with appropriate compression
  - [ ] 5.5 Ensure smooth performance across modern mobile browsers (Chrome, Safari, Firefox)
  - [ ] 5.6 Add visual hierarchy emphasizing current exercise and timer information