// Utility functions for the HIIT Workout App

class Utils {
    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static createElement(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static showElement(element) {
        if (element) {
            element.style.display = 'block';
            element.classList.add('active');
        }
    }

    static hideElement(element) {
        if (element) {
            element.style.display = 'none';
            element.classList.remove('active');
        }
    }

    static fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    static fadeOut(element, duration = 300) {
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    static vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    static playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }

    static requestWakeLock() {
        if ('wakeLock' in navigator) {
            return navigator.wakeLock.request('screen').catch(err => {
                console.warn('Wake lock failed:', err);
            });
        }
        return Promise.resolve(null);
    }

    static validateDuration(duration) {
        const validDurations = [10, 15, 20, 30];
        return validDurations.includes(duration);
    }

    static calculateWorkoutRounds(duration, workInterval = 20, restInterval = 10) {
        const totalInterval = workInterval + restInterval;
        const totalSeconds = duration * 60;
        return Math.floor(totalSeconds / totalInterval);
    }

    static getRandomItems(array, count) {
        const shuffled = this.shuffleArray(array);
        return shuffled.slice(0, count);
    }

    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    static addToHomeScreen() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                }
                this.deferredPrompt = null;
            });
        }
    }

    static handleInstallPrompt(event) {
        event.preventDefault();
        this.deferredPrompt = event;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
window.Utils = Utils;