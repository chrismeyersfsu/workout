import { audioManager, AudioSettings } from './audioManager';

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn(),
    onended: null
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    }
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined)
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock AudioContext
(global as any).AudioContext = jest.fn(() => mockAudioContext);
(global as any).webkitAudioContext = jest.fn(() => mockAudioContext);

describe('AudioManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockAudioContext.createOscillator.mockReturnValue({
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn(),
      onended: null
    });
    mockAudioContext.createGain.mockReturnValue({
      connect: jest.fn(),
      gain: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      }
    });
  });

  test('initializes with default settings', () => {
    const settings = audioManager.getSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.volume).toBe(0.7);
  });

  test('loads settings from localStorage', () => {
    const storedSettings = { enabled: false, volume: 0.5 };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedSettings));
    
    // Create a new instance to test loading
    const testManager = new (audioManager.constructor as any)();
    const settings = testManager.getSettings();
    
    expect(settings.enabled).toBe(false);
    expect(settings.volume).toBe(0.5);
  });

  test('saves settings to localStorage when updated', () => {
    audioManager.updateSettings({ enabled: false });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tabata-audio-settings',
      expect.stringContaining('"enabled":false')
    );
  });

  test('updates settings correctly', () => {
    audioManager.updateSettings({ enabled: false, volume: 0.3 });
    
    const settings = audioManager.getSettings();
    expect(settings.enabled).toBe(false);
    expect(settings.volume).toBe(0.3);
  });

  test('setEnabled updates enabled setting', () => {
    audioManager.setEnabled(false);
    expect(audioManager.getSettings().enabled).toBe(false);
    
    audioManager.setEnabled(true);
    expect(audioManager.getSettings().enabled).toBe(true);
  });

  test('setVolume updates volume setting and clamps values', () => {
    audioManager.setVolume(0.8);
    expect(audioManager.getSettings().volume).toBe(0.8);
    
    audioManager.setVolume(1.5); // Should clamp to 1
    expect(audioManager.getSettings().volume).toBe(1);
    
    audioManager.setVolume(-0.2); // Should clamp to 0
    expect(audioManager.getSettings().volume).toBe(0);
  });

  test('playCue does nothing when audio is disabled', async () => {
    audioManager.setEnabled(false);
    
    await audioManager.playCue('workStart');
    
    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
  });

  test('playCue creates oscillator when audio is enabled', async () => {
    audioManager.setEnabled(true);
    
    // Mock the oscillator onended to resolve immediately
    const mockOscillator = {
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn(),
      onended: null
    };
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    
    const playPromise = audioManager.playCue('workStart');
    
    // Simulate oscillator ending
    if (mockOscillator.onended) {
      mockOscillator.onended({} as Event);
    }
    
    await playPromise;
    
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  test('playCue handles different cue types', async () => {
    audioManager.setEnabled(true);
    
    const mockOscillator = {
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn(),
      onended: null
    };
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    
    const cueTypes = ['workStart', 'restStart', 'pairRestStart', 'workoutComplete', 'countdown', 'warning'];
    
    for (const cueType of cueTypes) {
      const playPromise = audioManager.playCue(cueType as any);
      
      if (mockOscillator.onended) {
        mockOscillator.onended({} as Event);
      }
      
      await playPromise;
      
      expect(mockOscillator.start).toHaveBeenCalled();
      
      // Reset for next iteration
      jest.clearAllMocks();
      mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    }
  });

  test('testAudio returns true when audio works', async () => {
    audioManager.setEnabled(true);
    
    const mockOscillator = {
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn(),
      onended: null
    };
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    
    const testPromise = audioManager.testAudio();
    
    if (mockOscillator.onended) {
      mockOscillator.onended({} as Event);
    }
    
    const result = await testPromise;
    expect(result).toBe(true);
  });

  test('testAudio returns false when audio fails', async () => {
    audioManager.setEnabled(true);
    mockAudioContext.createOscillator.mockImplementation(() => {
      throw new Error('Audio context error');
    });
    
    const result = await audioManager.testAudio();
    expect(result).toBe(false);
  });

  test('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Create new instance to test error handling
    const testManager = new (audioManager.constructor as any)();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load audio settings:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  test('handles save errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage save error');
    });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    audioManager.updateSettings({ volume: 0.5 });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save audio settings:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  test('handles Web Audio API not supported', () => {
    // Temporarily remove AudioContext
    const originalAudioContext = (global as any).AudioContext;
    const originalWebkitAudioContext = (global as any).webkitAudioContext;
    delete (global as any).AudioContext;
    delete (global as any).webkitAudioContext;
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Create new instance to test error handling
    const testManager = new (audioManager.constructor as any)();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Web Audio API not supported:',
      expect.any(Error)
    );
    
    // Restore
    (global as any).AudioContext = originalAudioContext;
    (global as any).webkitAudioContext = originalWebkitAudioContext;
    consoleSpy.mockRestore();
  });

  test('resumes suspended audio context', async () => {
    mockAudioContext.state = 'suspended';
    audioManager.setEnabled(true);
    
    const mockOscillator = {
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn(),
      onended: null
    };
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    
    const playPromise = audioManager.playCue('workStart');
    
    if (mockOscillator.onended) {
      mockOscillator.onended({} as Event);
    }
    
    await playPromise;
    
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  test('dispose closes audio context', () => {
    audioManager.dispose();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  test('handles unknown cue type gracefully', async () => {
    audioManager.setEnabled(true);
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    await audioManager.playCue('unknownCue' as any);
    
    expect(consoleSpy).toHaveBeenCalledWith('Unknown audio cue type:', 'unknownCue');
    
    consoleSpy.mockRestore();
  });

  test('handles audio context resume errors gracefully', async () => {
    mockAudioContext.state = 'suspended';
    mockAudioContext.resume.mockRejectedValue(new Error('Resume failed'));
    audioManager.setEnabled(true);
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const mockOscillator = {
      connect: jest.fn(),
      frequency: { setValueAtTime: jest.fn() },
      type: 'sine',
      start: jest.fn(),
      stop: jest.fn(),
      onended: null
    };
    mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
    
    const playPromise = audioManager.playCue('workStart');
    
    if (mockOscillator.onended) {
      mockOscillator.onended({} as Event);
    }
    
    await playPromise;
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to resume audio context:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});