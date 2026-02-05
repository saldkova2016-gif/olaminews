import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Configuration provided by user
const firebaseConfig = {
  // Updated configuration
  apiKey: "AIzaSyDcEg8ZMKUmRbDTOUrTVt1Z2-VquIK_xVM",
  authDomain: "didgestolami.firebaseapp.com",
  projectId: "didgestolami",
  storageBucket: "didgestolami.firebasestorage.app",
  messagingSenderId: "29075324631",
  appId: "1:29075324631:web:76131110e7cb86f58e3a92",
  measurementId: "G-8BQ86W56DT"
};

// Initialize Firebase
let app;
let db;
let auth;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  analytics = getAnalytics(app);
  console.log("Firebase initialized successfully with provided config.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { db, auth, analytics };
