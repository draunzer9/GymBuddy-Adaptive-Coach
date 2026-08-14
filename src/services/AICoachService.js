import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

// Subtle, user-adaptive coach tone, joint safety, and equipment locker integration
const getAdaptiveCoachPrompt = () => {
  const tone = localStorage.getItem('gymbuddy_coach_tone') || 'form';
  const experience = localStorage.getItem('gymbuddy_experience') || 'beginner';
  const savedEquip = localStorage.getItem('gymbuddy_equipment_list');
  const availableEquip = savedEquip ? JSON.parse(savedEquip) : ['barbell', 'dumbbells', 'machines', 'cable'];
  
  const savedPain = localStorage.getItem('gymbuddy_active_pain');
  const activePain = savedPain ? JSON.parse(savedPain) : [];
  
  const savedProfile = localStorage.getItem('gymbuddy_user_profile');
  let userProfile = {};
  if (savedProfile) {
    try { userProfile = JSON.parse(savedProfile); } catch (e) {}
  }

  let toneInstruction = '';
  if (tone === 'form') {
    toneInstruction = `- Emphasis: Prioritize explaining the biomechanics and exact form cues. Teach the user exactly how to move safely. Keep the encouragement quiet and supportive.`;
  } else if (tone === 'pace') {
    toneInstruction = `- Emphasis: Focus on workout pace, steady breathing, active recovery, and building a regular fitness habit. Keeps tone consistent and calm.`;
  } else if (tone === 'intensity') {
    toneInstruction = `- Emphasis: Highlight effort, pushing near limits, load selection, and progressive overload. Make encouragement focused on achieving target weights and reps.`;
  }

  let experienceInstruction = '';
  if (experience === 'beginner') {
    experienceInstruction = `- Experience Level: BEGINNER. Use zero fitness jargon. Explain all cues in simple, basic terms. Focus heavily on starting light and building confidence.`;
  } else if (experience === 'intermediate') {
    experienceInstruction = `- Experience Level: INTERMEDIATE. Balance simple cues with standard gym terms. Focus on progression and clean execution.`;
  } else {
    experienceInstruction = `- Experience Level: ADVANCED. Use standard athletic and anatomical terminology. Keep instructions direct, brief, and performance-oriented.`;
  }

  let safetyInstructions = [];
  const healthNote = (userProfile.medicalNotes || '').toLowerCase();
  const healthConds = userProfile.healthConditions || [];

  if (activePain.includes('knee') || healthNote.includes('acl') || healthConds.includes('acl') || healthConds.includes('knee')) {
    safetyInstructions.push(`- CRITICAL ACL SURGERY & KNEE REHAB CONSTRAINT: The user has Knee Joint Pain / ACL Surgery history. NEVER prescribe loaded Barbell Squats, heavy leg extensions, or deep knee flexion under heavy load. Substitute ONLY with low-impact, joint-safe exercises (e.g. Bodyweight Wall Sits, Glute Bridges, Light Leg Press within safe ROM, or Upper Body focus).`);
  }
  if (activePain.includes('back') || healthNote.includes('spine') || healthNote.includes('back')) {
    safetyInstructions.push(`- CRITICAL BACK PAIN CONSTRAINT: The user has lower back issues. Avoid heavy axial spinal loading like Barbell Squats or heavy Conventional Deadlifts. Use chest-supported or machine alternatives.`);
  }
  if (activePain.includes('shoulder')) {
    safetyInstructions.push(`- CRITICAL SHOULDER CONSTRAINT: The user has shoulder pain. Avoid overhead presses or deep dips.`);
  }

  return `
ADAPTIVE COACH PERSONA (SUBTLE & USER-SPECIFIC):
${experienceInstruction}
${toneInstruction}
- Available Equipment in Gym Locker: ${availableEquip.join(', ')}. Do NOT suggest workouts or exercises that require equipment NOT listed here.
${safetyInstructions.length > 0 ? `\nMEDICAL & JOINT SAFETY CONSTRAINTS:\n${safetyInstructions.join('\n')}` : ''}
`;
};

