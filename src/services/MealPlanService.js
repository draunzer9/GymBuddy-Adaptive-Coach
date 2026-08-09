import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

// ── Helper: build a dietary constraints string from user nutrition preferences ──
function buildPrefsStr(nutritionPrefs) {
  if (!nutritionPrefs) return '';

  const lines = [];

  // Diet type
  const dietLabels = {
    no_preference: 'No specific diet restriction',
    vegetarian: 'Vegetarian (no meat or fish)',
    vegan: 'Vegan (completely plant-based, no animal products)',
    keto: 'Ketogenic (high fat, very low carb, <50g carbs/day)',
    paleo: 'Paleo (whole, unprocessed foods — no grains, legumes, dairy)',
    mediterranean: 'Mediterranean diet (olive oil, fish, vegetables, whole grains, legumes)',
    intermittent_fasting: 'Intermittent Fasting — design the eating window for 16:8 (eat between 12 PM and 8 PM)',
    high_protein: 'High Protein priority (≥40% calories from protein)',
  };
  if (nutritionPrefs.dietType && nutritionPrefs.dietType !== 'no_preference') {
    lines.push(`Diet Type: ${dietLabels[nutritionPrefs.dietType] || nutritionPrefs.dietType}`);
  }

  // Allergies / intolerances
  if (nutritionPrefs.allergies && nutritionPrefs.allergies.length > 0) {
    lines.push(`STRICT Allergies / Intolerances — NEVER include these: ${nutritionPrefs.allergies.join(', ')}`);
  }

  // Meal count
  if (nutritionPrefs.mealCount) {
    lines.push(`Number of meals per day: EXACTLY ${nutritionPrefs.mealCount} meals — no more, no fewer`);
  }

  // Calorie mode
  const calModeLabels = {
    deficit: 'Caloric Deficit (−300 to −500 kcal below TDEE to lose weight)',
    maintenance: 'Maintenance calories (match estimated TDEE)',
    surplus: 'Caloric Surplus (+200 to +400 kcal above TDEE to build muscle)',
  };
  if (nutritionPrefs.calorieMode === 'custom' && nutritionPrefs.customCalories) {
    lines.push(`Calorie Target: EXACTLY ${nutritionPrefs.customCalories} kcal per day`);
  } else if (nutritionPrefs.calorieMode && calModeLabels[nutritionPrefs.calorieMode]) {
    lines.push(`Calorie Approach: ${calModeLabels[nutritionPrefs.calorieMode]}`);
  }

  // Cuisine preferences
  if (nutritionPrefs.cuisines && nutritionPrefs.cuisines.length > 0) {
    lines.push(`Preferred Cuisines: ${nutritionPrefs.cuisines.join(', ')} (incorporate these styles where possible)`);
  }

  return lines.length > 0 ? `\nUser Dietary Preferences:\n${lines.map(l => `- ${l}`).join('\n')}` : '';
}

