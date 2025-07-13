import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabataTimer } from './TabataTimer';

describe('TabataTimer', () => {
  test('renders timer with correct time formatting', () => {
    render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
      />
    );

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('WORK')).toBeInTheDocument();
  });

  test('formats time correctly for minutes and seconds', () => {
    render(
      <TabataTimer
        timeRemaining={90}
        phase="pairRest"
        isActive={true}
      />
    );

    expect(screen.getByText('1:30')).toBeInTheDocument();
  });

  test('displays correct phase text for work phase', () => {
    render(
      <TabataTimer
        timeRemaining={15}
        phase="work"
        isActive={true}
      />
    );

    expect(screen.getByText('WORK')).toBeInTheDocument();
  });

  test('displays correct phase text for rest phase', () => {
    render(
      <TabataTimer
        timeRemaining={10}
        phase="rest"
        isActive={true}
      />
    );

    expect(screen.getByText('REST')).toBeInTheDocument();
  });

  test('displays correct phase text for pair rest phase', () => {
    render(
      <TabataTimer
        timeRemaining={60}
        phase="pairRest"
        isActive={true}
      />
    );

    expect(screen.getByText('PAIR REST')).toBeInTheDocument();
  });

  test('displays done text for finished phase', () => {
    render(
      <TabataTimer
        timeRemaining={0}
        phase="finished"
        isActive={false}
      />
    );

    expect(screen.getByText('DONE!')).toBeInTheDocument();
  });

  test('applies correct CSS classes for active state', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
      />
    );

    const timerElement = container.querySelector('.tabata-timer');
    expect(timerElement).toHaveClass('work', 'active', 'size-large');
  });

  test('applies correct CSS classes for paused state', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={false}
      />
    );

    const timerElement = container.querySelector('.tabata-timer');
    expect(timerElement).toHaveClass('work', 'paused', 'size-large');
  });

  test('applies correct size classes', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
        size="small"
      />
    );

    const timerElement = container.querySelector('.tabata-timer');
    expect(timerElement).toHaveClass('size-small');
  });

  test('renders SVG elements correctly', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
      />
    );

    const svg = container.querySelector('.timer-svg');
    const backgroundCircle = container.querySelector('.timer-background');
    const progressCircle = container.querySelector('.timer-progress');

    expect(svg).toBeInTheDocument();
    expect(backgroundCircle).toBeInTheDocument();
    expect(progressCircle).toBeInTheDocument();
  });

  test('sets correct stroke color for work phase', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
      />
    );

    const progressCircle = container.querySelector('.timer-progress');
    expect(progressCircle).toHaveAttribute('stroke', '#e74c3c');
  });

  test('sets correct stroke color for rest phase', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={10}
        phase="rest"
        isActive={true}
      />
    );

    const progressCircle = container.querySelector('.timer-progress');
    expect(progressCircle).toHaveAttribute('stroke', '#27ae60');
  });

  test('sets correct stroke color for pair rest phase', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={60}
        phase="pairRest"
        isActive={true}
      />
    );

    const progressCircle = container.querySelector('.timer-progress');
    expect(progressCircle).toHaveAttribute('stroke', '#3498db');
  });

  test('sets correct stroke color for finished phase', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={0}
        phase="finished"
        isActive={false}
      />
    );

    const progressCircle = container.querySelector('.timer-progress');
    expect(progressCircle).toHaveAttribute('stroke', '#9b59b6');
  });

  test('calculates stroke dash offset correctly for half time', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={10} // Half of 20 second work period
        phase="work"
        isActive={true}
      />
    );

    const progressCircle = container.querySelector('.timer-progress');
    const strokeDashArray = progressCircle?.getAttribute('stroke-dasharray');
    const strokeDashOffset = progressCircle?.getAttribute('stroke-dashoffset');
    
    expect(strokeDashArray).toBeTruthy();
    expect(strokeDashOffset).toBeTruthy();
    
    // Half progress should result in half the circumference as offset
    const circumference = parseFloat(strokeDashArray!);
    const expectedOffset = circumference * 0.5;
    expect(Math.abs(parseFloat(strokeDashOffset!) - expectedOffset)).toBeLessThan(1);
  });

  test('shows countdown warning for last 3 seconds', () => {
    render(
      <TabataTimer
        timeRemaining={2}
        phase="work"
        isActive={true}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    const warningElement = document.querySelector('.countdown-warning');
    expect(warningElement).toBeInTheDocument();
  });

  test('does not show countdown warning for pair rest phase', () => {
    render(
      <TabataTimer
        timeRemaining={2}
        phase="pairRest"
        isActive={true}
      />
    );

    const warningElement = document.querySelector('.countdown-warning');
    expect(warningElement).not.toBeInTheDocument();
  });

  test('does not show countdown warning for times greater than 3', () => {
    render(
      <TabataTimer
        timeRemaining={5}
        phase="work"
        isActive={true}
      />
    );

    const warningElement = document.querySelector('.countdown-warning');
    expect(warningElement).not.toBeInTheDocument();
  });

  test('applies correct size styles for small timer', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
        size="small"
      />
    );

    const timerElement = container.querySelector('.tabata-timer');
    expect(timerElement).toHaveStyle({
      width: '120px',
      height: '120px'
    });
  });

  test('applies correct size styles for medium timer', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
        size="medium"
      />
    );

    const timerElement = container.querySelector('.tabata-timer');
    expect(timerElement).toHaveStyle({
      width: '180px',
      height: '180px'
    });
  });

  test('applies correct size styles for large timer', () => {
    const { container } = render(
      <TabataTimer
        timeRemaining={20}
        phase="work"
        isActive={true}
        size="large"
      />
    );

    const timerElement = container.querySelector('.tabata-timer');
    expect(timerElement).toHaveStyle({
      width: '240px',
      height: '240px'
    });
  });
});