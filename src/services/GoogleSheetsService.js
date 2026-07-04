const URL = import.meta.env.VITE_GOOGLE_SHEETS_URL;

const sendData = async (payload) => {
  if (!URL) {
    console.warn('Google Sheets URL not configured in .env.local');
    return;
  }

  // Inject common data
  payload.timestamp = new Date().toISOString();
  payload.userId = localStorage.getItem('gymbuddy_active_user_id') || 'Anonymous';
  
  try {
    const profile = JSON.parse(localStorage.getItem('gymbuddy_user_profile') || '{}');
    if (profile.name) payload.userName = profile.name;
  } catch (e) {}

  try {
    await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    console.log(`[Metrics] Sent to ${payload.sheet} tab.`);
  } catch (error) {
    console.error(`[Metrics] Failed:`, error);
  }
};

export const GoogleSheetsService = {
  trackRegistration: (profile) => {
    sendData({
      sheet: 'Users',
      data: {
        email: profile.email || '',
        age: profile.age || '',
        weight: profile.weight || '',
        height: profile.height || '',
        gender: profile.gender || ''
      }
    });
  },

  trackOnboardingCompleted: (goals, equipment) => {
    // Send as a general event
    sendData({
      sheet: 'Events',
      data: {
        event: 'Onboarding Completed',
        details: JSON.stringify({ goals, equipment })
      }
    });
  },

  trackWorkoutCompleted: (workoutTitle, durationSecs, calories, exercisesCount) => {
    sendData({
      sheet: 'Workouts',
      data: {
        workoutTitle,
        durationMinutes: Math.round(durationSecs / 60),
        calories,
        exercisesCount
      }
    });
  },

  trackMealPlanGenerated: (daysCompleted) => {
    sendData({
      sheet: 'Events',
      data: {
        event: 'Meal Plan Generated',
        details: `Day ${daysCompleted}`
      }
    });
  },

  trackDayCompleted: (nutritionDays, macros) => {
    sendData({
      sheet: 'Nutrition',
      data: {
        day: nutritionDays,
        protein: macros.protein || 0,
        carbs: macros.carbs || 0,
        fats: macros.fat || 0,
        water: macros.water || 0
      }
    });
  },
  
  trackCheckIn: (answers) => {
    sendData({
      sheet: 'Events',
      data: {
        event: 'Daily Check-In',
        details: JSON.stringify(answers)
      }
    });
  },

  trackLogin: () => {
    sendData({
      sheet: 'Events',
      data: { event: 'Login', details: '' }
    });
  },

  trackLogout: () => {
    sendData({
      sheet: 'Events',
      data: { event: 'Logout', details: '' }
    });
  }
};
