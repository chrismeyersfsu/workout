import { TabataWorkout } from '../types/workout';

/**
 * Calculate the total duration of a tabata workout in seconds
 * 
 * Tabata protocol:
 * - Each pair consists of alternating 20s work / 10s rest cycles
 * - Number of cycles per pair is determined by workout.rounds
 * - Rest between pairs is determined by workout.restBetweenPairs
 * 
 * @param workout The tabata workout to calculate duration for
 * @returns Total workout duration in seconds
 */
export function calculateWorkoutDuration(workout: TabataWorkout): number {
  if (!workout || !workout.pairs || workout.pairs.length === 0) {
    return 0;
  }

  const pairDuration = calculatePairDuration(workout.rounds);
  const totalPairTime = pairDuration * workout.pairs.length;
  
  // Rest between pairs (no rest after the last pair)
  const totalRestTime = workout.restBetweenPairs * Math.max(0, workout.pairs.length - 1);
  
  return totalPairTime + totalRestTime;
}

/**
 * Calculate the duration of a single exercise pair in seconds
 * 
 * @param rounds Number of 20s/10s cycles in the pair
 * @returns Duration of the pair in seconds
 */
export function calculatePairDuration(rounds: number): number {
  // Each round is 20s work + 10s rest = 30s total
  // The last round doesn't have rest, so subtract 10s
  return rounds * 30 - 10;
}

/**
 * Format workout duration as a human-readable string
 * 
 * @param durationInSeconds Total duration in seconds
 * @returns Formatted string like "12:30" or "1:05:30"
 */
export function formatWorkoutDuration(durationInSeconds: number): string {
  if (durationInSeconds < 0) {
    return "0:00";
  }

  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Format rest time as a human-readable string in minutes and seconds
 * 
 * @param restTimeInSeconds Total rest time in seconds
 * @returns Formatted string like "3m 20s" or "45s"
 */
export function formatRestTime(restTimeInSeconds: number): string {
  if (restTimeInSeconds < 0) {
    return "0s";
  }

  const minutes = Math.floor(restTimeInSeconds / 60);
  const seconds = restTimeInSeconds % 60;

  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Calculate the total rest time in a tabata workout in seconds
 * 
 * Rest time includes:
 * - 10s rest between each work interval within pairs (except after the last round of each pair)
 * - Rest between exercise pairs (60 seconds by default)
 * 
 * @param workout The tabata workout to calculate rest time for
 * @returns Total rest time in seconds
 */
export function calculateRestTime(workout: TabataWorkout): number {
  if (!workout || !workout.pairs || workout.pairs.length === 0) {
    return 0;
  }

  // Rest within pairs: 10s rest after each round except the last round of each pair
  const restWithinPairs = workout.pairs.length * (workout.rounds - 1) * 10;
  
  // Rest between pairs: no rest after the last pair
  const restBetweenPairs = workout.restBetweenPairs * Math.max(0, workout.pairs.length - 1);
  
  return restWithinPairs + restBetweenPairs;
}

/**
 * Get workout duration breakdown showing time spent in each phase
 * 
 * @param workout The tabata workout to analyze
 * @returns Object containing breakdown of time allocation
 */
export function getWorkoutBreakdown(workout: TabataWorkout) {
  if (!workout || !workout.pairs || workout.pairs.length === 0) {
    return {
      totalDuration: 0,
      workTime: 0,
      restTime: 0,
      pairRestTime: 0,
      pairs: workout?.pairs?.length || 0,
      rounds: workout?.rounds || 0
    };
  }

  const workTime = workout.pairs.length * workout.rounds * 20; // 20s work per round
  const restTime = workout.pairs.length * (workout.rounds - 1) * 10; // 10s rest per round (except last)
  const pairRestTime = workout.restBetweenPairs * Math.max(0, workout.pairs.length - 1);
  
  return {
    totalDuration: workTime + restTime + pairRestTime,
    workTime,
    restTime,
    pairRestTime,
    pairs: workout.pairs.length,
    rounds: workout.rounds
  };
}