export const adaptWorkout = async (checkInAnswers, baseWorkout) => {
  const { feeling, time, issues } = checkInAnswers;
  
  if (!apiKey) {
    console.error("Missing Gemini API Key. Using fallback logic.");
    const fallbackResponse = fallbackAdaptWorkout(checkInAnswers, baseWorkout);
    fallbackResponse.message = "⚠️ API Key Missing! Using fallback offline workout.\n\n" + fallbackResponse.message;
    return fallbackResponse;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are a fitness coach.
Your Role:
- Keep workouts simple and achievable
- Adapt to real constraints (time, energy, equipment, pain)
- Celebrate small wins
- Explain things in plain English

Your Tone:
- Encouraging and clear (never judgment)
- Practical and real-world focused
- Confident (users should trust you)
- Brief (no long explanations)

${getAdaptiveCoachPrompt()}

PART 2: DAILY CHECK-IN & REAL-TIME ADAPTATION
The user just checked in with the following constraints:
Feeling: ${feeling}
Time: ${time}
Physical issues: ${issues.join(', ')}

Base Workout Planned for Today: 
Title: ${baseWorkout.title}
Duration: ${baseWorkout.duration}
Number of exercises planned: ${baseWorkout.exercisesCount || baseWorkout.exercises || 'Not specified'}

If they have less time than planned, prioritize the workout and tell them the priority order (quality over quantity).
If they flagged pain, tell them to SKIP the exercise that hurts and DO a safer alternative INSTEAD.
If their energy is low/tired, give them a LIGHTER VERSION (lighter weight, longer rests, skip last exercise).
If everything is good (Great/Good, 60+ min, None), just hype them up.

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON object EXACTLY matching this structure. The exercisesList MUST contain EXACTLY ${baseWorkout.exercisesCount || 4} exercises — this is the number planned for today's workout. Do NOT add more or fewer exercises than this count unless the user explicitly has less time, in which case you can reduce.
{
  "message": "Your conversational coaching message to the user based on the rules. Use paragraphs (\\n\\n).",
  "workout": {
    "title": "Adapted title (or keep the same)",
    "duration": "Adapted duration — if the user's time matches, use '${baseWorkout.duration}'. Only reduce if user has less time.",
    "exercisesList": [
      {
        "id": "e1",
        "name": "Barbell Bench Press",
        "sets": 3,
        "reps": "8-12",
        "weight": "20",
        "restSeconds": 60,
        "type": "Free Weight",
        "difficulty": "Beginner",
        "muscles": ["Chest", "Shoulders", "Triceps"],
        "instructions": ["Lie on bench, feet flat on floor", "Grip bar slightly wider than shoulder width", "Lower bar to mid chest", "Push bar up until arms are extended"],
        "videoUrl": "https://www.youtube.com/results?search_query=Barbell+Bench+Press",
        "bodyDiagramUrl": "https://loremflickr.com/500/500/anatomy,chest"
      }
    ]
  }
}
CRITICAL INSTRUCTIONS: 
1. The JSON above is ONLY an example of the structure. DO NOT just return "Barbell Bench Press". You MUST generate EXACTLY ${baseWorkout.exercisesCount || 4} REAL, UNIQUE exercises that actually fit the "Base Workout Planned for Today".
2. STRICTLY respect the exercise count: ${baseWorkout.exercisesCount || 4} exercises. Do not add extra exercises.
3. STRICTLY respect the duration: the workout should take approximately ${baseWorkout.duration}. Only shorten it if the user has less time available.
4. For videoUrl, construct a direct YouTube search link (https://www.youtube.com/results?search_query=...). 
5. For bodyDiagramUrl, construct an image URL using https://loremflickr.com/500/500/anatomy, followed by the primary target muscle (e.g., anatomy,chest). 
6. Do not use markdown blocks like \`\`\`json. Return ONLY the raw JSON string so it can be parsed natively.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting from the LLM
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    return parsed;
  } catch (e) {
    console.error("Error parsing AI Coach response:", e);
    const fallbackResponse = fallbackAdaptWorkout(checkInAnswers, baseWorkout);
    fallbackResponse.message = `⚠️ Error parsing Gemini response: ${e.message}\n\nFalling back to offline workout.`;
    return fallbackResponse;
  }
};

const fallbackAdaptWorkout = (checkInAnswers, baseWorkout) => {
  const { feeling, time, issues } = checkInAnswers;
  
  // Base case: everything is good
  if ((feeling === 'Great' || feeling === 'Good') && time === '60+ min' && issues.includes('None')) {
    return {
      message: "Perfect. You're set up for a great day.\n\nToday's workout is ready.\n\nFocus on good form. You got this! 💪",
      workout: {
        ...baseWorkout,
        exercisesList: [
          {
            id: "e1",
            name: "Barbell Bench Press",
            sets: 3,
            reps: "8-12",
            weight: "60",
            restSeconds: 60,
            type: "Free Weight",
            difficulty: "Beginner",
            muscles: ["Chest", "Shoulders", "Triceps"],
            instructions: ["Lie on bench, feet flat on floor", "Grip bar slightly wider than shoulder width", "Lower bar to mid chest", "Push bar up until arms are extended"],
            videoUrl: "https://www.youtube.com/results?search_query=Barbell+Bench+Press",
            bodyDiagramUrl: "https://loremflickr.com/500/500/anatomy,chest"
          }
        ]
      }
    };
  }

  let messageParts = [];
  let adaptedWorkout = { 
    ...baseWorkout,
    exercisesList: [
      {
        id: "e1",
        name: "Barbell Bench Press",
        sets: 3,
        reps: "8-12",
        weight: "60",
        restSeconds: 60,
        type: "Free Weight",
        difficulty: "Beginner",
        muscles: ["Chest", "Shoulders", "Triceps"],
        instructions: ["Lie on bench, feet flat on floor", "Grip bar slightly wider than shoulder width", "Lower bar to mid chest", "Push bar up until arms are extended"],
        videoUrl: "https://www.youtube.com/results?search_query=Barbell+Bench+Press",
        bodyDiagramUrl: "https://loremflickr.com/500/500/anatomy,chest"
      },
      {
        id: "e2",
        name: "Machine Shoulder Press",
        sets: 3,
        reps: "10-12",
        weight: "30",
        restSeconds: 60,
        type: "Machine",
        difficulty: "Beginner",
        muscles: ["Shoulders", "Triceps"],
        instructions: ["Adjust seat height", "Press handles overhead"],
        videoUrl: "https://www.youtube.com/results?search_query=Machine+Shoulder+Press",
        bodyDiagramUrl: "https://loremflickr.com/500/500/anatomy,shoulders"
      }
    ]
  };

  // Rule 1: Less time than planned
  if (time === '15 min' || time === '20 min' || time === '30 min') {
    messageParts.push(`Got it—you have ${time} today.\n\nHere's the priority order:\n1. [Main Compound Lift]\n2. [Secondary Accessory]\n3. [Bonus if you have time]\n\nYou'll still hit your goal. Quality over quantity. Let's go.`);
    adaptedWorkout.duration = time;
    adaptedWorkout.exercisesList = adaptedWorkout.exercisesList.slice(0, 1); // priority only
  }

  // Rule 2: Pain flagged
  const painIssues = issues.filter(i => i !== 'None');
  if (painIssues.length > 0) {
    const issueStr = painIssues.join(' and ').toLowerCase();
    messageParts.push(`You mentioned ${issueStr}.\n\nSKIP: [Original exercise that hurts]\nDO INSTEAD: [Safer alternative]\n\nThis hits the same muscle, just easier on your body right now. Still gets the job done.`);
  }

  // Rule 3: Low Energy
  if (feeling === 'Tired' || feeling === 'Unwell') {
    messageParts.push(`You're tired today—that's normal. Here's the plan:\n\nLIGHTER VERSION:\n- Same exercises, lighter weight (don't ego-lift)\n- Take longer rests (60-90 sec instead of 45)\n- Skip the last exercise if energy drops halfway\n\nYou'll recover better and be stronger tomorrow.`);
  }

  return {
    message: messageParts.length > 0 ? messageParts.join('\n\n---\n\n') : "Perfect. You're set up for a great day.\n\nToday's workout is ready.\n\nFocus on good form. You got this! 💪",
    workout: adaptedWorkout
  };
};

export const generateWeeklyPlan = async (onboardingData) => {
  const { goal, experience, availableTime, equipment, healthConditions, otherCondition } = onboardingData;
  const healthStr = healthConditions.map(c => c === 'other' ? otherCondition : c).join(', ');

  if (!apiKey) {
    return [{ day: "ERROR", title: "API Key Missing", duration: "Restart Vite server", exercisesCount: 0 }];
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are a beginner-friendly fitness coach for budget gym users.
PART 1: ONBOARDING & FIRST WEEK PLAN
The user has completed onboarding with the following constraints:
Goal: ${goal}
Experience Level: ${experience}
Available Time: ${availableTime}
Equipment Access: ${equipment.length > 0 ? equipment.join(', ') : 'None'}
Health Conditions: ${healthStr || 'None'}

Generate a simple, clear workout plan for their FIRST week.

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON array of exactly 3 to 4 workout objects depending on their experience and goals.
[
  {
    "day": "MONDAY",
    "title": "Workout title (e.g. Chest & Back)",
    "duration": "Estimated time (e.g. 30 Minutes)",
    "exercisesCount": 4
  }
]
CRITICAL: Do not use markdown blocks like \`\`\`json. Return ONLY the raw JSON array string.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Error generating weekly plan:", e);
    return [{ day: "ERROR", title: "Invalid API Key or Error", duration: e.message, exercisesCount: 0 }];
  }
};

const fallbackGenerateWeeklyPlan = () => [
  { day: "MONDAY", title: "Chest & Back", duration: "30 Minutes", exercisesCount: 3 },
  { day: "WEDNESDAY", title: "Legs & Core", duration: "30 Minutes", exercisesCount: 4 },
  { day: "FRIDAY", title: "Full Body Burn", duration: "30 Minutes", exercisesCount: 4 }
];

export const generateNextWeeklyPlan = async (completedCount, workoutHistory = []) => {
  if (!apiKey) {
    return fallbackGenerateNextWeeklyPlan();
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const historySummary = workoutHistory.map(w => 
    `- ${w.title}: ${w.exercisesList ? w.exercisesList.length : 0} exercises done.`
  ).join('\n');

  const systemPrompt = `You are a fitness coach. 
The user has successfully completed ${completedCount} workouts and finished their current weekly plan!

Here is a summary of the workouts they completed last week:
${historySummary || "No detailed history available."}

${getAdaptiveCoachPrompt()}

Generate their NEXT week's workout plan (Week 2+ progression). 
Analyze their past week. If they did full body, maybe introduce a split (Upper/Lower). If they did a split, progress it slightly. Keep it achievable, but slightly progressive (maybe 1 more exercise or slightly longer duration).

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON array of exactly 3 workout objects.
[
  {
    "day": "DAY 1",
    "title": "Workout title (e.g. Push Progression)",
    "duration": "Estimated time (e.g. 35 Minutes)",
    "exercisesCount": 5
  }
]
CRITICAL: Do not use markdown blocks like \`\`\`json. Return ONLY the raw JSON array string.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Error generating next weekly plan:", e);
    return fallbackGenerateNextWeeklyPlan();
  }
};

const fallbackGenerateNextWeeklyPlan = () => [
  { day: "DAY 1", title: "Upper Body Power", duration: "35 Minutes", exercisesCount: 4 },
  { day: "DAY 2", title: "Lower Body Strength", duration: "35 Minutes", exercisesCount: 5 },
  { day: "DAY 3", title: "Full Body Conditioning", duration: "35 Minutes", exercisesCount: 5 }
];

export const performMidWeekCheckpoint = async (userProfile, weeklyPlan, completedWorkouts, userStatus) => {
  if (!apiKey) {
    throw new Error('API key missing. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are GymBuddy's Adaptive AI Coach.

Your role is to perform a Weekly Coach Checkpoint, typically in the middle of the user's training week (e.g., Wednesday), by analyzing progress, identifying barriers, and intelligently adapting the remaining workout plan.

GymBuddy's primary mission is NOT to maximize workout volume. Its mission is to help beginners successfully complete their first four weeks by adapting to real-life constraints while maintaining consistency.

## Your Responsibilities

You must:
1. Review the user's progress so far this week.
2. Identify what is helping or preventing consistency.
3. Explain your reasoning transparently.
4. Adapt only the remaining workouts of the current week.
5. Preserve the user's long-term fitness goal.
6. Keep recommendations realistic and encouraging.
7. Prioritize consistency over perfection.

--------------------------------------------------

INPUT

### User Profile
\${JSON.stringify(userProfile, null, 2)}

### Weekly Plan (Remaining Workouts)
\${JSON.stringify(weeklyPlan, null, 2)}

### Current Week Progress
Completed Workouts: \${completedWorkouts}

### Current User Status
\${JSON.stringify(userStatus, null, 2)}

--------------------------------------------------

STEP 1 — CONSISTENCY ANALYSIS
Calculate planned vs completed workouts. Identify patterns (missed due to lack of time, fatigue, low motivation, etc.). Never blame the user. Treat missed workouts as useful info.

STEP 2 — TRAINING ANALYSIS
Evaluate volume, muscle groups trained, recovery status. Determine if recovering well, fatigued, under-training, or over-training.

STEP 3 — HEALTH & SAFETY ANALYSIS
If pain/discomfort is reported, modify exercises or reduce volume. Never recommend exercises that could worsen pain.

STEP 4 — ADAPT THE REMAINING WEEK
Modify ONLY the remaining workouts provided in the "Weekly Plan". Possible adaptations: reduce duration, sets, volume, replace lifts, add recovery, condense. Never restart the week. Never make users "catch up". Always make success achievable.

STEP 5 — EXPLAIN YOUR DECISIONS
Before showing the updated plan, explain what happened, what you observed, and why changes are necessary. Transparency builds trust.

STEP 6 — OUTPUT THE UPDATED PLAN
Output the newly adapted remaining workouts.

STEP 7 — MOTIVATION
Finish positively.

RULES
DO NOT: Restart plan, shame user, ignore health/time, increase volume after missed, suggest unsafe exercises.
ALWAYS: Adapt to real life, preserve goal, explain reasoning, keep plans achievable, prioritize consistency over intensity.

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON object EXACTLY matching this structure:
{
  "coachMessage": "Your explanation and motivation (paragraphs separated by \\n\\n).",
  "adaptedRemainingWorkouts": [
    {
      "day": "Day identifier or label",
      "title": "Workout focus",
      "duration": "Estimated duration",
      "exercisesCount": 4
    }
  ]
}

CRITICAL: Return ONLY the raw JSON object. Do not include markdown code blocks.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Error generating mid-week checkpoint:", e);
    // Offline fallback for rate limits
    return {
      coachMessage: `⚠️ Error fetching from Gemini API: ${e.message}\n\nFalling back to offline mode. You're doing great so far! Let's keep the momentum going and stick to the original plan for the rest of the week.`,
      adaptedRemainingWorkouts: weeklyPlan
    };
  }
};

export const generateAlternativeExercise = async (currentExercise) => {
  if (!apiKey) {
    console.warn("API key missing. Using fallback swap.");
    return fallbackSwap(currentExercise);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `You are an expert fitness AI. 
The user is at the gym, but the equipment for their current exercise is busy. 
Your task is to provide exactly 3 alternative exercises that target the exact same muscle groups, but use different equipment.

Current Exercise:
\${JSON.stringify(currentExercise, null, 2)}

${getAdaptiveCoachPrompt()}

CRITICAL INSTRUCTIONS:
1. Suggest exactly 3 exercises that target the exact same primary muscles (${currentExercise.muscles ? currentExercise.muscles.join(', ') : 'the same muscles'}).
2. Ensure the new exercises use DIFFERENT equipment than the original (e.g. if Barbell is busy, suggest one Dumbbell, one Machine, and one Bodyweight/Cable alternative).
3. Do NOT change the number of sets or reps. Keep the volume identical to the original.
4. Assign a realistic "similarityScore" percentage (e.g. 85, 80, 75) to indicate how closely it matches the original exercise biomechanically.
5. Keep the same JSON structure as the original exercise for each alternative.

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON ARRAY EXACTLY matching this structure:
[
  {
    "id": "e_alt_${Date.now()}_1",
    "name": "Dumbbell Alternative Name",
    "similarityScore": 85,
    "sets": ${currentExercise.sets || 3},
    "reps": "${currentExercise.reps || '8-12'}",
    "weight": "${currentExercise.weight || '20'}",
    "restSeconds": ${currentExercise.restSeconds || 60},
    "type": "Free Weight",
    "difficulty": "${currentExercise.difficulty || 'Beginner'}",
    "muscles": ${JSON.stringify(currentExercise.muscles || [])},
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "tips": ["Tip 1", "Tip 2"]
  },
  {
    "id": "e_alt_${Date.now()}_2",
    "name": "Machine Alternative Name",
    "similarityScore": 80,
    ...
  },
  {
    "id": "e_alt_${Date.now()}_3",
    "name": "Bodyweight/Cable Alternative Name",
    "similarityScore": 75,
    ...
  }
]

CRITICAL: Return ONLY the raw JSON array. Do not include markdown code blocks.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Error generating alternative exercise:", e);
    return fallbackSwap(currentExercise);
  }
};

const fallbackSwap = (currentExercise) => {
  // Offline fallback returns 3 mock alternatives
  const baseName = currentExercise.name.replace(/(Barbell|Dumbbell|Machine|Cable)/ig, '').trim();
  
  return [
    {
      ...currentExercise,
      id: `e_alt_${Date.now()}_1`,
      name: `Dumbbell ${baseName}`,
      type: 'Free Weight',
      similarityScore: 85,
      instructions: ["Adjust equipment to fit your body", "Maintain controlled form throughout"],
      tips: ["Offline fallback option 1"]
    },
    {
      ...currentExercise,
      id: `e_alt_${Date.now()}_2`,
      name: `Machine ${baseName}`,
      type: 'Machine',
      similarityScore: 80,
      instructions: ["Adjust equipment to fit your body", "Maintain controlled form throughout"],
      tips: ["Offline fallback option 2"]
    },
    {
      ...currentExercise,
      id: `e_alt_${Date.now()}_3`,
      name: `Cable ${baseName}`,
      type: 'Cable',
      similarityScore: 75,
      instructions: ["Adjust equipment to fit your body", "Maintain controlled form throughout"],
      tips: ["Offline fallback option 3"]
    }
  ];
};

