export interface Exercise {
  name: string;
  description?: string;
}

export interface WorkoutPair {
  exerciseA: Exercise;
  exerciseB: Exercise;
}

export interface TabataWorkout {
  id: string;
  name: string;
  description?: string;
  pairs: WorkoutPair[];
  rounds: number; // Number of 20s/10s cycles per pair
  restBetweenPairs: number; // Rest time in seconds between pairs
}

export interface WorkoutProgress {
  workoutId: string;
  currentPairIndex: number;
  currentRound: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: 'work' | 'rest' | 'pairRest' | 'finished';
  timeRemaining: number;
  currentRound: number;
  currentPairIndex: number;
}