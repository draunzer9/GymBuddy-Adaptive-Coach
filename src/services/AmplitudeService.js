import * as amplitude from '@amplitude/unified';

export const AmplitudeService = {
  setUserId: (userId) => {
    if (userId) {
      amplitude.setUserId(userId);
    }
  },

  trackRegistration: (profile) => {
    amplitude.track('Registration', {
      email: profile.email || '',
      age: profile.age || '',
      weight: profile.weight || '',
      height: profile.height || '',
      gender: profile.gender || ''
    });
  },

  trackOnboardingCompleted: (goals, equipment) => {
    amplitude.track('Onboarding Completed', {
      goals: goals || [],
      equipment: equipment || []
    });
  },

  trackWorkoutCompleted: (workoutTitle, durationSecs, calories, exercisesCount) => {
    amplitude.track('Workout Completed', {
      workoutTitle,
      durationMinutes: Math.round(durationSecs / 60),
      calories,
      exercisesCount
    });
  },

  trackMealPlanGenerated: (daysCompleted) => {
    amplitude.track('Meal Plan Generated', {
      dayCompleted: daysCompleted
    });
  },

  trackDayCompleted: (nutritionDays, macros) => {
    amplitude.track('Nutrition Day Completed', {
      day: nutritionDays,
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fats: macros.fat || 0,
      water: macros.water || 0
    });
  },
  
  trackCheckIn: (answers) => {
    amplitude.track('Daily Check-In', {
      answers: answers
    });
  },

  trackLogin: () => {
    amplitude.track('Login');
  },

  trackLogout: () => {
    amplitude.track('Logout');
    amplitude.setUserId(null); // Clear user ID on logout
  }
};
