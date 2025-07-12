// Unit tests for utils.js

// Mock the Utils class since it's defined globally
require('../js/utils.js');

describe('Utils', () => {
    describe('formatTime', () => {
        test('formats seconds correctly', () => {
            expect(Utils.formatTime(65)).toBe('01:05');
            expect(Utils.formatTime(0)).toBe('00:00');
            expect(Utils.formatTime(599)).toBe('09:59');
            expect(Utils.formatTime(3661)).toBe('61:01');
        });

        test('handles edge cases', () => {
            expect(Utils.formatTime(1)).toBe('00:01');
            expect(Utils.formatTime(60)).toBe('01:00');
            expect(Utils.formatTime(3600)).toBe('60:00');
        });
    });

    describe('formatDate', () => {
        test('formats date correctly', () => {
            const testDate = new Date('2023-12-25T15:30:00');
            const formatted = Utils.formatDate(testDate);
            expect(formatted).toMatch(/Dec 25, 2023/);
            expect(formatted).toMatch(/3:30 PM/);
        });
    });

    describe('shuffleArray', () => {
        test('returns array of same length', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = Utils.shuffleArray(original);
            expect(shuffled).toHaveLength(original.length);
        });

        test('does not modify original array', () => {
            const original = [1, 2, 3, 4, 5];
            const originalCopy = [...original];
            Utils.shuffleArray(original);
            expect(original).toEqual(originalCopy);
        });

        test('contains all original elements', () => {
            const original = [1, 2, 3, 4, 5];
            const shuffled = Utils.shuffleArray(original);
            original.forEach(item => {
                expect(shuffled).toContain(item);
            });
        });
    });

    describe('generateId', () => {
        test('generates unique IDs', () => {
            const id1 = Utils.generateId();
            const id2 = Utils.generateId();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('debounce', () => {
        jest.useFakeTimers();

        test('delays function execution', () => {
            const mockFn = jest.fn();
            const debouncedFn = Utils.debounce(mockFn, 100);

            debouncedFn();
            expect(mockFn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);
            expect(mockFn).not.toHaveBeenCalled();

            jest.advanceTimersByTime(50);
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test('cancels previous calls', () => {
            const mockFn = jest.fn();
            const debouncedFn = Utils.debounce(mockFn, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            jest.advanceTimersByTime(100);
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        afterEach(() => {
            jest.clearAllTimers();
        });
    });

    describe('throttle', () => {
        jest.useFakeTimers();

        test('limits function calls', () => {
            const mockFn = jest.fn();
            const throttledFn = Utils.throttle(mockFn, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(mockFn).toHaveBeenCalledTimes(1);

            jest.advanceTimersByTime(100);
            throttledFn();
            expect(mockFn).toHaveBeenCalledTimes(2);
        });

        afterEach(() => {
            jest.clearAllTimers();
        });
    });

    describe('createElement', () => {
        test('creates element with correct properties', () => {
            const element = Utils.createElement('div', 'test-class', 'Test content');
            expect(element.tagName).toBe('DIV');
            expect(element.className).toBe('test-class');
            expect(element.innerHTML).toBe('Test content');
        });

        test('handles optional parameters', () => {
            const element = Utils.createElement('span');
            expect(element.tagName).toBe('SPAN');
            expect(element.className).toBe('');
            expect(element.innerHTML).toBe('');
        });
    });

    describe('validateDuration', () => {
        test('validates correct durations', () => {
            expect(Utils.validateDuration(10)).toBe(true);
            expect(Utils.validateDuration(15)).toBe(true);
            expect(Utils.validateDuration(20)).toBe(true);
            expect(Utils.validateDuration(30)).toBe(true);
        });

        test('rejects invalid durations', () => {
            expect(Utils.validateDuration(5)).toBe(false);
            expect(Utils.validateDuration(25)).toBe(false);
            expect(Utils.validateDuration(60)).toBe(false);
            expect(Utils.validateDuration('20')).toBe(false);
        });
    });

    describe('calculateWorkoutRounds', () => {
        test('calculates rounds correctly', () => {
            expect(Utils.calculateWorkoutRounds(10, 20, 10)).toBe(20);
            expect(Utils.calculateWorkoutRounds(20, 30, 15)).toBe(26);
        });

        test('handles default intervals', () => {
            expect(Utils.calculateWorkoutRounds(15)).toBe(30);
        });
    });

    describe('getRandomItems', () => {
        test('returns requested number of items', () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const result = Utils.getRandomItems(array, 5);
            expect(result).toHaveLength(5);
        });

        test('does not modify original array', () => {
            const original = [1, 2, 3, 4, 5];
            const originalCopy = [...original];
            Utils.getRandomItems(original, 3);
            expect(original).toEqual(originalCopy);
        });

        test('handles count larger than array', () => {
            const array = [1, 2, 3];
            const result = Utils.getRandomItems(array, 5);
            expect(result).toHaveLength(3);
        });
    });

    describe('playNotificationSound', () => {
        test('creates audio context when available', () => {
            Utils.playNotificationSound();
            expect(global.AudioContext).toHaveBeenCalled();
        });
    });

    describe('vibrate', () => {
        test('calls navigator.vibrate when available', () => {
            Utils.vibrate([100, 50, 100]);
            expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
        });

        test('uses default pattern when none provided', () => {
            Utils.vibrate();
            expect(navigator.vibrate).toHaveBeenCalledWith([100]);
        });
    });
});