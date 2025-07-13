import React from 'react';

interface TabataTimerProps {
  timeRemaining: number;
  phase: 'work' | 'rest' | 'pairRest' | 'finished';
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const TabataTimer: React.FC<TabataTimerProps> = ({
  timeRemaining,
  phase,
  isActive,
  size = 'large'
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return secs.toString();
  };

  const getCircumference = () => {
    const sizeMap = {
      small: 50,
      medium: 75,
      large: 100
    };
    const radius = sizeMap[size];
    return 2 * Math.PI * radius;
  };

  const getStrokeDashoffset = () => {
    const circumference = getCircumference();
    const totalTime = getTotalPhaseTime();
    if (totalTime === 0) return 0;
    
    const progress = (totalTime - timeRemaining) / totalTime;
    return circumference * (1 - progress);
  };

  const getTotalPhaseTime = (): number => {
    switch (phase) {
      case 'work':
        return 20;
      case 'rest':
        return 10;
      case 'pairRest':
        return 60;
      case 'finished':
        return 0;
      default:
        return 20;
    }
  };

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'work':
        return '#e74c3c'; // Red for work
      case 'rest':
        return '#27ae60'; // Green for rest
      case 'pairRest':
        return '#3498db'; // Blue for pair rest
      case 'finished':
        return '#9b59b6'; // Purple for finished
      default:
        return '#95a5a6'; // Gray default
    }
  };

  const getSizeStyles = () => {
    const sizeMap = {
      small: {
        width: '120px',
        height: '120px',
        fontSize: '1.5rem',
        strokeWidth: 4
      },
      medium: {
        width: '180px',
        height: '180px',
        fontSize: '2rem',
        strokeWidth: 6
      },
      large: {
        width: '240px',
        height: '240px',
        fontSize: '3rem',
        strokeWidth: 8
      }
    };
    return sizeMap[size];
  };

  const styles = getSizeStyles();
  const circumference = getCircumference();
  const strokeDashoffset = getStrokeDashoffset();
  const color = getPhaseColor();

  return (
    <div 
      className={`tabata-timer ${phase} ${isActive ? 'active' : 'paused'} size-${size}`}
      style={{ width: styles.width, height: styles.height }}
    >
      <svg 
        className="timer-svg" 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${parseInt(styles.width)} ${parseInt(styles.height)}`}
      >
        {/* Background circle */}
        <circle
          className="timer-background"
          cx="50%"
          cy="50%"
          r={parseInt(styles.width) / 2 - styles.strokeWidth}
          fill="none"
          stroke="#ecf0f1"
          strokeWidth={styles.strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          className="timer-progress"
          cx="50%"
          cy="50%"
          r={parseInt(styles.width) / 2 - styles.strokeWidth}
          fill="none"
          stroke={color}
          strokeWidth={styles.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${parseInt(styles.width) / 2} ${parseInt(styles.height) / 2})`}
          style={{
            transition: isActive ? 'stroke-dashoffset 1s linear' : 'none'
          }}
        />
      </svg>
      
      <div 
        className="timer-content"
        style={{ fontSize: styles.fontSize }}
      >
        <div className="timer-number">
          {formatTime(timeRemaining)}
        </div>
        
        {phase !== 'finished' && (
          <div className="timer-phase">
            {phase === 'work' && 'WORK'}
            {phase === 'rest' && 'REST'}
            {phase === 'pairRest' && 'PAIR REST'}
          </div>
        )}
        
        {phase === 'finished' && (
          <div className="timer-finished">
            DONE!
          </div>
        )}
      </div>
      
      {timeRemaining <= 3 && timeRemaining > 0 && phase !== 'pairRest' && (
        <div className="countdown-warning">
          {timeRemaining}
        </div>
      )}
    </div>
  );
};