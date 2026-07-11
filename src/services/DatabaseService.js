import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Clears all active gymbuddy_ session keys from localStorage.
 * This ensures no stale data bleeds between users.
 */
export const clearActiveSession = () => {
  const keysToRemove = Object.keys(localStorage).filter(
    key => key.startsWith('gymbuddy_')
  );
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Persists the current active session's gymbuddy_ keys to Firestore
 * under the given userId.
 */
export const saveActiveUserToDb = async (userId) => {
  if (!userId) return;

  const userData = {};

  // Keys to skip — internal/temp keys that should not be persisted per user
  const skipKeys = new Set(['gymbuddy_active_user_id', 'gymbuddy_pending_profile']);

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('gymbuddy_') && !skipKeys.has(key)) {
      userData[key] = localStorage.getItem(key);
    }
  });

  try {
    await setDoc(doc(db, "users", userId), userData);
  } catch (error) {
    console.error("Error saving user to Firestore", error);
  }
};

/**
 * Loads a specific user's data from Firestore into active localStorage.
 * CRITICAL: Always clears the current session first to prevent data bleed.
 * Returns true if user was found, false if brand new user.
 */
export const loadUserFromDb = async (userId) => {
  if (!userId) return false;

  // ✅ CRITICAL FIX: Clear any existing session data BEFORE loading the new user
  clearActiveSession();

  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      const userData = docSnap.data();
      // Restore all this user's keys to active localStorage
      Object.keys(userData).forEach(key => {
        localStorage.setItem(key, userData[key]);
      });
      return true; // Successfully loaded existing user
    }
  } catch (error) {
    console.error("Error loading user from Firestore", error);
  }

  return false; // User not found — brand new
};

export const userExists = async (userId) => {
  if (!userId) return false;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists();
  } catch (error) {
    return false;
  }
};
