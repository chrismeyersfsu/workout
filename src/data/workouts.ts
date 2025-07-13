import { TabataWorkout, Exercise, WorkoutPair } from '../types/workout';

const exercises: Record<string, Exercise> = {
  burpees: { name: 'Burpees', description: 'Full body explosive movement' },
  pushUps: { name: 'Push-ups', description: 'Upper body strength exercise' },
  jumpingJacks: { name: 'Jumping Jacks', description: 'Full body cardio movement' },
  mountainClimbers: { name: 'Mountain Climbers', description: 'Core and cardio exercise' },
  squats: { name: 'Squats', description: 'Lower body strength exercise' },
  lunges: { name: 'Lunges', description: 'Single leg strength exercise' },
  plankJacks: { name: 'Plank Jacks', description: 'Core stability with cardio' },
  highKnees: { name: 'High Knees', description: 'Running in place with high knees' },
  buttKicks: { name: 'Butt Kicks', description: 'Running in place kicking heels to glutes' },
  jumpSquats: { name: 'Jump Squats', description: 'Explosive lower body exercise' },
  tricepDips: { name: 'Tricep Dips', description: 'Upper body tricep focused exercise' },
  russianTwists: { name: 'Russian Twists', description: 'Core rotational exercise' },
  wallSit: { name: 'Wall Sit', description: 'Isometric lower body exercise' },
  bicycleCrunches: { name: 'Bicycle Crunches', description: 'Core exercise with rotation' },
  jumpingLunges: { name: 'Jumping Lunges', description: 'Explosive alternating lunges' },
  deadBugs: { name: 'Dead Bugs', description: 'Core stability exercise' },
};

export const predefinedWorkouts: TabataWorkout[] = [
  {
    id: 'full-body-blast',
    name: 'Full Body Blast',
    description: 'Complete full body workout hitting all major muscle groups',
    rounds: 8,
    restBetweenPairs: 60,
    pairs: [
      { exerciseA: exercises.burpees, exerciseB: exercises.pushUps },
      { exerciseA: exercises.jumpSquats, exerciseB: exercises.mountainClimbers },
      { exerciseA: exercises.jumpingLunges, exerciseB: exercises.plankJacks },
      { exerciseA: exercises.russianTwists, exerciseB: exercises.tricepDips },
    ],
  },
  {
    id: 'cardio-crusher',
    name: 'Cardio Crusher',
    description: 'High intensity cardio focused workout',
    rounds: 8,
    restBetweenPairs: 45,
    pairs: [
      { exerciseA: exercises.jumpingJacks, exerciseB: exercises.highKnees },
      { exerciseA: exercises.buttKicks, exerciseB: exercises.mountainClimbers },
      { exerciseA: exercises.burpees, exerciseB: exercises.jumpSquats },
      { exerciseA: exercises.jumpingLunges, exerciseB: exercises.plankJacks },
    ],
  },
  {
    id: 'core-crusher',
    name: 'Core Crusher',
    description: 'Intense core and abdominal focused workout',
    rounds: 8,
    restBetweenPairs: 30,
    pairs: [
      { exerciseA: exercises.plankJacks, exerciseB: exercises.russianTwists },
      { exerciseA: exercises.bicycleCrunches, exerciseB: exercises.deadBugs },
      { exerciseA: exercises.mountainClimbers, exerciseB: exercises.burpees },
    ],
  },
  {
    id: 'lower-body-burn',
    name: 'Lower Body Burn',
    description: 'Leg and glute focused strength workout',
    rounds: 8,
    restBetweenPairs: 45,
    pairs: [
      { exerciseA: exercises.squats, exerciseB: exercises.jumpSquats },
      { exerciseA: exercises.lunges, exerciseB: exercises.jumpingLunges },
      { exerciseA: exercises.wallSit, exerciseB: exercises.buttKicks },
    ],
  },
  {
    id: 'upper-body-power',
    name: 'Upper Body Power',
    description: 'Upper body strength and endurance workout',
    rounds: 8,
    restBetweenPairs: 45,
    pairs: [
      { exerciseA: exercises.pushUps, exerciseB: exercises.tricepDips },
      { exerciseA: exercises.burpees, exerciseB: exercises.plankJacks },
      { exerciseA: exercises.mountainClimbers, exerciseB: exercises.russianTwists },
    ],
  },
  {
    id: 'beginners-start',
    name: 'Beginner\'s Start',
    description: 'Perfect introduction to tabata training',
    rounds: 6,
    restBetweenPairs: 60,
    pairs: [
      { exerciseA: exercises.jumpingJacks, exerciseB: exercises.squats },
      { exerciseA: exercises.pushUps, exerciseB: exercises.lunges },
      { exerciseA: exercises.highKnees, exerciseB: exercises.wallSit },
    ],
  },
  {
    id: 'hiit-heaven',
    name: 'HIIT Heaven',
    description: 'Maximum intensity interval training',
    rounds: 8,
    restBetweenPairs: 30,
    pairs: [
      { exerciseA: exercises.burpees, exerciseB: exercises.jumpSquats },
      { exerciseA: exercises.mountainClimbers, exerciseB: exercises.jumpingLunges },
      { exerciseA: exercises.plankJacks, exerciseB: exercises.tricepDips },
      { exerciseA: exercises.russianTwists, exerciseB: exercises.bicycleCrunches },
    ],
  },
  {
    id: 'quick-blast',
    name: 'Quick Blast',
    description: 'Short but intense 10-minute workout',
    rounds: 6,
    restBetweenPairs: 30,
    pairs: [
      { exerciseA: exercises.jumpingJacks, exerciseB: exercises.pushUps },
      { exerciseA: exercises.squats, exerciseB: exercises.mountainClimbers },
    ],
  },
];

export function validateWorkout(workout: TabataWorkout): boolean {
  if (!workout.id || !workout.name || !workout.pairs || workout.pairs.length === 0) {
    return false;
  }
  
  if (workout.rounds <= 0 || workout.restBetweenPairs < 0) {
    return false;
  }
  
  return workout.pairs.every(pair => 
    pair.exerciseA?.name && pair.exerciseB?.name
  );
}

export function validateWorkoutPair(pair: WorkoutPair): boolean {
  return !!(pair.exerciseA?.name && pair.exerciseB?.name);
}

export function validateExercise(exercise: Exercise): boolean {
  return !!(exercise.name && exercise.name.trim().length > 0);
}