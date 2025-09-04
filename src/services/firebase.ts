import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";

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
export const ensureAnonymousAuth = async (): Promise<User> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  return result.user;
};

// Helper function to set admin session
export const setAdminSession = async (isAdmin: boolean) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  if (isAdmin) {
    // Create admin session document
    await setDoc(doc(db, "admin_sessions", user.uid), {
      createdAt: new Date(),
      lastActive: new Date(),
    });
  } else {
    try {
      // Remove admin session document
      await deleteDoc(doc(db, "admin_sessions", user.uid));
    } finally {
      // Always sign out when removing admin session
      await signOut(auth);
    }
  }
};
