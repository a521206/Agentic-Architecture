/**
 * Firebase Configuration and Initialization
 * 
 * This module provides access to Firebase services throughout the application.
 * Firebase is initialized in the HTML file and made available via window.firebaseServices.
 */

// Import Firebase services
// Export functions that other modules might expect
export function initializeFirebase() {
    if (window.firebaseServices) {
        return window.firebaseServices;
    }
    
    console.warn('Firebase not initialized in window.firebaseServices');
    return { db: null, auth: null, analytics: null };
}

// Export services if available, otherwise null
export const isFirebaseReady = !!window.firebaseServices;

export const getFirebaseServices = () => {
    if (window.firebaseServices) {
        return window.firebaseServices;
    }
    console.warn('Firebase services not yet initialized');
    return { db: null, auth: null, analytics: null };
};

// Export services
export const { db, analytics } = getFirebaseServices();
export const auth = window.firebaseServices?.auth || null;

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.initializeFirebase = initializeFirebase;
}