export const generateMealPlan = async (goals, userProfile = {}, nutritionPrefs = null) => {
  if (!apiKey) {
    throw new Error('API key missing. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const goalStr = Array.isArray(goals) ? goals.join(', ') : goals || 'Stay Healthy';
  const { age, weight, height, gender } = userProfile;
  const profileStr = [
    age ? `Age: ${age}` : null,
    weight ? `Weight: ${weight}kg` : null,
    height ? `Height: ${height}cm` : null,
    gender ? `Gender: ${gender}` : null
  ].filter(Boolean).join(', ');

  const prefsStr = buildPrefsStr(nutritionPrefs);
  const mealCount = nutritionPrefs?.mealCount || null;

  const systemPrompt = `You are an expert adaptive nutritionist and dietitian.

User Goals: ${goalStr}
${profileStr ? `User Profile: ${profileStr}` : ''}${prefsStr}

CRITICAL INSTRUCTIONS:
1. The meal structure MUST strictly follow the User Dietary Preferences above — these are hard constraints.
   - Respect every allergy/intolerance: if "dairy" is listed, NO dairy ingredient anywhere.
   - Respect the diet type fully (e.g. vegan = zero animal products).
   - Generate EXACTLY ${mealCount ? mealCount : 'the appropriate number of'} meal(s) based on the preference.
   - Follow the calorie approach strictly when calculating dailyTargets.
2. If no specific diet preference is given, adapt the meal count and calorie level based on goals:
   - "Build Muscle": 5-6 high-protein meals, caloric surplus.
   - "Lose Weight": 2-3 nutrient-dense meals or IF-style, caloric deficit.
   - "Improve Fitness" / "Stay Healthy": 3-4 balanced meals, maintenance calories.
3. Each meal must have a practical, home-cookable name. No generic names like "Meal 1".
4. Include a brief note about WHY this meal structure was chosen for the user's specific goals and diet.
5. Emoji for each meal should reflect the food visually.

OUTPUT FORMAT:
Return a raw JSON object (no markdown, no code blocks) with this exact structure:
{
  "strategyNote": "1-2 sentence explanation of why this meal structure was chosen for these goals and dietary preferences",
  "dailyTargets": {
    "calories": 2400,
    "protein": 180,
    "carbs": 260,
    "fat": 70
  },
  "meals": [
    {
      "id": "meal_1",
      "timing": "7:00 AM",
      "label": "Morning Fuel",
      "name": "Oats with Greek Yogurt & Berries",
      "emoji": "🥣",
      "calories": 480,
      "protein": 32,
      "carbs": 58,
      "fat": 12,
      "prepTime": "5 min",
      "ingredients": ["1 cup rolled oats", "150g Greek yogurt", "Handful blueberries", "1 tbsp honey", "1 scoop protein powder"]
    }
  ]
}

CRITICAL: Return ONLY the raw JSON. No markdown, no code fences.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Error generating meal plan:', e);
    throw new Error(`Failed to generate meal plan: ${e.message}`);
  }
};

export const generateProgressiveMealPlan = async (currentPlan, goals, userProfile = {}, completedDays = 1, nutritionPrefs = null) => {
  if (!apiKey) {
    throw new Error('API key missing. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const goalStr = Array.isArray(goals) ? goals.join(', ') : goals || 'Stay Healthy';
  const { age, weight, height, gender } = userProfile;
  const profileStr = [
    age ? `Age: ${age}` : null,
    weight ? `Weight: ${weight}kg` : null,
    height ? `Height: ${height}cm` : null,
    gender ? `Gender: ${gender}` : null
  ].filter(Boolean).join(', ');

  const prefsStr = buildPrefsStr(nutritionPrefs);
  const mealCount = nutritionPrefs?.mealCount || null;

  const systemPrompt = `You are an expert adaptive nutritionist and dietitian.

User Goals: ${goalStr}
${profileStr ? `User Profile: ${profileStr}` : ''}${prefsStr}
Days of Nutrition Plan Completed: ${completedDays}

The user just completed this previous day's meal plan:
${JSON.stringify(currentPlan)}

CRITICAL INSTRUCTIONS:
1. Strictly honor all dietary preferences above — same hard constraints as always.
2. Analyze the previous plan and create a NEW plan for tomorrow with variety and progression:
   - For Muscle Gain: Slightly increase calories/protein, or just provide variety.
   - For Weight Loss: Keep calories strict but change up the recipes to prevent diet fatigue.
   - For General Fitness: Introduce new healthy ingredients and a slightly different macro split.
3. Generate EXACTLY ${mealCount ? mealCount : 'the appropriate number of'} meal(s) — same as yesterday's preference.
4. Keep the same JSON structure but REMOVE "strategyNote" and ADD "progressionNote".
5. Add a NEW field "progressionNote" explaining how you adapted from yesterday.

OUTPUT FORMAT:
Return a raw JSON object (no markdown, no code blocks) with this exact structure:
{
  "progressionNote": "1-2 sentence explanation of how you adapted this new plan from yesterday's plan.",
  "dailyTargets": {
    "calories": 2400,
    "protein": 180,
    "carbs": 260,
    "fat": 70
  },
  "meals": [
    {
      "id": "meal_1",
      "timing": "7:00 AM",
      "label": "Morning Fuel",
      "name": "Oats with Greek Yogurt & Berries",
      "emoji": "🥣",
      "calories": 480,
      "protein": 32,
      "carbs": 58,
      "fat": 12,
      "prepTime": "5 min",
      "ingredients": ["1 cup rolled oats", "150g Greek yogurt", "Handful blueberries", "1 tbsp honey", "1 scoop protein powder"]
    }
  ]
}

CRITICAL: Return ONLY the raw JSON. No markdown, no code fences.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Error generating progressive meal plan:', e);
    throw new Error(`Failed to generate progressive meal plan: ${e.message}`);
  }
};

