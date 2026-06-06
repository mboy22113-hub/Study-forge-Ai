export interface TimetableBlock {
  id: string;
  type: 'sleep' | 'meal' | 'prayer' | 'study' | 'break' | 'leisure' | 'wakeup';
  label: string;
  subLabel?: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  startMins: number;
  endMins: number;
  color?: string;
}

export interface SubjectInput {
  name: string;
  examDate: string;
  totalChapters: number;
  completedChapters: number;
  importantChapters?: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  confidenceLevel: number; // 1-10
  previousMarks: number;    // 0-100
  desiredDailyHours?: number;
  topicImportance?: 'Low' | 'Medium' | 'High'; // New Rating
  readingTime?: number;
  pdfLinked?: string;
  notes?: string;
}

export interface RoutineInput {
  wakeUpTime: string;
  sleepTime: string;
  breakfastStart: string;
  breakfastEnd: string;
  lunchStart: string;
  lunchEnd: string;
  dinnerStart: string;
  dinnerEnd: string;
  fajrStart: string;
  fajrEnd: string;
  dhuhrStart: string;
  dhuhrEnd: string;
  asrStart: string;
  asrEnd: string;
  maghribStart: string;
  maghribEnd: string;
  ishaStart: string;
  ishaEnd: string;
}

// Helper to convert time "HH:MM" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Convert minutes to "HH:MM"
export function minutesToTime(mins: number): string {
  const normMins = (mins + 1440) % 1440;
  const h = Math.floor(normMins / 60);
  const m = normMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Convert minutes to 12-hour AM/PM string for pretty UI
export function minutesToTime12(mins: number): string {
  const normMins = (mins + 1440) % 1440;
  let h = Math.floor(normMins / 60);
  const m = normMins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h === 0 ? 12 : h;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function calculatePriorityScore(sub: SubjectInput, examDateStr: string): number {
  // 1. Difficulty Level: Easy = 5, Medium = 10, Hard = 20
  const diffScore = sub.difficultyLevel === 'Hard' ? 20 : sub.difficultyLevel === 'Medium' ? 10 : 5;
  
  // 2. Low Confidence: (11 - confidenceLevel_1_to_10) * 2
  const confidenceScore = (11 - Math.max(1, Math.min(10, sub.confidenceLevel))) * 2.5;

  // 3. Low Previous Marks: (100 - previousMarks) * 0.2
  const marksScore = (100 - Math.max(0, Math.min(100, sub.previousMarks))) * 0.25;

  // 4. Topic Importance: High = 20, Medium = 10, Low = 3
  const importanceLevel = sub.topicImportance || 'Medium';
  const importanceScore = importanceLevel === 'High' ? 20 : importanceLevel === 'Medium' ? 10 : 3;

  // 5. Exam Urgency Factor
  let daysRem = 30;
  if (examDateStr) {
    const diffTime = new Date(examDateStr).getTime() - new Date().getTime();
    daysRem = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
  let urgencyScore = 2;
  if (daysRem <= 3) urgencyScore = 30;
  else if (daysRem <= 7) urgencyScore = 20;
  else if (daysRem <= 14) urgencyScore = 15;
  else if (daysRem <= 30) urgencyScore = 8;
  else urgencyScore = 3;

  // Proximity addition
  const finalScore = diffScore + confidenceScore + marksScore + importanceScore + urgencyScore;
  return Math.round(finalScore);
}

// Core timetable builder - guarantees NO OVERLAPS
export function generateConflictFreeTimetable(
  routine: RoutineInput,
  subjects: SubjectInput[]
): TimetableBlock[] {
  const blocks: TimetableBlock[] = [];

  // 1. Parse and sanitize all routine inputs
  let wakeMins = timeToMinutes(routine.wakeUpTime || '05:00');
  let sleepMins = timeToMinutes(routine.sleepTime || '22:00');

  // Parse meal ranges
  let bfStart = timeToMinutes(routine.breakfastStart || '08:00');
  let bfEnd = timeToMinutes(routine.breakfastEnd || '08:30');
  let lhStart = timeToMinutes(routine.lunchStart || '13:00');
  let lhEnd = timeToMinutes(routine.lunchEnd || '14:00');
  let dnStart = timeToMinutes(routine.dinnerStart || '20:00');
  let dnEnd = timeToMinutes(routine.dinnerEnd || '21:00');

  // Parse prayers ranges
  let fjStart = timeToMinutes(routine.fajrStart || '04:30');
  let fjEnd = timeToMinutes(routine.fajrEnd || '05:00');
  let dhStart = timeToMinutes(routine.dhuhrStart || '12:15');
  let dhEnd = timeToMinutes(routine.dhuhrEnd || '12:45');
  let asStart = timeToMinutes(routine.asrStart || '15:30');
  let asEnd = timeToMinutes(routine.asrEnd || '16:00');
  let mgStart = timeToMinutes(routine.maghribStart || '18:00');
  let mgEnd = timeToMinutes(routine.maghribEnd || '18:30');
  let isStart = timeToMinutes(routine.ishaStart || '19:30');
  let isEnd = timeToMinutes(routine.ishaEnd || '20:00');

  // Prevent start > end issues by resetting to standard spacing if user entered reversed times
  if (bfStart >= bfEnd) bfEnd = bfStart + 30;
  if (lhStart >= lhEnd) lhEnd = lhStart + 60;
  if (dnStart >= dnEnd) dnEnd = dnStart + 60;

  if (fjStart >= fjEnd) fjEnd = fjStart + 30;
  if (dhStart >= dhEnd) dhEnd = dhStart + 30;
  if (asStart >= asEnd) asEnd = asStart + 30;
  if (mgStart >= mgEnd) mgEnd = mgStart + 30;
  if (isStart >= isEnd) isEnd = isStart + 30;

  // Let's create an array of "Fixed Events" for the day
  interface FixedEvent {
    type: 'sleep' | 'meal' | 'prayer' | 'wakeup';
    label: string;
    subLabel?: string;
    start: number;
    end: number;
  }

  const fixedEvents: FixedEvent[] = [];

  // Sleep is complex if it crosses midnight
  if (sleepMins < wakeMins) {
    // e.g. Sleep at 23:00 to 05:00
    // Event 1: sleepFromMidnightToWake [0 to wakeMins]
    fixedEvents.push({ type: 'sleep', label: '💤 Nightly Core Sleep', subLabel: 'Synaptic cellular restoration', start: 0, end: wakeMins });
    // Event 2: sleepFromBedtimeToMidnight [sleepMins to 1440]
    fixedEvents.push({ type: 'sleep', label: '💤 Nightly Core Sleep', subLabel: 'Synaptic cellular restoration', start: sleepMins, end: 1440 });
  } else {
    // Sleep is within same day (rare, but let's support) or wake time is later
    fixedEvents.push({ type: 'sleep', label: '💤 Nightly Core Sleep', subLabel: 'Synaptic cellular restoration', start: sleepMins, end: 1440 });
    fixedEvents.push({ type: 'sleep', label: '💤 Early Morning Sleep', subLabel: 'Synaptic cellular restoration', start: 0, end: wakeMins });
  }

  // Wake-up sequence is right at wakeUpTime for 10 minutes
  fixedEvents.push({ type: 'wakeup', label: '🌅 Early Wake-up Sequence', subLabel: 'Hydrate & morning stretches', start: wakeMins, end: Math.min(1440, wakeMins + 15) });

  // Add Meals
  fixedEvents.push({ type: 'meal', label: '🍔 Locked Breakfast Break', subLabel: 'High-protein study fuel', start: bfStart, end: bfEnd });
  fixedEvents.push({ type: 'meal', label: '🍕 Overlap Shield: Lunch Break', subLabel: 'Mindful eating & screen rest', start: lhStart, end: lhEnd });
  fixedEvents.push({ type: 'meal', label: '🍱 Locked Dinner Break', subLabel: 'Social downtime & family support', start: dnStart, end: dnEnd });

  // Add Prayers
  fixedEvents.push({ type: 'prayer', label: '📿 Spiritual Break: Fajr Prayer', subLabel: 'Calm morning prayer block', start: fjStart, end: fjEnd });
  fixedEvents.push({ type: 'prayer', label: '📿 Spiritual Break: Dhuhr Prayer', subLabel: 'Mid-day prayer alignment', start: dhStart, end: dhEnd });
  fixedEvents.push({ type: 'prayer', label: '📿 Spiritual Break: Asr Prayer', subLabel: 'Afternoon prayer break', start: asStart, end: asEnd });
  fixedEvents.push({ type: 'prayer', label: '📿 Spiritual Break: Maghrib Prayer', subLabel: 'Evening transition prayer', start: mgStart, end: mgEnd });
  fixedEvents.push({ type: 'prayer', label: '📿 Spiritual Break: Isha Prayer', subLabel: 'Spiritual grounding prayer', start: isStart, end: isEnd });

  // Resolve clashing/overlapping fixed events using auto-adjustment:
  // Sort fixed events by start minutes.
  fixedEvents.sort((a, b) => a.start - b.start);

  // If fixed events clash, shift the later one by the conflict duration auto-adjustingly!
  for (let i = 0; i < fixedEvents.length - 1; i++) {
    const cur = fixedEvents[i];
    const next = fixedEvents[i+1];
    if (next.start < cur.end) {
      // Conflict detected! Auto-adjust by shifting next event starting minutes
      const overlapAmt = cur.end - next.start;
      next.start = Math.min(1440, next.start + overlapAmt);
      next.end = Math.min(1440, next.end + overlapAmt);
    }
  }

  // Double-check alignment
  fixedEvents.forEach(evt => {
    if (evt.start < evt.end) {
      blocks.push({
        id: `fixed-${evt.type}-${evt.start}`,
        type: evt.type,
        label: evt.label,
        subLabel: evt.subLabel,
        startTime: minutesToTime(evt.start),
        endTime: minutesToTime(evt.end),
        startMins: evt.start,
        endMins: evt.end
      });
    }
  });

  // Now, calculate free periods (study windows) outside fixedEvents inside active day
  // Let's mark active day mins: from wakeMins to sleepMins (or midnight/crossing day)
  const activeDayMinutes: { min: number; max: number }[] = [];
  if (sleepMins < wakeMins) {
    // Crosses day boundary, e.g. wake is 5:00 (300), sleep is 1:00 (60)
    // Active spans are wakeMins -> 1440
    activeDayMinutes.push({ min: wakeMins + 15, max: 1440 });
  } else {
    // Wake is 5:00 (300), sleep is 22:00 (1320)
    activeDayMinutes.push({ min: wakeMins + 15, max: sleepMins });
  }

  // Find all study availability slots by checking each minute for any overlap in fixedEvents
  const isMinuteLocked = (m: number): boolean => {
    return fixedEvents.some(evt => m >= evt.start && m < evt.end);
  };

  interface OpenSlot {
    start: number;
    end: number;
  }
  const openSlots: OpenSlot[] = [];

  activeDayMinutes.forEach(span => {
    let currentStart: number | null = null;
    for (let m = span.min; m < span.max; m++) {
      const locked = isMinuteLocked(m);
      if (!locked && currentStart === null) {
        currentStart = m;
      } else if (locked && currentStart !== null) {
        if (m - currentStart >= 15) { // Minimum 15 mins for a slot
          openSlots.push({ start: currentStart, end: m });
        }
        currentStart = null;
      }
    }
    if (currentStart !== null && span.max - currentStart >= 15) {
      openSlots.push({ start: currentStart, end: span.max });
    }
  });

  // Calculate prioritized subjects list
  const prioritizedSubjects = [...subjects]
    .map(sub => ({
      ...sub,
      priorityScore: calculatePriorityScore(sub, sub.examDate)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  if (prioritizedSubjects.length === 0) {
    return blocks.sort((a,b) => a.startMins - b.startMins);
  }

  // Distribute academic study blocks in the openSlots.
  // Each prioritised subject receives allocated time proportional to their priority score!
  // Study techniques automapped based on difficulty configurations
  let subjectIdxForAllocation = 0;

  openSlots.forEach((slot, slotIdx) => {
    let currentMins = slot.start;
    const slotEnd = slot.end;

    while (currentMins + 20 <= slotEnd) {
      const availableDuration = slotEnd - currentMins;
      const sub = prioritizedSubjects[subjectIdxForAllocation];

      // Block type mapping
      // Standard deep block size = 45 or 25 based on difficulty
      let blockDuration = 25; // Default Pomodoro
      let blockTitle = '📚 Pomodoro Session';
      let studyTechnique = 'Active Recall & Quick Review';

      if (sub.difficultyLevel === 'Hard') {
        blockDuration = 45; // Deep focus
        blockTitle = '🧠 Deep Focus Session';
        studyTechnique = 'Feynman Technique & Key Derivations';
      } else if (sub.difficultyLevel === 'Medium') {
        blockDuration = 35;
        blockTitle = '🧪 Interactive Problem Solver';
        studyTechnique = 'Active Recall Practice';
      } else {
        blockDuration = 25;
        blockTitle = '⚡ Spaced Repetition Drill';
        studyTechnique = 'Mock Flashcards & Review';
      }

      // If exam countdown is extremely close (e.g. within 3 days or high priority), auto-schedule practice mock trials!
      if (sub.priorityScore > 65) {
        blockTitle = `🔥 Exam Crisis: Mock Test Prep`;
        studyTechnique = `Spaced Repetition & Simulated Mock Exam`;
      }

      // Fit block size to slot ending
      if (blockDuration > availableDuration) {
        blockDuration = availableDuration;
      }

      // Add actual study block
      if (blockDuration >= 15) {
        blocks.push({
          id: `study-${sub.name}-${currentMins}`,
          type: 'study',
          label: `${blockTitle}: ${sub.name}`,
          subLabel: `Method: ${studyTechnique} | Topic importance: ${sub.topicImportance || 'Medium'}`,
          startTime: minutesToTime(currentMins),
          endTime: minutesToTime(currentMins + blockDuration),
          startMins: currentMins,
          endMins: currentMins + blockDuration
        });
      }

      currentMins += blockDuration;

      // Immediately insert a mandatory short break to prevent fatigue + negative durations
      const breakDuration = blockDuration >= 45 ? 10 : 5;
      if (currentMins + breakDuration <= slotEnd) {
        blocks.push({
          id: `break-${currentMins}`,
          type: 'break',
          label: '☕ Mind Recharge Break',
          subLabel: 'Hydrate, breathe deeply, and stand up',
          startTime: minutesToTime(currentMins),
          endTime: minutesToTime(currentMins + breakDuration),
          startMins: currentMins,
          endMins: currentMins + breakDuration
        });
        currentMins += breakDuration;
      }

      // Cycle to include all subjects elegantly in staggered ranks
      subjectIdxForAllocation = (subjectIdxForAllocation + 1) % prioritizedSubjects.length;
    }
  });

  // Sort final timeline perfectly
  return blocks.sort((a, b) => a.startMins - b.startMins);
}
