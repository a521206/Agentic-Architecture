/**
 * Firebase Configuration
 * Initialize Firebase and Firestore for the blog interactions system
 */

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDMlyvJlwmsh7S7mfGPQHlQ-EfZc0qc8E4",
    authDomain: "agentic-architecture-571f9.firebaseapp.com",
    projectId: "agentic-architecture-571f9",
    storageBucket: "agentic-architecture-571f9.firebasestorage.app",
    messagingSenderId: "581221355292",
    appId: "1:581221355292:web:eaf254cc9d0a5b2ada34d9",
    measurementId: "G-VX6J4D9ECW"
  };

// Initialize Firebase
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        }

        // Initialize Firestore
        const db = firebase.firestore();
        
        // Configure Firestore settings for better performance
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });

        // Enable offline persistence
        db.enablePersistence({
            synchronizeTabs: true
        }).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code === 'unimplemented') {
                console.warn('The current browser does not support all of the features required to enable persistence');
            }
        });

        console.log('Firestore configured successfully');
        return db;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return null;
    }
}

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
