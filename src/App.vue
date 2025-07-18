<template>
  <div id="app">
    <div v-if="!selectedWorkout" class="workout-selector-container">
      <h1>Tabata Workout App</h1>
      <p>Welcome to your Tabata workout application!</p>
      <p>Choose a workout to get started:</p>
      
      <div class="workout-grid">
        <div 
          v-for="workout in workouts" 
          :key="workout.id"
          class="workout-card"
          :class="{ selected: selectedWorkoutId === workout.id }"
          @click="selectWorkout(workout.id)"
        >
          <h3>{{ workout.name }}</h3>
          <p>{{ workout.description }}</p>
          <div class="workout-details">
            <span>{{ workout.pairs.length }} exercises</span>
            <span>{{ workout.rounds }} rounds</span>
            <span>Rest: {{ workout.restBetweenPairs }}s</span>
            <span>{{ formatWorkoutDuration(calculateWorkoutDuration(workout)) }}</span>
          </div>
          
          <div class="exercise-list">
            <h4 class="exercise-list-title">Exercises:</h4>
            <div class="exercise-items">
              <div v-for="(pair, index) in workout.pairs" :key="index" class="exercise-pair-compact">
                <span class="exercise-compact">{{ pair.exerciseA.name }}</span>
                <span class="exercise-separator">•</span>
                <span class="exercise-compact">{{ pair.exerciseB.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        v-if="selectedWorkoutId" 
        @click="startWorkout"
        class="start-button"
      >
        Start Workout
      </button>
    </div>
    
    <div v-else class="workout-session-container">
      <div class="workout-header">
        <h1>{{ selectedWorkout.name }}</h1>
        <button @click="exitWorkout" class="exit-button">Exit</button>
      </div>
      
      <div class="timer-display">
        <div class="time">{{ formatTime(timeRemaining) }}</div>
        <div class="phase">{{ currentPhase.toUpperCase() }}</div>
        <div v-if="currentPhase === 'rest'" class="rest-info">
          Rest Time: {{ formatTime(timeRemaining) }}
        </div>
        <div v-if="currentPhase === 'pairRest'" class="rest-info">
          Rest Between Pairs: {{ formatTime(timeRemaining) }}
        </div>
        <div class="progress">
          Round {{ currentRound }} of {{ selectedWorkout.rounds }} | 
          Exercise {{ currentPairIndex + 1 }} of {{ selectedWorkout.pairs.length }}
        </div>
      </div>
      
      <div v-if="currentPhase === 'work'" class="exercise-display">
        <h2>{{ getCurrentExerciseName() }}</h2>
        <div class="exercise-pair-display">
          <div class="exercise-indicator">
            <span :class="['exercise-label', { active: currentExercise === 'A' }]">
              A: {{ selectedWorkout.pairs[currentPairIndex]?.exerciseA.name }}
            </span>
            <span :class="['exercise-label', { active: currentExercise === 'B' }]">
              B: {{ selectedWorkout.pairs[currentPairIndex]?.exerciseB.name }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="currentPhase === 'pairRest'" class="exercise-display">
        <h3>Rest Time</h3>
        <p>Get ready for the next exercise</p>
        <div v-if="currentPairIndex + 1 < selectedWorkout.pairs.length" class="next-pair-preview">
          <h4>Next Exercises:</h4>
          <div class="next-exercises">
            <span>A: {{ selectedWorkout.pairs[currentPairIndex + 1]?.exerciseA.name }}</span>
            <span>B: {{ selectedWorkout.pairs[currentPairIndex + 1]?.exerciseB.name }}</span>
          </div>
        </div>
      </div>
      
      <div class="controls">
        <button v-if="!isActive && !isFinished" @click="startTimer" class="control-button">
          {{ isPaused ? 'Resume' : 'Start' }}
        </button>
        <button v-if="isActive" @click="pauseTimer" class="control-button">Pause</button>
        <button v-if="isPaused || isActive" @click="resetTimer" class="control-button">Reset</button>
        
        <div class="audio-controls-section">
          <button @click="toggleAudioControls" class="control-button audio-button">
            🔊 Audio
          </button>
          <div v-if="isMobile && audioSettings.enabled" class="mobile-audio-notice">
            📱 On mobile, tap "Test Audio" to ensure sounds work
          </div>
          
          <div v-if="showAudioControls" class="audio-controls">
            <div class="audio-control-header">
              <h3>Audio Settings</h3>
              <button @click="showAudioControls = false" class="close-button">×</button>
            </div>
            
            <div class="audio-control-row">
              <label>
                <input
                  type="checkbox"
                  :checked="audioSettings.enabled"
                  @change="setAudioEnabled($event.target.checked)"
                />
                Enable Sound Effects
              </label>
            </div>
            
            <div v-if="audioSettings.enabled" class="audio-control-row">
              <label>
                Volume: {{ Math.round(audioSettings.volume * 100) }}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="audioSettings.volume"
                @input="setAudioVolume(parseFloat($event.target.value))"
                class="volume-slider"
              />
            </div>
            
            <div v-if="audioSettings.enabled" class="audio-control-row">
              <button @click="testAudio" class="control-button test-audio-button">
                {{ isMobile ? '📱 Test Audio (Required for Mobile)' : 'Test Audio' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { predefinedWorkouts } from './data/workouts'
import type { TabataWorkout } from './types/workout'
import { calculateWorkoutDuration, formatWorkoutDuration } from './utils/workoutCalculations'
import { audioManager } from './utils/audioManager'

const workouts = ref(predefinedWorkouts)
const selectedWorkoutId = ref<string | null>(null)
const selectedWorkout = ref<TabataWorkout | null>(null)

// Timer state
const timeRemaining = ref(0)
const currentPhase = ref<'work' | 'rest' | 'pairRest' | 'finished'>('work')
const currentRound = ref(1)
const currentPairIndex = ref(0)
const currentExercise = ref<'A' | 'B'>('A')
const isActive = ref(false)
const isPaused = ref(false)
const isFinished = ref(false)

let intervalId: number | null = null

// Audio settings
const audioSettings = ref(audioManager.getSettings())
const showAudioControls = ref(false)

// Track previous phase for audio cues
const previousPhase = ref<'work' | 'rest' | 'pairRest' | 'finished'>('work')

// Mobile detection
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

const selectWorkout = async (workoutId: string) => {
  selectedWorkoutId.value = workoutId
  // Initialize audio on any user interaction to prepare for mobile
  await audioManager.initializeAudioOnUserInteraction()
}

const startWorkout = async () => {
  const workout = workouts.value.find(w => w.id === selectedWorkoutId.value)
  if (workout) {
    // Initialize audio on mobile when starting workout
    await audioManager.initializeAudioOnUserInteraction()
    selectedWorkout.value = workout
    resetTimer()
  }
}

const exitWorkout = () => {
  stopTimer()
  selectedWorkout.value = null
  selectedWorkoutId.value = null
}

const startTimer = async () => {
  if (!selectedWorkout.value) return
  
  // Initialize audio on user interaction
  await audioManager.initializeAudioOnUserInteraction()
  
  isActive.value = true
  isPaused.value = false
  
  if (timeRemaining.value === 0) {
    timeRemaining.value = 20 // Work period
    currentPhase.value = 'work'
  }
  
  intervalId = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      
      // Countdown audio for last 3 seconds of work or rest
      if ((currentPhase.value === 'work' || currentPhase.value === 'rest') && 
          timeRemaining.value <= 3 && timeRemaining.value > 0) {
        audioManager.playCue('countdown')
      }
    } else {
      nextPhase()
    }
  }, 1000)
}

const pauseTimer = () => {
  isActive.value = false
  isPaused.value = true
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const stopTimer = () => {
  isActive.value = false
  isPaused.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const resetTimer = () => {
  stopTimer()
  timeRemaining.value = 20
  currentPhase.value = 'work'
  currentRound.value = 1
  currentPairIndex.value = 0
  currentExercise.value = 'A'
  isFinished.value = false
}

const nextPhase = () => {
  if (!selectedWorkout.value) return
  
  previousPhase.value = currentPhase.value
  
  if (currentPhase.value === 'work') {
    currentPhase.value = 'rest'
    timeRemaining.value = 10
    currentExercise.value = currentExercise.value === 'A' ? 'B' : 'A'
    audioManager.playCue('restStart')
  } else if (currentPhase.value === 'rest') {
    if (currentExercise.value === 'A') {
      currentPhase.value = 'work'
      timeRemaining.value = 20
      audioManager.playCue('workStart')
    } else {
      if (currentRound.value < selectedWorkout.value.rounds) {
        currentRound.value++
        currentPhase.value = 'work'
        timeRemaining.value = 20
        currentExercise.value = 'A'
        audioManager.playCue('workStart')
      } else {
        if (currentPairIndex.value < selectedWorkout.value.pairs.length - 1) {
          currentPairIndex.value++
          currentRound.value = 1
          currentPhase.value = 'pairRest'
          timeRemaining.value = selectedWorkout.value.restBetweenPairs
          currentExercise.value = 'A'
          audioManager.playCue('pairRestStart')
        } else {
          currentPhase.value = 'finished'
          isFinished.value = true
          audioManager.playCue('workoutComplete')
          stopTimer()
        }
      }
    }
  } else if (currentPhase.value === 'pairRest') {
    currentPhase.value = 'work'
    timeRemaining.value = 20
    audioManager.playCue('workStart')
  }
}

const getCurrentExerciseName = () => {
  if (!selectedWorkout.value) return ''
  const pair = selectedWorkout.value.pairs[currentPairIndex.value]
  if (!pair) return ''
  return currentExercise.value === 'A' ? pair.exerciseA.name : pair.exerciseB.name
}

const formatTime = (seconds: number) => {
  return seconds.toString().padStart(2, '0')
}

// Audio control functions
const updateAudioSettings = (newSettings: any) => {
  audioManager.updateSettings(newSettings)
  audioSettings.value = audioManager.getSettings()
}

const setAudioEnabled = (enabled: boolean) => {
  updateAudioSettings({ enabled })
}

const setAudioVolume = (volume: number) => {
  updateAudioSettings({ volume })
}

const testAudio = async () => {
  await audioManager.initializeAudioOnUserInteraction()
  await audioManager.testAudio()
}

const toggleAudioControls = () => {
  showAudioControls.value = !showAudioControls.value
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.workout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.workout-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.workout-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
}

.workout-card.selected {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.workout-details {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
}

.start-button, .control-button, .exit-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px;
  transition: background-color 0.3s ease;
}

.start-button:hover, .control-button:hover {
  background-color: #0056b3;
}

.exit-button {
  background-color: #dc3545;
  position: absolute;
  top: 20px;
  right: 20px;
}

.exit-button:hover {
  background-color: #c82333;
}

.workout-session-container {
  position: relative;
  padding-top: 60px;
}

.workout-header h1 {
  margin-bottom: 30px;
}

.timer-display {
  margin: 40px 0;
}

.time {
  font-size: 6em;
  font-weight: bold;
  margin-bottom: 10px;
}

.phase {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #007bff;
}

.progress {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 30px;
}

.rest-info {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffc107;
  margin: 15px 0;
}

.exercise-display h2 {
  font-size: 2.5em;
  margin: 30px 0;
  color: #28a745;
}

.controls {
  margin-top: 30px;
}

.audio-controls-section {
  position: relative;
  margin-top: 20px;
}

.audio-controls {
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-top: 10px;
  max-width: 400px;
  margin: 10px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.audio-control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.audio-control-header h3 {
  margin: 0;
  font-size: 1.2em;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.audio-control-row {
  margin-bottom: 15px;
}

.audio-control-row label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.volume-slider {
  width: 100%;
  margin-top: 5px;
}

.test-audio-button {
  background-color: #28a745;
  font-size: 14px;
  padding: 8px 16px;
}

.test-audio-button:hover {
  background-color: #218838;
}

.audio-button {
  background-color: #6c757d;
  font-size: 14px;
}

.audio-button:hover {
  background-color: #5a6268;
}

.mobile-audio-notice {
  font-size: 12px;
  color: #007bff;
  margin-top: 5px;
  padding: 5px;
  background-color: #e7f3ff;
  border-radius: 4px;
  text-align: center;
}

/* Exercise list styles for workout cards */
.exercise-list {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.exercise-list-title {
  font-size: 0.9em;
  font-weight: 600;
  color: #555;
  margin: 0 0 8px 0;
}

.exercise-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exercise-pair-compact {
  display: flex;
  align-items: center;
  font-size: 0.8em;
  color: #666;
  line-height: 1.3;
}

.exercise-compact {
  color: #444;
  font-weight: 500;
}

.exercise-separator {
  margin: 0 6px;
  color: #999;
  font-weight: bold;
}

/* Exercise display styles for workout session */
.exercise-pair-display {
  margin-top: 20px;
}

.exercise-indicator {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.exercise-label {
  background: #f8f9fa;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 0.9em;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

.exercise-label.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: scale(1.05);
}

.next-pair-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.next-pair-preview h4 {
  margin: 0 0 10px 0;
  color: #555;
  font-size: 1em;
}

.next-exercises {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.next-exercises span {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.9em;
  color: #444;
}
</style>