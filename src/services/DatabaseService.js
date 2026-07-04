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

export const saveActiveUserToDb = (userId) => {
  if (!userId) return;
  
  const db = getDb();
  const userData = {};
  
  // Keys to skip — internal/temp keys that should not be persisted per user
  const skipKeys = new Set([DB_KEY, 'gymbuddy_pending_profile']);
  
  // Extract all active session keys starting with 'gymbuddy_'
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('gymbuddy_') && !skipKeys.has(key)) {
      userData[key] = localStorage.getItem(key);
    }
  });

  db[userId] = userData;
  saveDb(db);
};

export const loadUserFromDb = (userId) => {
  if (!userId) return false;

  const db = getDb();
  const userData = db[userId];
  
  if (userData) {
    // Restore all keys to active localStorage
    Object.keys(userData).forEach(key => {
      localStorage.setItem(key, userData[key]);
    });
    return true; // Successfully loaded
  }
  return false; // User not found
};

export const userExists = (userId) => {
  if (!userId) return false;
  const db = getDb();
  return !!db[userId];
};
