/**
 * Firebase Configuration and Initialization
 *
 * This module provides access to Firebase services throughout the application.
 * Firebase is initialized here with the provided configuration.
 */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
// Export analytics from Firebase initialization
export const analytics = getAnalytics(app);

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
export const { db } = getFirebaseServices();
export const auth = window.firebaseServices?.auth || null;

// Export for destructuring in imports
export default {
    db,
    auth,
    analytics,
    initializeFirebase,
    isFirebaseReady
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.initializeFirebase = initializeFirebase;
}
