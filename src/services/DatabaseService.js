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
 * 
 * IMPORTANT: This function returns a Promise. Always `await` it before
 * clearing localStorage, otherwise data will be lost.
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

  // Always ensure gymbuddy_is_registered is explicitly saved if the user
  // has completed registration (we check for a user profile as proof)
  const hasProfile = localStorage.getItem('gymbuddy_user_profile');
  if (hasProfile && !userData['gymbuddy_is_registered']) {
    userData['gymbuddy_is_registered'] = 'true';
  }

  try {
    await setDoc(doc(db, "users", userId), userData);
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
    // Rethrow so callers know the save failed
    throw error;
  }
};

/**
 * Loads a specific user's data from Firestore into active localStorage.
 * 
 * CRITICAL FIX: Does NOT clear existing session data until we have
 * confirmed the Firestore read succeeded. This prevents data loss
 * if the network is unavailable or Firestore returns an error.
 * 
 * Returns true if user was found and restored, false if brand new user.
 */
export const loadUserFromDb = async (userId) => {
  if (!userId) return false;

  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Verify the user actually completed registration
      // (prevents partial/corrupt records from being treated as valid)
      if (!userData['gymbuddy_is_registered'] && !userData['gymbuddy_user_profile']) {
        // Document exists but has no registration data — treat as new user
        return false;
      }

      // ✅ ONLY clear existing session AFTER we have confirmed valid data
      clearActiveSession();

      // Restore all this user's keys to active localStorage
      Object.keys(userData).forEach(key => {
        localStorage.setItem(key, userData[key]);
      });

      // Ensure is_registered is always set (safety net for older records
      // that may have been saved before this key was tracked)
      if (!localStorage.getItem('gymbuddy_is_registered')) {
        localStorage.setItem('gymbuddy_is_registered', 'true');
      }

      return true; // Successfully loaded existing user
    }
  } catch (error) {
    console.error("Error loading user from Firestore:", error);
    // Network failure / quota exceeded — do NOT clear session, do NOT
    // treat the user as new. Return false but leave existing session intact.
  }

  return false; // User not found — brand new
};

/**
 * Checks whether a user document exists in Firestore.
 * Returns true if the user has a valid registered profile.
 */
export const userExists = async (userId) => {
  if (!userId) return false;
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Only consider a user as "existing" if they completed registration
      return !!(data['gymbuddy_is_registered'] || data['gymbuddy_user_profile']);
    }
    return false;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
};

