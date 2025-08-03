/**
 * Firebase Configuration
 * Initialize Firebase and Firestore for the blog interactions system
 */

// Firebase configuration object
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id-here",
    measurementId: "your-measurement-id"
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
