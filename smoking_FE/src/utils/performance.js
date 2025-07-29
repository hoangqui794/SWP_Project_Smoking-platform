import React from 'react';

// Performance utility để debug memory leaks và freeze issues
export const performanceUtils = {
    // Cleanup function cho components
    cleanupComponent: (name) => {
        console.log(`🧹 Cleaning up component: ${name}`);

        // Clear timeouts - safer approach
        const highestTimeoutId = setTimeout(() => { }, 0);
        for (let i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }

        // Clear intervals - safer approach
        const highestIntervalId = setInterval(() => { }, 9999);
        for (let i = 0; i < highestIntervalId; i++) {
            clearInterval(i);
        }
        clearInterval(highestIntervalId);
    },

    // Memory usage monitor
    monitorMemory: () => {
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            console.log('🧠 Memory usage:', {
                used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
                total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
            });
        }
    },

    // Debounce function để tránh excessive calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function để limit frequency
    throttle: (func, limit) => {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Cleanup localStorage khi logout
    clearUserData: () => {
        const keysToRemove = [
            'userToken', 'userRole', 'userName', 'userEmail',
            'userId', 'coachId', 'profilePicture', 'memberPackage'
        ];

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log('🗑️ User data cleared from localStorage');
    }
};

// React hook để monitor component lifecycle
export const useComponentLifecycle = (componentName) => {
    React.useEffect(() => {
        console.log(`🚀 Component mounted: ${componentName}`);
        performanceUtils.monitorMemory();

        return () => {
            console.log(`💀 Component unmounting: ${componentName}`);
            performanceUtils.cleanupComponent(componentName);
        };
    }, [componentName]);
};
