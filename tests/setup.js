// Jest setup file for HIIT Workout App tests

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock navigator APIs
Object.defineProperty(navigator, 'vibrate', {
    value: jest.fn(),
    writable: true
});

Object.defineProperty(navigator, 'wakeLock', {
    value: {
        request: jest.fn().mockResolvedValue({
            release: jest.fn()
        })
    },
    writable: true
});

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn().mockReturnValue({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 0 },
        type: 'sine'
    }),
    createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: {
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn()
        }
    }),
    destination: {},
    currentTime: 0
}));

global.webkitAudioContext = global.AudioContext;

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock performance.now
global.performance = {
    now: jest.fn(() => Date.now())
};

// Mock console methods for cleaner test output
const originalConsole = global.console;
global.console = {
    ...originalConsole,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
};

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
});

// Global test utilities
global.testUtils = {
    createMockExercise: (overrides = {}) => ({
        id: 'test-exercise-1',
        name: 'Test Exercise',
        category: 'upper',
        instructions: 'Test instructions',
        imagePath: '/test/image.jpg',
        muscleGroups: ['chest', 'arms'],
        ...overrides
    }),

    createMockWorkout: (overrides = {}) => ({
        id: 'test-workout-1',
        name: 'Test Workout',
        duration: 20,
        exercises: [
            global.testUtils.createMockExercise(),
            global.testUtils.createMockExercise({ id: 'test-exercise-2', name: 'Test Exercise 2' })
        ],
        workInterval: 20,
        restInterval: 10,
        ...overrides
    }),

    mockDOM: () => {
        document.body.innerHTML = `
            <div id="app">
                <div id="home-screen" class="screen active"></div>
                <div id="exercise-selection-screen" class="screen"></div>
                <div id="workout-preview-screen" class="screen"></div>
                <div id="workout-screen" class="screen"></div>
                <div id="saved-workouts-screen" class="screen"></div>
                <div id="history-screen" class="screen"></div>
            </div>
        `;
    },

    simulateClick: (element) => {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
    },

    waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Mock Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
}));