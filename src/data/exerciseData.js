/* Muscle anatomy SVG diagrams - inline data */

export const MUSCLE_DIAGRAMS = {
  chest: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="150" rx="70" ry="90" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <!-- Body outline -->
    <path d="M60,80 Q100,60 140,80 L150,180 Q130,220 100,230 Q70,220 50,180 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- Neck -->
    <rect x="85" y="50" width="30" height="30" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- Head -->
    <ellipse cx="100" cy="35" rx="22" ry="26" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- LEFT PECTORAL - highlighted -->
    <path d="M65,95 Q72,88 90,90 Q100,92 100,110 Q85,118 65,112 Z" fill="#e74c3c" opacity="0.85" rx="8"/>
    <!-- RIGHT PECTORAL - highlighted -->
    <path d="M100,92 Q115,88 135,95 L135,112 Q115,118 100,110 Z" fill="#e74c3c" opacity="0.75" rx="8"/>
    <!-- Shoulders (secondary) -->
    <ellipse cx="52" cy="98" rx="16" ry="12" fill="#e67e22" opacity="0.6"/>
    <ellipse cx="148" cy="98" rx="16" ry="12" fill="#e67e22" opacity="0.6"/>
    <!-- Arms -->
    <path d="M36,95 Q28,130 32,165" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M164,95 Q172,130 168,165" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Abdomen -->
    <path d="M75,120 Q100,118 125,120 L128,175 Q100,185 72,175 Z" fill="#1e1e3a" stroke="#444" stroke-width="1"/>
    <!-- Abs lines -->
    <line x1="78" y1="135" x2="122" y2="135" stroke="#333" stroke-width="1"/>
    <line x1="78" y1="152" x2="122" y2="152" stroke="#333" stroke-width="1"/>
    <line x1="100" y1="120" x2="100" y2="175" stroke="#333" stroke-width="1"/>
    <!-- Labels -->
    <text x="100" y="275" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Chest (Primary)</text>
    <text x="52" y="290" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Shoulders</text>
    <text x="148" y="290" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Triceps</text>
  </svg>`,

  shoulders: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="150" rx="70" ry="90" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <path d="M60,80 Q100,60 140,80 L150,180 Q130,220 100,230 Q70,220 50,180 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="85" y="50" width="30" height="30" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="35" rx="22" ry="26" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- SHOULDERS highlighted -->
    <ellipse cx="52" cy="96" rx="20" ry="15" fill="#e74c3c" opacity="0.9"/>
    <ellipse cx="148" cy="96" rx="20" ry="15" fill="#e74c3c" opacity="0.9"/>
    <!-- Chest (secondary) -->
    <path d="M65,95 Q100,88 135,95 L135,115 Q100,122 65,115 Z" fill="#e67e22" opacity="0.5"/>
    <!-- Arms -->
    <path d="M36,95 Q28,130 32,165" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M164,95 Q172,130 168,165" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Triceps highlight -->
    <path d="M32,105 Q22,125 28,148" stroke="#e67e22" stroke-width="8" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M168,105 Q178,125 172,148" stroke="#e67e22" stroke-width="8" fill="none" opacity="0.6" stroke-linecap="round"/>
    <path d="M75,120 Q100,118 125,120 L128,175 Q100,185 72,175 Z" fill="#1e1e3a" stroke="#444" stroke-width="1"/>
    <text x="100" y="275" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Shoulders (Primary)</text>
    <text x="100" y="290" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Chest · Triceps (Secondary)</text>
  </svg>`,

  back: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="150" rx="70" ry="90" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <!-- Back body -->
    <path d="M62,80 Q100,62 138,80 L145,182 Q125,222 100,230 Q75,222 55,182 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="85" y="50" width="30" height="30" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="35" rx="22" ry="26" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- Spine -->
    <line x1="100" y1="80" x2="100" y2="185" stroke="#333" stroke-width="2" stroke-dasharray="4,3"/>
    <!-- LATS highlighted -->
    <path d="M62,90 Q55,115 62,145 Q78,155 100,150 Q100,125 92,100 Z" fill="#e74c3c" opacity="0.85"/>
    <path d="M138,90 Q145,115 138,145 Q122,155 100,150 Q100,125 108,100 Z" fill="#e74c3c" opacity="0.85"/>
    <!-- Traps (secondary) -->
    <path d="M72,80 Q100,72 128,80 L125,100 Q100,93 75,100 Z" fill="#e67e22" opacity="0.6"/>
    <!-- Rhomboids -->
    <path d="M82,105 Q100,100 118,105 L116,130 Q100,125 84,130 Z" fill="#e67e22" opacity="0.4"/>
    <!-- Lower back -->
    <path d="M82,155 Q100,150 118,155 L115,185 Q100,190 85,185 Z" fill="#e67e22" opacity="0.45"/>
    <!-- Arms -->
    <path d="M38,92 Q28,128 34,162" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M162,92 Q172,128 166,162" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <!-- Biceps secondary -->
    <path d="M34,100 Q26,120 30,142" stroke="#e67e22" stroke-width="7" fill="none" opacity="0.5" stroke-linecap="round"/>
    <path d="M166,100 Q174,120 170,142" stroke="#e67e22" stroke-width="7" fill="none" opacity="0.5" stroke-linecap="round"/>
    <text x="100" y="272" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Back / Lats (Primary)</text>
    <text x="100" y="287" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Traps · Biceps (Secondary)</text>
  </svg>`,

  legs: `<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="165" rx="70" ry="100" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <!-- Torso -->
    <path d="M68,55 Q100,42 132,55 L138,120 Q100,128 62,120 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="85" y="28" width="30" height="28" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="16" rx="20" ry="22" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- Hips -->
    <path d="M62,118 Q100,125 138,118 L140,145 Q100,152 60,145 Z" fill="#252545" stroke="#444"/>
    <!-- LEFT LEG QUADS - highlighted -->
    <path d="M62,143 Q72,140 88,143 L90,205 Q78,210 62,205 Z" fill="#e74c3c" opacity="0.85"/>
    <!-- RIGHT LEG QUADS - highlighted -->
    <path d="M112,143 Q128,140 138,143 L138,205 Q122,210 110,205 Z" fill="#e74c3c" opacity="0.85"/>
    <!-- Calves (secondary) -->
    <path d="M63,207 Q72,205 88,207 L88,255 Q78,260 63,255 Z" fill="#e67e22" opacity="0.55"/>
    <path d="M112,207 Q128,205 137,207 L137,255 Q127,260 112,255 Z" fill="#e67e22" opacity="0.55"/>
    <!-- Glutes (secondary) -->
    <ellipse cx="78" cy="138" rx="14" ry="10" fill="#e67e22" opacity="0.4"/>
    <ellipse cx="122" cy="138" rx="14" ry="10" fill="#e67e22" opacity="0.4"/>
    <!-- Inner leg separation -->
    <line x1="100" y1="143" x2="100" y2="270" stroke="#1a1a2e" stroke-width="6"/>
    <text x="100" y="295" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Quads / Hamstrings (Primary)</text>
    <text x="100" y="310" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Glutes · Calves (Secondary)</text>
  </svg>`,

  arms: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="150" rx="70" ry="90" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <path d="M65,82 Q100,65 135,82 L142,175 Q125,215 100,225 Q75,215 58,175 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="86" y="52" width="28" height="28" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="38" rx="20" ry="24" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- BICEPS highlighted (front of arms) -->
    <path d="M38,98 Q30,118 34,145" stroke="#e74c3c" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M162,98 Q170,118 166,145" stroke="#e74c3c" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>
    <!-- TRICEPS highlighted (back) -->
    <path d="M35,100 Q25,122 30,148" stroke="#e67e22" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M165,100 Q175,122 170,148" stroke="#e67e22" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>
    <!-- Forearms -->
    <path d="M35,148 Q30,172 38,192" stroke="#333" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M165,148 Q170,172 162,192" stroke="#333" stroke-width="10" fill="none" stroke-linecap="round"/>
    <!-- Chest outline -->
    <path d="M68,95 Q100,88 132,95 L130,118 Q100,124 70,118 Z" fill="#252540" stroke="#444" stroke-width="1"/>
    <text x="100" y="272" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Biceps (Primary)</text>
    <text x="100" y="287" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Triceps · Forearms (Secondary)</text>
  </svg>`,

  triceps: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="150" rx="70" ry="90" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <path d="M65,82 Q100,65 135,82 L142,175 Q125,215 100,225 Q75,215 58,175 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="86" y="52" width="28" height="28" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="38" rx="20" ry="24" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- TRICEPS highlighted -->
    <path d="M33,98 Q23,122 28,150" stroke="#e74c3c" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>
    <path d="M167,98 Q177,122 172,150" stroke="#e74c3c" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>
    <!-- Shoulders (secondary) -->
    <ellipse cx="52" cy="95" rx="18" ry="13" fill="#e67e22" opacity="0.6"/>
    <ellipse cx="148" cy="95" rx="18" ry="13" fill="#e67e22" opacity="0.6"/>
    <!-- Chest (secondary) -->
    <path d="M68,95 Q100,88 132,95 L130,118 Q100,124 70,118 Z" fill="#e67e22" opacity="0.35"/>
    <path d="M36,148 Q30,172 38,192" stroke="#333" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M164,148 Q170,172 162,192" stroke="#333" stroke-width="10" fill="none" stroke-linecap="round"/>
    <text x="100" y="272" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Triceps (Primary)</text>
    <text x="100" y="287" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Shoulders · Chest (Secondary)</text>
  </svg>`,

  core: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="150" rx="70" ry="90" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <path d="M65,80 Q100,62 135,80 L142,182 Q125,222 100,232 Q75,222 58,182 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="86" y="50" width="28" height="30" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="36" rx="21" ry="25" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <!-- Chest outline -->
    <path d="M68,92 Q100,85 132,92 L130,115 Q100,120 70,115 Z" fill="#252540" stroke="#444"/>
    <!-- CORE / ABS highlighted -->
    <rect x="78" y="118" width="44" height="62" rx="8" fill="#e74c3c" opacity="0.8"/>
    <!-- Abs grid lines -->
    <line x1="78" y1="136" x2="122" y2="136" stroke="#c0392b" stroke-width="1.5"/>
    <line x1="78" y1="154" x2="122" y2="154" stroke="#c0392b" stroke-width="1.5"/>
    <line x1="100" y1="118" x2="100" y2="180" stroke="#c0392b" stroke-width="1.5"/>
    <!-- Obliques (secondary) -->
    <path d="M58,120 Q70,130 75,165 Q62,172 55,160 Z" fill="#e67e22" opacity="0.6"/>
    <path d="M142,120 Q130,130 125,165 Q138,172 145,160 Z" fill="#e67e22" opacity="0.6"/>
    <!-- Hip area -->
    <path d="M62,178 Q100,185 138,178 L136,195 Q100,200 64,195 Z" fill="#252540" stroke="#444"/>
    <!-- Arms -->
    <path d="M37,95 Q28,130 33,165" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M163,95 Q172,130 167,165" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <text x="100" y="275" text-anchor="middle" fill="#e74c3c" font-size="11" font-family="Arial" font-weight="bold">Core / Abs (Primary)</text>
    <text x="100" y="290" text-anchor="middle" fill="#e67e22" font-size="9" font-family="Arial">Obliques (Secondary)</text>
  </svg>`,

  default: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="100" cy="155" rx="72" ry="95" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <path d="M62,82 Q100,64 138,82 L145,185 Q125,225 100,235 Q75,225 55,185 Z" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <rect x="85" y="52" width="30" height="30" rx="5" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <ellipse cx="100" cy="38" rx="22" ry="26" fill="#252540" stroke="#444" stroke-width="1.5"/>
    <path d="M68,95 Q100,88 132,95 L130,120 Q100,126 70,120 Z" fill="#3a3a5c" stroke="#555"/>
    <path d="M75,122 Q100,118 125,122 L122,178 Q100,185 78,178 Z" fill="#3a3a5c" stroke="#555"/>
    <line x1="78" y1="138" x2="122" y2="138" stroke="#444" stroke-width="1"/>
    <line x1="78" y1="155" x2="122" y2="155" stroke="#444" stroke-width="1"/>
    <line x1="100" y1="122" x2="100" y2="178" stroke="#444" stroke-width="1"/>
    <path d="M37,95 Q28,132 34,168" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M163,95 Q172,132 166,168" stroke="#444" stroke-width="12" fill="none" stroke-linecap="round"/>
    <ellipse cx="50" cy="97" rx="17" ry="12" fill="#3a3a5c" stroke="#555"/>
    <ellipse cx="150" cy="97" rx="17" ry="12" fill="#3a3a5c" stroke="#555"/>
    <text x="100" y="278" text-anchor="middle" fill="#aaa" font-size="11" font-family="Arial">Full Body</text>
  </svg>`
};

/**
 * Given a muscle group name, returns the matching SVG diagram string.
 */
export const getMuscleAnatomy = (muscles = []) => {
  const primary = muscles[0]?.toLowerCase() || '';
  if (primary.includes('chest') || primary.includes('pec')) return MUSCLE_DIAGRAMS.chest;
  if (primary.includes('shoulder') || primary.includes('delt')) return MUSCLE_DIAGRAMS.shoulders;
  if (primary.includes('back') || primary.includes('lat') || primary.includes('trap') || primary.includes('rhomboid') || primary.includes('row')) return MUSCLE_DIAGRAMS.back;
  if (primary.includes('leg') || primary.includes('quad') || primary.includes('hamstring') || primary.includes('glute') || primary.includes('calf')) return MUSCLE_DIAGRAMS.legs;
  if (primary.includes('tricep')) return MUSCLE_DIAGRAMS.triceps;
  if (primary.includes('bicep') || primary.includes('arm') || primary.includes('forearm') || primary.includes('curl')) return MUSCLE_DIAGRAMS.arms;
  if (primary.includes('core') || primary.includes('abs') || primary.includes('oblique') || primary.includes('abdominal')) return MUSCLE_DIAGRAMS.core;
  return MUSCLE_DIAGRAMS.default;
};

/**
 * Curated map of common exercises to their known YouTube video IDs.
 * This is 100% reliable — no API calls needed.
 */
export const EXERCISE_VIDEO_MAP = {
  // CHEST
  'barbell bench press': 'rT7DgCr-3pg',
  'bench press': 'rT7DgCr-3pg',
  'incline bench press': 'DbFgADa2PL8',
  'incline dumbbell press': 'DbFgADa2PL8',
  'dumbbell bench press': '1eO7MbRoCkw',
  'dumbbell fly': 'eozdVDA78K0',
  'cable fly': 'Iwe6AmxVf7o',
  'chest fly': 'eozdVDA78K0',
  'push up': 'IODxDxX7oi4',
  'push-up': 'IODxDxX7oi4',
  'chest press machine': 'xUm0BiZCB_8',

  // BACK
  'pull up': 'eGo4IYlbE5g',
  'pull-up': 'eGo4IYlbE5g',
  'lat pulldown': 'CAwf7n6Luuc',
  'barbell row': 'FWJR5Ve8bnQ',
  'bent over row': 'FWJR5Ve8bnQ',
  'seated cable row': 'GZbfZ033f74',
  'dumbbell row': 'pYcpY20QaE8',
  'deadlift': 'op9kVnSso6Q',
  'romanian deadlift': 'JCXUYuzwNrM',
  'face pull': 'rep-qVOkqgk',
  't-bar row': 'j3Igk5nyZE4',

  // SHOULDERS
  'overhead press': 'QAQ64nK-KIg',
  'barbell overhead press': 'QAQ64nK-KIg',
  'dumbbell shoulder press': 'qEwKCR5JCog',
  'military press': 'QAQ64nK-KIg',
  'lateral raise': 'XPPfnSEATJA',
  'front raise': 'sOiBHj5m1oE',
  'rear delt fly': 'EA7u4Q_8HQ0',
  'arnold press': '6Z15_WdXmVw',
  'machine shoulder press': 'Wqq43dKW1TU',

  // LEGS
  'squat': 'ultWZbUMPL8',
  'barbell squat': 'ultWZbUMPL8',
  'goblet squat': 'MxsFDhcyFyE',
  'leg press': 'IZxyjW7MPJQ',
  'lunge': 'QOVaHwm-Q6U',
  'walking lunge': 'L8fvypPrv9s',
  'romanian deadlift rdl': 'JCXUYuzwNrM',
  'leg curl': 'ELOCsoDSmrg',
  'leg extension': 'YyvSfVjQeL0',
  'calf raise': 'gwLzBJYoWlQ',
  'hip thrust': 'SEdqd1n0cvg',
  'glute bridge': 'wPM8icPu6H8',

  // ARMS
  'bicep curl': 'ykJmrZ5v0Oo',
  'dumbbell curl': 'ykJmrZ5v0Oo',
  'barbell curl': 'kwG2ipFRgfo',
  'hammer curl': 'zC3nLlEvin4',
  'preacher curl': 'fIWP-FRFNU0',
  'cable curl': 'NFzTWp2qpiE',
  'tricep pushdown': 'vB5OHsJ3EME',
  'tricep dip': '6kALZikXxLc',
  'skull crusher': 'NIKnxbNLjP4',
  'close grip bench press': 'BjhPsrHj5ZU',
  'overhead tricep extension': 'nRiJVZDpdL0',
  'dips': '6kALZikXxLc',

  // CORE
  'plank': 'pSHjTRCQxIw',
  'crunch': 'Xyd_fa5zoEU',
  'sit up': 'jDwoBqPH0jk',
  'russian twist': 'wkD8rjkodUI',
  'cable crunch': 'taI4XduLpTk',
  'hanging leg raise': 'Pr1ieGZ5atk',
  'mountain climber': 'nmwgirgXLYM',
  'ab rollout': 'z0B6kVxpMXA',
  'leg raise': 'l4kQd9eWclE',
};

/**
 * Given an exercise name, returns the best matching YouTube video ID.
 */
export const getVideoId = (exerciseName = '') => {
  const name = exerciseName.toLowerCase().trim();
  // Exact match first
  if (EXERCISE_VIDEO_MAP[name]) return EXERCISE_VIDEO_MAP[name];
  // Partial match
  for (const [key, id] of Object.entries(EXERCISE_VIDEO_MAP)) {
    if (name.includes(key) || key.includes(name)) return id;
  }
  // Default fallback to a generic workout tutorial
  return null;
};
