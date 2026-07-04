import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

export const generateMealPlan = async (goals, userProfile = {}) => {
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

  const systemPrompt = `You are an expert adaptive nutritionist and dietitian.

User Goals: ${goalStr}
${profileStr ? `User Profile: ${profileStr}` : ''}

CRITICAL INSTRUCTIONS:
1. The meal structure MUST be fully adaptive to the user's goals:
   - For "Build Muscle": Design 5-6 high-protein meals spread throughout the day (caloric surplus).
   - For "Lose Weight": Design a caloric deficit plan — could be 2-3 larger meals or intermittent fasting style (e.g. 16:8 window). Fewer but nutrient-dense meals.
   - For "Improve Fitness" or "Stay Healthy": Design 3-4 balanced meals with good variety.
   - If multiple goals exist, find the best nutritional strategy that serves all goals combined.
2. Do NOT force a fixed breakfast/lunch/dinner/snacks structure. Let the meal timing and count be dictated purely by the goal strategy.
3. Each meal must have a practical, home-cookable name. No generic names like "Meal 1".
4. Include a brief note about WHY this meal structure was chosen for the user's specific goals.
5. Emoji for each meal should reflect the food visually.

OUTPUT FORMAT:
Return a raw JSON object (no markdown, no code blocks) with this exact structure:
{
  "strategyNote": "1-2 sentence explanation of why this meal structure was chosen for these goals",
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

export const generateProgressiveMealPlan = async (currentPlan, goals, userProfile = {}, completedDays = 1) => {
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

  const systemPrompt = `You are an expert adaptive nutritionist and dietitian.

User Goals: ${goalStr}
${profileStr ? `User Profile: ${profileStr}` : ''}
Days of Nutrition Plan Completed: ${completedDays}

The user just completed this previous day's meal plan:
${JSON.stringify(currentPlan)}

CRITICAL INSTRUCTIONS:
1. Analyze the previous plan and create a NEW plan for tomorrow.
2. The new plan should show gradual progression or variation:
   - For Muscle Gain: Slightly increase calories/protein if they are progressing, or just provide variety.
   - For Weight Loss: Keep calories strict but change up the recipes to prevent diet fatigue.
   - For General Fitness: Introduce new healthy ingredients and a slightly different macro split for variety.
3. Keep the same JSON structure as the original meal plan but REMOVE "strategyNote" and ADD "progressionNote".
4. Add a NEW field "progressionNote" explaining how you adapted the plan from yesterday based on their goals and progress.

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

