const DB_KEY = 'gymdb_users'; // Intentionally NOT using gymbuddy_ prefix so logout wipe doesn't destroy the DB

export const getDb = () => {
  try {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch {
    return {};
  }
};

export const saveDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

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
 * Persists the current active session's gymbuddy_ keys to the multi-user DB
 * under the given userId.
 */
export const saveActiveUserToDb = (userId) => {
  if (!userId) return;

  const db = getDb();
  const userData = {};

  // Keys to skip — internal/temp keys that should not be persisted per user
  const skipKeys = new Set(['gymbuddy_active_user_id', 'gymbuddy_pending_profile']);

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('gymbuddy_') && !skipKeys.has(key)) {
      userData[key] = localStorage.getItem(key);
    }
  });

  db[userId] = userData;
  saveDb(db);
};

/**
 * Loads a specific user's data from the DB into active localStorage.
 * CRITICAL: Always clears the current session first to prevent data bleed.
 * Returns true if user was found, false if brand new user.
 */
export const loadUserFromDb = (userId) => {
  if (!userId) return false;

  // ✅ CRITICAL FIX: Clear any existing session data BEFORE loading the new user
  clearActiveSession();

  const db = getDb();
  const userData = db[userId];

  if (userData && Object.keys(userData).length > 0) {
    // Restore all this user's keys to active localStorage
    Object.keys(userData).forEach(key => {
      localStorage.setItem(key, userData[key]);
    });
    return true; // Successfully loaded existing user
  }

  return false; // User not found — brand new
};

export const userExists = (userId) => {
  if (!userId) return false;
  const db = getDb();
  return !!db[userId] && Object.keys(db[userId]).length > 0;
};
