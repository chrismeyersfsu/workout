# Tabata Workout App

A Vue.js-based Tabata workout timer application that provides structured high-intensity interval training (HIIT) workouts.

## Features

- **Multiple Predefined Workouts**: 8 different workout routines targeting various muscle groups
- **Interactive Timer**: Full-featured Tabata timer with start, pause, and reset functionality
- **Visual Progress Tracking**: Real-time progress indicators for rounds and exercise pairs
- **Exercise Guidance**: Clear display of current exercises during work phases
- **Responsive Design**: Works on desktop and mobile devices

## Workout Types

1. **Full Body Blast** - Complete full body workout (4 pairs, 8 rounds each)
2. **Cardio Crusher** - High intensity cardio focused (4 pairs, 8 rounds each)
3. **Core Crusher** - Intense core and abdominal workout (3 pairs, 8 rounds each)
4. **Lower Body Burn** - Leg and glute focused strength (3 pairs, 8 rounds each)
5. **Upper Body Power** - Upper body strength and endurance (3 pairs, 8 rounds each)
6. **Beginner's Start** - Perfect introduction to Tabata (3 pairs, 6 rounds each)
7. **HIIT Heaven** - Maximum intensity interval training (4 pairs, 8 rounds each)
8. **Quick Blast** - Short but intense 10-minute workout (2 pairs, 6 rounds each)

## How Tabata Works

Tabata is a high-intensity interval training protocol that consists of:
- **20 seconds** of intense exercise (work phase)
- **10 seconds** of rest
- Repeated for multiple rounds per exercise pair
- Rest periods between different exercise pairs

Each workout follows this pattern:
1. Select an exercise pair (Exercise A and Exercise B)
2. Perform Exercise A for 20 seconds, rest for 10 seconds
3. Perform Exercise B for 20 seconds, rest for 10 seconds
4. Repeat for the specified number of rounds
5. Take a longer rest between pairs
6. Move to the next exercise pair

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workout
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Usage

1. **Select a Workout**: Choose from one of the 8 predefined workouts by clicking on a workout card
2. **Start Your Session**: Click the "Start Workout" button to begin
3. **Follow the Timer**: 
   - Work hard during the 20-second work phases
   - Rest during the 10-second rest phases
   - Take longer breaks between exercise pairs
4. **Control Your Workout**: Use pause/resume and reset controls as needed
5. **Complete or Exit**: Finish the entire workout or exit early using the exit button

## Project Structure

```
src/
├── components/          # React components (legacy - not currently used)
│   ├── TabataTimer.tsx
│   ├── WorkoutSelector.tsx
│   └── WorkoutSession.tsx
├── data/
│   └── workouts.ts     # Predefined workout data
├── hooks/              # Custom React hooks (legacy)
├── types/
│   └── workout.ts      # TypeScript type definitions
├── utils/
│   └── audioManager.ts # Audio cues functionality
├── App.vue             # Main Vue.js application component
└── main.ts             # Application entry point
```

## Technologies Used

- **Vue 3** - Frontend framework with Composition API
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Vitest** - Testing framework
- **ESLint** - Code linting

## Exercise Library

The app includes a variety of bodyweight exercises:

**Cardio Exercises:**
- Burpees, Jumping Jacks, High Knees, Butt Kicks, Mountain Climbers

**Strength Exercises:**
- Push-ups, Squats, Lunges, Tricep Dips, Jump Squats, Jumping Lunges

**Core Exercises:**
- Plank Jacks, Russian Twists, Bicycle Crunches, Dead Bugs, Wall Sit

## Customization

To add new workouts or exercises:

1. Edit `src/data/workouts.ts` to add new exercises to the `exercises` object
2. Create new workout configurations in the `predefinedWorkouts` array
3. Follow the existing pattern for exercise pairs and timing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Health and Safety

- Consult with a healthcare provider before starting any new exercise program
- Listen to your body and modify exercises as needed
- Stay hydrated during workouts
- Stop exercising if you feel dizzy, nauseous, or experience pain