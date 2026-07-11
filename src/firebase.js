import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgsfRjRd27-jIQjC6CdMDOQk4T8DOIjFc",
  authDomain: "gymbuddy-1527e.firebaseapp.com",
  projectId: "gymbuddy-1527e",
  storageBucket: "gymbuddy-1527e.firebasestorage.app",
  messagingSenderId: "470240234690",
  appId: "1:470240234690:web:c2d4d76f431552863cbf5b",
  measurementId: "G-QZ7GG51XX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
