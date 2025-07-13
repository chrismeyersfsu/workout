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
            <span>{{ workout.pairs.length }} pairs</span>
            <span>{{ workout.rounds }} rounds</span>
            <span>{{ workout.restBetweenPairs }}s rest</span>
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
        <div class="progress">
          Round {{ currentRound }} of {{ selectedWorkout.rounds }} | 
          Pair {{ currentPairIndex + 1 }} of {{ selectedWorkout.pairs.length }}
        </div>
      </div>
      
      <div v-if="currentPhase === 'work' || currentPhase === 'rest'" class="exercise-display">
        <h2>{{ getCurrentExerciseName() }}</h2>
      </div>
      
      <div class="controls">
        <button v-if="!isActive && !isFinished" @click="startTimer" class="control-button">
          {{ isPaused ? 'Resume' : 'Start' }}
        </button>
        <button v-if="isActive" @click="pauseTimer" class="control-button">Pause</button>
        <button v-if="isPaused || isActive" @click="resetTimer" class="control-button">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { predefinedWorkouts } from './data/workouts'
import type { TabataWorkout } from './types/workout'

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

const selectWorkout = (workoutId: string) => {
  selectedWorkoutId.value = workoutId
}

const startWorkout = () => {
  const workout = workouts.value.find(w => w.id === selectedWorkoutId.value)
  if (workout) {
    selectedWorkout.value = workout
    resetTimer()
  }
}

const exitWorkout = () => {
  stopTimer()
  selectedWorkout.value = null
  selectedWorkoutId.value = null
}

const startTimer = () => {
  if (!selectedWorkout.value) return
  
  isActive.value = true
  isPaused.value = false
  
  if (timeRemaining.value === 0) {
    timeRemaining.value = 20 // Work period
    currentPhase.value = 'work'
  }
  
  intervalId = window.setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
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
  
  if (currentPhase.value === 'work') {
    currentPhase.value = 'rest'
    timeRemaining.value = 10
    currentExercise.value = currentExercise.value === 'A' ? 'B' : 'A'
  } else if (currentPhase.value === 'rest') {
    if (currentExercise.value === 'A') {
      currentPhase.value = 'work'
      timeRemaining.value = 20
    } else {
      if (currentRound.value < selectedWorkout.value.rounds) {
        currentRound.value++
        currentPhase.value = 'work'
        timeRemaining.value = 20
        currentExercise.value = 'A'
      } else {
        if (currentPairIndex.value < selectedWorkout.value.pairs.length - 1) {
          currentPairIndex.value++
          currentRound.value = 1
          currentPhase.value = 'pairRest'
          timeRemaining.value = selectedWorkout.value.restBetweenPairs
          currentExercise.value = 'A'
        } else {
          currentPhase.value = 'finished'
          isFinished.value = true
          stopTimer()
        }
      }
    }
  } else if (currentPhase.value === 'pairRest') {
    currentPhase.value = 'work'
    timeRemaining.value = 20
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

.exercise-display h2 {
  font-size: 2.5em;
  margin: 30px 0;
  color: #28a745;
}

.controls {
  margin-top: 30px;
}
</style>