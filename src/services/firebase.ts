import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  signOut,
  deleteUser,
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

// Keep track of the current user
let currentUser: User | null = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// Helper function to ensure anonymous authentication
export const ensureAnonymousAuth = async (): Promise<User> => {
  if (currentUser) {
    return currentUser;
  }

  const result = await signInAnonymously(auth);
  currentUser = result.user;
  return currentUser;
};

// Helper function to check admin status
export const getAdminSession = async (uid: string): Promise<boolean> => {
  const adminSessionRef = doc(db, "admin_sessions", uid);
  const docSnap = await getDoc(adminSessionRef);
  return docSnap.exists();
};

// Helper function to set admin session
export const setAdminSession = async (isAdmin: boolean) => {
  if (!currentUser) throw new Error("No authenticated user");

  if (isAdmin) {
    // Create admin session document
    await setDoc(doc(db, "admin_sessions", currentUser.uid), {
      createdAt: new Date(),
      lastActive: new Date(),
    });
  } else {
    try {
      // Remove admin session document
      await deleteDoc(doc(db, "admin_sessions", currentUser.uid));
    } catch (error) {
      console.error("Error removing admin session:", error);
    }
  }
};

// Helper function to clean up user session
export const cleanupUserSession = async () => {
  if (!currentUser) return;

  try {
    // First remove admin session if it exists
    await setAdminSession(false);

    // Delete the anonymous user
    await deleteUser(currentUser);

    // Sign out
    await signOut(auth);

    // Clear the current user
    currentUser = null;
  } catch (error) {
    console.error("Error during session cleanup:", error);
    // Even if deletion fails, try to sign out
    await signOut(auth);
    currentUser = null;
  }
};
