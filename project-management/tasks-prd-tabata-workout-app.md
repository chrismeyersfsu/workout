## Relevant Files

- `src/types/workout.ts` - TypeScript interfaces for workout-related data structures (Exercise, WorkoutPair, TabataWorkout, WorkoutProgress, TimerState)
- `src/data/workouts.ts` - Contains the 8 predefined tabata workouts, exercise definitions, and validation functions
- `src/data/workouts.test.ts` - Unit tests for workout data validation
- `src/components/WorkoutSelector.tsx` - Main workout selection interface component with preview functionality, completion tracking, and overall progress display
- `src/components/WorkoutSelector.test.tsx` - Unit tests for workout selector
- `src/components/TabataTimer.tsx` - Core timer component with visual countdown display and phase-based color indicators
- `src/components/TabataTimer.test.tsx` - Unit tests for timer functionality
- `src/components/WorkoutSession.tsx` - Main workout execution component with timer controls, enhanced progress indicators, audio integration, and user controls
- `src/components/WorkoutSession.test.tsx` - Unit tests for workout session
- `src/hooks/useTabataTimer.ts` - Custom hook for timer logic with 20s/10s intervals, automatic transitions, and improved accuracy
- `src/hooks/useTabataTimer.test.ts` - Unit tests for timer hook
- `src/hooks/useWorkoutProgress.ts` - Custom hook for tracking workout completion with localStorage persistence
- `src/hooks/useWorkoutProgress.test.ts` - Unit tests for progress tracking
- `src/utils/audioManager.ts` - Audio cue management utilities with Web Audio API integration, settings persistence, and comprehensive sound effects
- `src/utils/audioManager.test.ts` - Unit tests for audio functionality
- `src/utils/workoutCalculations.ts` - Utility functions for calculating total workout time and duration displays with proper tabata protocol timing
- `src/utils/workoutCalculations.test.ts` - Unit tests for workout time calculations with comprehensive coverage

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Set up workout data structure and predefined workout definitions
  - [x] 1.1 Create TypeScript interfaces for Exercise, WorkoutPair, and TabataWorkout types
  - [x] 1.2 Define 8 predefined tabata workouts with exercise pairs
  - [x] 1.3 Implement data validation functions for workout structure
  - [x] 1.4 Create unit tests for workout data and validation functions
- [x] 2.0 Implement workout selection interface
  - [x] 2.1 Create WorkoutSelector component with list of 8 workouts
  - [x] 2.2 Implement workout preview functionality showing exercise pairs
  - [x] 2.3 Add workout completion status indicators
  - [x] 2.4 Add total workout time display for each workout
  - [x] 2.5 Create unit tests for workout selection component
- [x] 3.0 Build tabata timer and workout execution engine
  - [x] 3.1 Create useTabataTimer hook with 20s/10s interval logic
  - [x] 3.2 Implement WorkoutSession component for exercise execution
  - [x] 3.3 Add TabataTimer component with visual countdown display
  - [x] 3.4 Implement automatic transitions between exercise pairs
  - [x] 3.5 Add start, pause, and stop workout controls
  - [x] 3.6 Create unit tests for timer logic and workout session
- [x] 4.0 Create workout progress tracking and completion system
  - [x] 4.1 Create useWorkoutProgress hook for local storage management
  - [x] 4.2 Implement workout completion tracking across sessions
  - [x] 4.3 Add progress indicators showing current round and exercise pair
  - [x] 4.4 Create unit tests for progress tracking functionality
- [x] 5.0 Implement audio/visual cues and user controls
  - [x] 5.1 Create audioManager utility for workout interval sounds
  - [x] 5.2 Implement work/rest period visual indicators (colors)
  - [x] 5.3 Add audio controls (enable/disable sound)
  - [x] 5.4 Ensure timer accuracy and background execution
  - [x] 5.5 Create unit tests for audio and visual cue functionality
- [x] 6.0 Implement workout time calculations and display
  - [x] 6.1 Create workoutCalculations utility for total time computation
  - [x] 6.2 Calculate workout duration based on exercise pairs and tabata protocol
  - [x] 6.3 Display total workout time in workout selection interface
  - [x] 6.4 Create unit tests for workout time calculation functions
- [x] 7.0 Add rest time calculation and display functionality
  - [x] 7.1 Extend workoutCalculations utility to calculate total rest time per workout
    - [x] 7.1.1 Add calculateRestTime function that computes rest intervals between exercise pairs
    - [x] 7.1.2 Calculate total rest time: (pairs - 1) * 60 seconds + (pairs * 8 * 10 seconds)
    - [x] 7.1.3 Format rest time display in minutes and seconds (e.g., "3m 20s")
    - [x] 7.1.4 Export new rest time function from workoutCalculations module
  - [x] 7.2 Update WorkoutSelector component to display rest time alongside total time
    - [x] 7.2.1 Import calculateRestTime function into WorkoutSelector component
    - [x] 7.2.2 Add rest time display to workout card UI next to total time
    - [x] 7.2.3 Update component styling to accommodate both time displays
    - [x] 7.2.4 Ensure consistent formatting between total time and rest time displays
  - [x] 7.3 Create unit tests for rest time calculation functions
    - [x] 7.3.1 Add test cases for calculateRestTime with different workout pair counts
    - [x] 7.3.2 Verify rest time calculation accuracy against tabata protocol (10s rest per round)
    - [x] 7.3.3 Test rest time formatting for various durations
    - [x] 7.3.4 Add edge case tests for workouts with single exercise pairs