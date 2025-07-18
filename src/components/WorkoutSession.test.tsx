import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutSession } from './WorkoutSession';
import { TabataWorkout } from '../types/workout';

// Mock the useTabataTimer hook
jest.mock('../hooks/useTabataTimer', () => ({
  useTabataTimer: jest.fn(),
}));

// Mock the TabataTimer component
jest.mock('./TabataTimer', () => ({
  TabataTimer: ({ timeRemaining, phase, isActive }: any) => (
    <div data-testid="tabata-timer">
      Timer: {timeRemaining}s - {phase} - {isActive ? 'active' : 'inactive'}
    </div>
  ),
}));

const mockWorkout: TabataWorkout = {
  id: 'test-workout',
  name: 'Test Workout',
  description: 'A test workout',
  rounds: 8,
  restBetweenPairs: 60,
  pairs: [
    {
      exerciseA: { name: 'Burpees', description: 'Full body movement' },
      exerciseB: { name: 'Push-ups', description: 'Upper body exercise' }
    },
    {
      exerciseA: { name: 'Squats', description: 'Lower body exercise' },
      exerciseB: { name: 'Lunges', description: 'Single leg exercise' }
    }
  ]
};

const mockTimerState = {
  isActive: false,
  isPaused: false,
  currentPhase: 'work' as const,
  timeRemaining: 20,
  currentRound: 1,
  currentPairIndex: 0,
};

const mockTimerHook = {
  timerState: mockTimerState,
  startTimer: jest.fn(),
  pauseTimer: jest.fn(),
  stopTimer: jest.fn(),
  resetTimer: jest.fn(),
  isWorkoutComplete: false,
  currentExercise: 'A' as const,
  progressPercentage: 0,
};

const mockOnWorkoutComplete = jest.fn();
const mockOnWorkoutExit = jest.fn();

describe('WorkoutSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(mockTimerHook);
  });

  test('renders workout session with workout name and progress', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('Test Workout')).toBeInTheDocument();
    expect(screen.getByText('Pair 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Round 1 of 8')).toBeInTheDocument();
  });

  test('displays progress bar', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    
    expect(progressBar).toBeInTheDocument();
    expect(progressFill).toBeInTheDocument();
    expect(progressFill).toHaveStyle('width: 0%');
  });

  test('displays current exercise during work phase', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('Burpees')).toBeInTheDocument();
    expect(screen.getByText('Full body movement')).toBeInTheDocument();
    expect(screen.getByText('A: Burpees')).toBeInTheDocument();
    expect(screen.getByText('B: Push-ups')).toBeInTheDocument();
  });

  test('displays correct phase indicator', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('WORK')).toBeInTheDocument();
  });

  test('shows start button when timer is not active', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const startButton = screen.getByText('Start');
    expect(startButton).toBeInTheDocument();
    
    fireEvent.click(startButton);
    expect(mockTimerHook.startTimer).toHaveBeenCalled();
  });

  test('shows pause button when timer is active', () => {
    const activeTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, isActive: true }
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(activeTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const pauseButton = screen.getByText('Pause');
    expect(pauseButton).toBeInTheDocument();
    
    fireEvent.click(pauseButton);
    expect(mockTimerHook.pauseTimer).toHaveBeenCalled();
  });

  test('shows resume button when timer is paused', () => {
    const pausedTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, isPaused: true }
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(pausedTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const resumeButton = screen.getByText('Resume');
    expect(resumeButton).toBeInTheDocument();
    
    fireEvent.click(resumeButton);
    expect(mockTimerHook.startTimer).toHaveBeenCalled();
  });

  test('shows reset button when timer is active or paused', () => {
    const activeTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, isActive: true }
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(activeTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
    
    fireEvent.click(resetButton);
    expect(mockTimerHook.resetTimer).toHaveBeenCalled();
  });

  test('displays rest phase correctly', () => {
    const restTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, currentPhase: 'rest' as const },
      currentExercise: 'B' as const
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(restTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('REST')).toBeInTheDocument();
    expect(screen.getByText('Push-ups')).toBeInTheDocument(); // Exercise B
  });

  test('displays pair rest phase correctly', () => {
    const pairRestTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, currentPhase: 'pairRest' as const },
      currentExercise: null
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(pairRestTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('REST BETWEEN EXERCISES')).toBeInTheDocument();
    expect(screen.getByText('Rest Time')).toBeInTheDocument();
    expect(screen.getByText('Get ready for the next exercise')).toBeInTheDocument();
  });

  test('shows next pair preview during pair rest', () => {
    const pairRestTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, currentPhase: 'pairRest' as const, currentPairIndex: 0 },
      currentExercise: null
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(pairRestTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('Next Exercises:')).toBeInTheDocument();
    expect(screen.getByText('A: Squats')).toBeInTheDocument();
    expect(screen.getByText('B: Lunges')).toBeInTheDocument();
  });

  test('displays completion screen when workout is finished', () => {
    const finishedTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, currentPhase: 'finished' as const },
      isWorkoutComplete: true,
      currentExercise: null
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(finishedTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    expect(screen.getByText('WORKOUT COMPLETE!')).toBeInTheDocument();
    expect(screen.getByText('🎉 Congratulations! 🎉')).toBeInTheDocument();
    expect(screen.getByText("You've completed the Test Workout workout!")).toBeInTheDocument();
    
    // Check completion stats
    expect(screen.getByText('2')).toBeInTheDocument(); // Exercises
    expect(screen.getByText('8')).toBeInTheDocument(); // Rounds Each
    expect(screen.getByText('16')).toBeInTheDocument(); // Total Rounds
  });

  test('shows do again button when workout is complete', () => {
    const finishedTimerHook = {
      ...mockTimerHook,
      timerState: { ...mockTimerState, currentPhase: 'finished' as const },
      isWorkoutComplete: true
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(finishedTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const doAgainButton = screen.getByText('Do Again');
    expect(doAgainButton).toBeInTheDocument();
    
    fireEvent.click(doAgainButton);
    expect(mockTimerHook.resetTimer).toHaveBeenCalled();
  });

  test('calls onWorkoutComplete when workout finishes', async () => {
    const finishedTimerHook = {
      ...mockTimerHook,
      isWorkoutComplete: true
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(finishedTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    await waitFor(() => {
      expect(mockOnWorkoutComplete).toHaveBeenCalled();
    });
  });

  test('calls onWorkoutExit when exit button is clicked', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const exitButton = screen.getByText('Exit');
    fireEvent.click(exitButton);
    
    expect(mockTimerHook.stopTimer).toHaveBeenCalled();
    expect(mockOnWorkoutExit).toHaveBeenCalled();
  });

  test('updates progress bar based on progress percentage', () => {
    const progressTimerHook = {
      ...mockTimerHook,
      progressPercentage: 45
    };
    (require('../hooks/useTabataTimer').useTabataTimer as jest.Mock).mockReturnValue(progressTimerHook);

    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 45%');
  });

  test('highlights active exercise indicator', () => {
    render(
      <WorkoutSession 
        workout={mockWorkout}
        onWorkoutComplete={mockOnWorkoutComplete}
        onWorkoutExit={mockOnWorkoutExit}
      />
    );

    const exerciseLabels = document.querySelectorAll('.exercise-label');
    expect(exerciseLabels[0]).toHaveClass('active'); // Exercise A should be active
    expect(exerciseLabels[1]).not.toHaveClass('active'); // Exercise B should not be active
  });
});