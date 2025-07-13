import React from 'react';

export interface AudioSettings {
  enabled: boolean;
  volume: number; // 0 to 1
}

export type AudioCueType = 'workStart' | 'restStart' | 'pairRestStart' | 'workoutComplete' | 'countdown' | 'warning';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.7
  };
  private readonly SETTINGS_KEY = 'tabata-audio-settings';

  constructor() {
    this.loadSettings();
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.audioContext = null;
    }
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public setEnabled(enabled: boolean): void {
    this.updateSettings({ enabled });
  }

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateSettings({ volume: clampedVolume });
  }

  private async ensureAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise(async (resolve) => {
      if (!this.settings.enabled || !this.audioContext) {
        resolve();
        return;
      }

      try {
        await this.ensureAudioContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.settings.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);

        oscillator.onended = () => resolve();
      } catch (error) {
        console.warn('Failed to create beep:', error);
        resolve();
      }
    });
  }

  private async createMultiBeep(frequencies: number[], duration: number, gap: number = 0.1): Promise<void> {
    for (let i = 0; i < frequencies.length; i++) {
      await this.createBeep(frequencies[i], duration);
      if (i < frequencies.length - 1) {
        await this.delay(gap * 1000);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async playCue(type: AudioCueType): Promise<void> {
    if (!this.settings.enabled) return;

    try {
      switch (type) {
        case 'workStart':
          // Higher pitched, energetic beep for work start
          await this.createBeep(800, 0.3, 'square');
          break;

        case 'restStart':
          // Lower pitched, calming beep for rest start
          await this.createBeep(400, 0.4, 'sine');
          break;

        case 'pairRestStart':
          // Double beep for pair rest
          await this.createMultiBeep([600, 400], 0.3, 0.2);
          break;

        case 'workoutComplete':
          // Victory fanfare - ascending beeps
          await this.createMultiBeep([440, 554, 659, 880], 0.4, 0.1);
          break;

        case 'countdown':
          // Sharp, attention-grabbing beep for countdown
          await this.createBeep(1000, 0.2, 'square');
          break;

        case 'warning':
          // Urgent warning sound - fast repeated beeps
          await this.createMultiBeep([900, 900, 900], 0.15, 0.05);
          break;

        default:
          console.warn('Unknown audio cue type:', type);
      }
    } catch (error) {
      console.warn('Failed to play audio cue:', error);
    }
  }

  public async playCountdown(seconds: number): Promise<void> {
    if (!this.settings.enabled || seconds <= 0) return;

    for (let i = seconds; i > 0; i--) {
      if (i <= 3) {
        await this.playCue('countdown');
      }
      if (i > 1) {
        await this.delay(1000);
      }
    }
  }

  public async testAudio(): Promise<boolean> {
    try {
      await this.playCue('workStart');
      return true;
    } catch (error) {
      console.warn('Audio test failed:', error);
      return false;
    }
  }

  public dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Hook for React components
export const useAudioManager = () => {
  const [settings, setSettings] = React.useState<AudioSettings>(audioManager.getSettings());

  const updateAudioSettings = (newSettings: Partial<AudioSettings>) => {
    audioManager.updateSettings(newSettings);
    setSettings(audioManager.getSettings());
  };

  const playCue = (type: AudioCueType) => {
    return audioManager.playCue(type);
  };

  const testAudio = () => {
    return audioManager.testAudio();
  };

  return {
    settings,
    updateSettings: updateAudioSettings,
    playCue,
    testAudio,
    setEnabled: (enabled: boolean) => updateAudioSettings({ enabled }),
    setVolume: (volume: number) => updateAudioSettings({ volume })
  };
};

// For non-React usage
export { audioManager as default };