import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBAdXNYeq2Hqtw7PiNGkdX6DVvg5mWkNBE",
  authDomain: "risk-3d-f9ba0.firebaseapp.com",
  projectId: "risk-3d-f9ba0",
  storageBucket: "risk-3d-f9ba0.firebasestorage.app",
  messagingSenderId: "893126637681",
  appId: "1:893126637681:web:ac18e665adf888deb543d0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Helper function to ensure anonymous authentication
export const ensureAnonymousAuth = async () => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
};
