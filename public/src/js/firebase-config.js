/**
 * Firebase Configuration and Initialization
 * 
 * This module provides access to Firebase services throughout the application.
 * Firebase is initialized in the HTML file and made available via window.firebaseServices.
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMlyvJlwmsh7S7mfGPQHlQ-EfZc0qc8E4",
    authDomain: "agentic-architecture-571f9.firebaseapp.com",
    projectId: "agentic-architecture-571f9",
    storageBucket: "agentic-architecture-571f9.firebasestorage.app",
    messagingSenderId: "581221355292",
    appId: "1:581221355292:web:eaf254cc9d0a5b2ada34d9",
    measurementId: "G-VX6J4D9ECW"
};

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
export const db = window.firebaseServices?.db || null;
export const auth = window.firebaseServices?.auth || null;
export const analytics = window.firebaseServices?.analytics || null;

// Initialize Firebase when the script loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase SDK to load
    if (typeof firebase !== 'undefined') {
        initializeFirebase();
    } else {
        console.warn('Firebase SDK not loaded');
    }
});

// Export for use in other modules
window.initializeFirebase = initializeFirebase;
