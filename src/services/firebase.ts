import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";

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

// Constants
const ADMIN_DOC_ID = "current_admin";

// Helper function to check if admin session exists
export const checkAdminSession = async (): Promise<boolean> => {
  const adminDocRef = doc(db, "admin_sessions", ADMIN_DOC_ID);
  const docSnap = await getDoc(adminDocRef);
  return docSnap.exists();
};

// Helper function to remove admin session
export const removeAdminSession = async () => {
  console.log("Removing admin session...");
  const adminDocRef = doc(db, "admin_sessions", ADMIN_DOC_ID);
  try {
    await deleteDoc(adminDocRef);
    console.log("Admin session removed successfully");
  } catch (error) {
    console.error("Error removing admin session:", error);
    throw error;
  }
};

// Helper function to set admin session
export const setAdminSession = async (isAdmin: boolean) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const adminDocRef = doc(db, "admin_sessions", ADMIN_DOC_ID);

  if (isAdmin) {
    console.log("Creating admin session...");
    // First ensure no existing admin session
    await removeAdminSession().catch(console.error);

    // Create new admin session document
    await setDoc(adminDocRef, {
      uid: user.uid,
      createdAt: new Date(),
      lastActive: new Date(),
    });
    console.log("Admin session created successfully");
  } else {
    await removeAdminSession();
  }
};

// Helper function to clean up current user session
export const cleanupUserSession = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user to clean up");
    return;
  }

  try {
    console.log("Cleaning up user session...");
    // Remove admin session if it exists
    await removeAdminSession();

    // Sign out
    await signOut(auth);
    console.log("User signed out successfully");

    // Add a small delay to ensure Firestore operations complete
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error("Error during session cleanup:", error);
    // Even if admin session removal fails, try to sign out
    try {
      await signOut(auth);
      console.log("User signed out after error");
    } catch (signOutError) {
      console.error("Error during sign out:", signOutError);
    }
  }
};
