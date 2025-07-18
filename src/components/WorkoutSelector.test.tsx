import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutSelector } from './WorkoutSelector';
import { predefinedWorkouts } from '../data/workouts';
import { WorkoutProgress } from '../types/workout';

const mockOnWorkoutSelect = jest.fn();

const defaultProps = {
  onWorkoutSelect: mockOnWorkoutSelect,
};

describe('WorkoutSelector', () => {
  beforeEach(() => {
    mockOnWorkoutSelect.mockClear();
  });

  test('renders workout selector with title', () => {
    render(<WorkoutSelector {...defaultProps} />);
    expect(screen.getByText('Choose Your Tabata Workout')).toBeInTheDocument();
    expect(screen.getByText('Select a workout to get started with your training session')).toBeInTheDocument();
  });

  test('displays all 8 predefined workouts', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    predefinedWorkouts.forEach(workout => {
      expect(screen.getByText(workout.name)).toBeInTheDocument();
    });
  });

  test('shows workout details correctly', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const firstWorkout = predefinedWorkouts[0];
    expect(screen.getByText(firstWorkout.description!)).toBeInTheDocument();
    expect(screen.getByText(`${firstWorkout.pairs.length} exercises`)).toBeInTheDocument();
    expect(screen.getByText(`${firstWorkout.rounds} rounds`)).toBeInTheDocument();
    expect(screen.getByText(`${firstWorkout.restBetweenPairs}s rest`)).toBeInTheDocument();
  });

  test('allows selecting a workout', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const firstWorkoutCard = screen.getByText(predefinedWorkouts[0].name).closest('.workout-card');
    fireEvent.click(firstWorkoutCard!);
    
    expect(firstWorkoutCard).toHaveClass('selected');
    expect(screen.getByText('Start Workout')).toBeInTheDocument();
  });

  test('calls onWorkoutSelect when start workout button is clicked', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const firstWorkoutCard = screen.getByText(predefinedWorkouts[0].name).closest('.workout-card');
    fireEvent.click(firstWorkoutCard!);
    
    const startButton = screen.getByText('Start Workout');
    fireEvent.click(startButton);
    
    expect(mockOnWorkoutSelect).toHaveBeenCalledWith(predefinedWorkouts[0]);
  });

  test('shows completion badge for completed workouts', () => {
    const workoutProgress: Record<string, WorkoutProgress> = {
      [predefinedWorkouts[0].id]: {
        workoutId: predefinedWorkouts[0].id,
        currentPairIndex: 0,
        currentRound: 0,
        isCompleted: true,
        completedAt: new Date(),
      },
    };

    render(<WorkoutSelector {...defaultProps} workoutProgress={workoutProgress} />);
    
    const firstWorkoutCard = screen.getByText(predefinedWorkouts[0].name).closest('.workout-card');
    expect(firstWorkoutCard).toHaveClass('completed');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('opens workout preview when preview button is clicked', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    expect(screen.getByText(predefinedWorkouts[0].name)).toBeInTheDocument();
    expect(screen.getByText('Exercises')).toBeInTheDocument();
  });

  test('preview shows correct workout details', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    const workout = predefinedWorkouts[0];
    expect(screen.getByText(`Rounds: ${workout.rounds} × 20s work / 10s rest per exercise`)).toBeInTheDocument();
    expect(screen.getByText(`Rest between pairs: ${workout.restBetweenPairs} seconds`)).toBeInTheDocument();
    
    workout.pairs.forEach((pair, index) => {
      expect(screen.getByText(`Pair ${index + 1}`)).toBeInTheDocument();
      expect(screen.getByText(pair.exerciseA.name)).toBeInTheDocument();
      expect(screen.getByText(pair.exerciseB.name)).toBeInTheDocument();
    });
  });

  test('closes preview when close button is clicked', async () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Exercises')).not.toBeInTheDocument();
    });
  });

  test('closes preview when overlay is clicked', async () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    const overlay = document.querySelector('.workout-preview-overlay');
    fireEvent.click(overlay!);
    
    await waitFor(() => {
      expect(screen.queryByText('Exercises')).not.toBeInTheDocument();
    });
  });

  test('prevents preview closure when clicking inside preview content', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    const previewContent = document.querySelector('.workout-preview');
    fireEvent.click(previewContent!);
    
    expect(screen.getByText('Exercises')).toBeInTheDocument();
  });

  test('prevents workout selection when preview button is clicked', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    const firstWorkoutCard = screen.getByText(predefinedWorkouts[0].name).closest('.workout-card');
    expect(firstWorkoutCard).not.toHaveClass('selected');
  });

  test('calculates total workout time correctly in preview', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    const previewButtons = screen.getAllByText('Preview Exercises');
    fireEvent.click(previewButtons[0]);
    
    const workout = predefinedWorkouts[0];
    const expectedTime = Math.ceil((workout.pairs.length * workout.rounds * 30 + workout.pairs.length * workout.restBetweenPairs) / 60);
    expect(screen.getByText(`Total time: ~${expectedTime} minutes`)).toBeInTheDocument();
  });

  test('displays individual exercises in workout cards', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    // Check that exercise list titles are present
    const exerciseListTitles = screen.getAllByText('Exercises:');
    expect(exerciseListTitles).toHaveLength(predefinedWorkouts.length);
    
    // Check that exercises from the first workout are displayed
    const firstWorkout = predefinedWorkouts[0];
    firstWorkout.pairs.forEach(pair => {
      expect(screen.getByText(pair.exerciseA.name)).toBeInTheDocument();
      expect(screen.getByText(pair.exerciseB.name)).toBeInTheDocument();
    });
  });

  test('displays exercises for all 8 predefined workouts', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    // Verify each workout displays its exercises
    predefinedWorkouts.forEach(workout => {
      workout.pairs.forEach(pair => {
        expect(screen.getByText(pair.exerciseA.name)).toBeInTheDocument();
        expect(screen.getByText(pair.exerciseB.name)).toBeInTheDocument();
      });
    });
  });

  test('formats exercise pairs with separator in workout cards', () => {
    render(<WorkoutSelector {...defaultProps} />);
    
    // Check for exercise separators (bullet points)
    const separators = screen.getAllByText('•');
    
    // Should have one separator per exercise pair across all workouts
    const totalPairs = predefinedWorkouts.reduce((sum, workout) => sum + workout.pairs.length, 0);
    expect(separators).toHaveLength(totalPairs);
  });
});