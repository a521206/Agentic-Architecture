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

// Initialize Firebase services
let firebaseInitialized = false;
let db = null;
let auth = null;
let analytics = null;

/**
 * Initialize Firebase services
 * @returns {Object} Object containing initialized Firebase services
 */
function initializeFirebase() {
    if (firebaseInitialized) {
        return { db, auth, analytics };
    }

    try {
        // Initialize Firebase if not already initialized
        if (firebase.apps.length === 0) {
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            
            // Initialize services
            db = firebase.firestore();
            auth = firebase.auth();
            analytics = firebase.analytics();
            
            // Configure Firestore settings
            db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
                experimentalAutoDetectLongPolling: true,
                experimentalForceLongPolling: false
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

            firebaseInitialized = true;
            console.log('Firebase services initialized successfully');
        } else {
            // Use existing Firebase app
            db = firebase.firestore();
            auth = firebase.auth();
            analytics = firebase.analytics();
            firebaseInitialized = true;
        }

        return { db, auth, analytics };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return { db: null, auth: null, analytics: null };
    }
}

/**
 * Check if Firebase is ready
 * @returns {boolean} True if Firebase is ready to use
 */
function isFirebaseReady() {
    return firebaseInitialized && db !== null;
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
