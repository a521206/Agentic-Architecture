// firebase-config.js

// Import necessary functions from the modern Firebase modular SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMlyvJlwmsh7S7mfGPQHlQ-EfZc0qc8E4",
  authDomain: "agentic-architecture-571f9.firebaseapp.com",
  projectId: "agentic-architecture-571f9",
  storageBucket: "agentic-architecture-571f9.firebasestorage.app",
  messagingSenderId: "581221355292",
  appId: "1:581221355292:web:eaf254cc9d0a5b2ada34d9",
  measurementId: "G-VX6J4D9ECW"
};

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Initialize and export the services you need
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// This function is no longer needed with modular imports, but if you want one
// to centralize service access, this is how you would write it.
export const getFirebaseServices = () => ({
  app,
  db,
  auth,
  analytics
});