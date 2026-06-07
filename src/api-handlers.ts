import { GoogleGenAI } from '@google/genai';

// Initialize Gemini safely
let genAIInstance: any = null;

export function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.error("[GEMINI CONFIG ERROR] GEMINI_API_KEY is not defined or is a placeholder.");
      throw new Error("Unable to generate a response right now. (Invalid or missing GEMINI_API_KEY)");
    }
    genAIInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return genAIInstance;
}

export async function handleGeminiGeneration(type: string, payload: any) {
  const ai = getGenAI();
  
  if (!ai) {
    throw new Error("Unable to generate a response right now.");
  }

  console.log(`\n================== [GEMINI INCOMING REQUEST] ==================`);
  console.log(`Type: ${type}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Request Payload:`, JSON.stringify(payload, null, 2));

  try {
    switch (type) {
      case 'study_plan': {
        const { subject, level, studyFocus, durationWeeks, hoursPerDay } = payload;
        const prompt = `You are StudyForge AI, an elite educational designer.
Generate a comprehensive study plan for "${subject}" at "${level}" level. 
Focus areas: ${studyFocus || 'general core syllabus'}. 
Duration: ${durationWeeks || 4} weeks, with ${hoursPerDay || 4} hours allocation per day.

You MUST respond with a JSON object fitting exactly this structure:
{
  "overview": "A concise master overview of the study scope and timeline (1-2 sentences).",
  "proTip": "One highly actionable, practical scientific advice for studying this (1 sentence).",
  "milestones": [
    {
      "week": "Week 1-2",
      "title": "Clear unit milestone title",
      "topics": ["Concrete subtopic 1", "Concrete subtopic 2", "Concrete subtopic 3"],
      "estimatedHours": 8
    }
  ]
}

Provide exactly 3 to 4 logical milestone divisions spanning the specified duration. Do not output anything other than raw, valid JSON.`;

        console.log(`[GEMINI CORE PROMPT]:`, prompt);

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        const textResponse = (response.text || '').trim();
        console.log(`[GEMINI API STATUS]: 200 OK`);
        console.log(`[GEMINI RESPONSE PAYLOAD]:`, textResponse);
        console.log(`===============================================================\n`);

        return JSON.parse(textResponse);
      }

      case 'flashcards': {
        const { subject, count } = payload;
        const prompt = `You are StudyForge AI. Synthesize a progressive flashcard deck of active recall questions for the topic "${subject}".
Generate exactly ${count || 6} flashcards.

You MUST respond with a JSON array fitting exactly this structure:
[
  {
    "front": "Clear query or statement demanding recall",
    "back": "Accurate, structured answer definition"
  }
]

Do not output anything other than raw, valid JSON.`;

        console.log(`[GEMINI CORE PROMPT]:`, prompt);

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          }
        });

        const textResponse = (response.text || '').trim();
        console.log(`[GEMINI API STATUS]: 200 OK`);
        console.log(`[GEMINI RESPONSE PAYLOAD]:`, textResponse);
        console.log(`===============================================================\n`);

        return JSON.parse(textResponse);
      }

      case 'quiz': {
        const { topic, difficulty, numQuestions } = payload;
        const prompt = `You are StudyForge AI math & science tutor. Create a high-quality interactive quiz about "${topic}".
Difficulty level specified: ${difficulty || 'Medium'}.
Create exactly ${numQuestions || 5} multiple choice questions.

You MUST respond with a JSON array fitting exactly this structure:
[
  {
    "id": 1,
    "question": "Conceptual multiple-choice challenge",
    "options": ["Plausible choice A", "Plausible choice B", "Correct choice C", "Plausible choice D"],
    "correctAnswerIndex": 2,
    "explanation": "Clear analytical walkthrough explaining why choice C is correct."
  }
]

Each question must have exactly 4 choices and a valid correctAnswerIndex (integer index 0-3 of the correct option). Do not output anything other than raw, valid JSON.`;

        console.log(`[GEMINI CORE PROMPT]:`, prompt);

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        const textResponse = (response.text || '').trim();
        console.log(`[GEMINI API STATUS]: 200 OK`);
        console.log(`[GEMINI RESPONSE PAYLOAD]:`, textResponse);
        console.log(`===============================================================\n`);

        return JSON.parse(textResponse);
      }

      case 'chat': {
        const { messages, currentSubject, chatMode, profileContext } = payload;
        
        let modeGuideline = "";
        switch (chatMode) {
          case 'quick':
            modeGuideline = "MODE: Quick Answer. Respond extremely concisely and directly. Answer the student's query in 1-3 direct sentences. No fluff, no long introductions.";
            break;
          case 'detailed':
            modeGuideline = "MODE: Detailed Explanation. Provide a comprehensive, step-by-step analytical breakdown. Use bullet points, bold key terms, and structural lists to make it beautiful and easy to understand.";
            break;
          case 'teacher':
            modeGuideline = "MODE: Teacher Mode. Act like an engaging, warm, and highly passionate school or college teacher. Explain with an intuitive physical or real-world analogy first, then map it to academic details. Ask guided questions to check understanding.";
            break;
          case 'quiz':
            modeGuideline = "MODE: Quiz Mode. Generate 2-3 interactive multiple choice questions or conceptual challenges based on the student's selected subject and question. Ask the student to write down their answer. Provide clear options (A, B, C, D) but DO NOT reveal the answers or explanations immediately. Tell them to try first!";
            break;
          case 'flashcard':
            modeGuideline = "MODE: Flashcard Mode. Create 3-5 high-fidelity active recall flashcard pairs (Front & Back style) for this topic to help the student test themselves.";
            break;
          case 'exam':
            modeGuideline = "MODE: Exam Mode. Focus specifically on typical exam questions, test marks weighting strategies, key derivations, and practical formulas. Highlight common slip-ups students make in tests for this subject.";
            break;
          case 'motivation':
            modeGuideline = "MODE: Motivation Mode. Give an enthusiastic motivational boost! Congratulate them on their streak or learning progression, and offer custom study habits advice for maintaining deep study focus.";
            break;
          default:
            modeGuideline = "MODE: General Study Assistant. Provide encouraging, professional, and clear advice.";
        }

        // Incorporate profile and progress details dynamically
        let profileInfo = "";
        if (profileContext) {
          const { username, streak, xp, subjectsList, goalsList, studyPlansList, routine, pdfsCount } = profileContext;
          profileInfo = `STUDENT PROFILE AND PROGRESS CONTEXT:
- Student Name: ${username || 'Scholar'}
- Consistent Study Streak: ${streak || 0} days
- Accumulated XP: ${xp || 0} XP
- Vault PDF documents uploaded: ${pdfsCount || 0} files
`;

          if (subjectsList && subjectsList.length > 0) {
            profileInfo += `- Active Registered Subjects:\n${subjectsList.map((s: any) => `  * ${s.name || s.title || 'General'} (total chapters: ${s.totalChapters || 1}, completed: ${s.completedChapters || 0} chapters, confidence: ${s.confidenceLevel || 5}/10, average marks: ${s.previousMarks || 75}%, difficulty: ${s.difficultyLevel || s.difficulty || 'Medium'})`).join("\n")}\n`;
            
            const weak = subjectsList.filter((s: any) => (s.difficultyLevel === 'Hard' || s.difficulty === 'Hard') || (s.confidenceLevel && s.confidenceLevel < 5));
            const strong = subjectsList.filter((s: any) => (s.difficultyLevel === 'Easy' || s.difficulty === 'Easy') || (s.confidenceLevel && s.confidenceLevel >= 8));
            if (weak.length > 0) {
              profileInfo += `- Weak Subjects needing focus support: ${weak.map((s: any) => s.name || s.title).join(", ")}\n`;
            }
            if (strong.length > 0) {
              profileInfo += `- Strong Subjects: ${strong.map((s: any) => s.name || s.title).join(", ")}\n`;
            }
          }

          if (goalsList && goalsList.length > 0) {
            profileInfo += `- Student Active Study Goals: ${goalsList.map((g: any) => g.title || g.text || g).join(", ")}\n`;
          }

          if (studyPlansList && studyPlansList.length > 0) {
            const activePlan = studyPlansList[0];
            profileInfo += `- Current Master Strategy Plan: ${activePlan.subject || ''} (Progress: ${activePlan.progress || 0}%, Semester/Level: ${activePlan.level || ''})\n`;
          }

          if (routine) {
            profileInfo += `- Wake-up Bed Boundaries: wakeUpTime is ${routine.wakeUpTime || '05:00'}, sleepTime is ${routine.sleepTime || '22:00'}\n`;
            profileInfo += `- Guaranteed Overlap Guard Intervals:\n`;
            profileInfo += `  * Breakfast Time: ${routine.breakfastStart || '08:00'} to ${routine.breakfastEnd || '08:30'}\n`;
            profileInfo += `  * Lunch Time: ${routine.lunchStart || '13:00'} to ${routine.lunchEnd || '14:00'}\n`;
            profileInfo += `  * Dinner Time: ${routine.dinnerStart || '20:00'} to ${routine.dinnerEnd || '21:00'}\n`;
            profileInfo += `  * Spiritual Prayers: Fajr ${routine.fajrTime || '05:00'}, Dhuhr ${routine.dhuhrTime || '12:30'}, Asr ${routine.asrTime || '15:30'}, Maghrib ${routine.maghribTime || '19:00'}, Isha ${routine.ishaTime || '20:30'}\n`;
          }
        }

        const systemInstruction = `You are StudyForge AI, a elite academic tutor, senior educational designer, and prestigious personal study mentor. 

Your tone is welcoming, highly polished, intellectually rigorous, supportive, and exceptionally polite. You use excellent grammar and academic precision. 

ACTIVE TOPIC FOCUS: "${currentSubject || 'General study advice'}"

${profileInfo}

Your core responsibilities:
1. Provide definitive, step-by-step mathematical, physical, chemical, or computer science derivations and explanations.
2. Structure all calculations clearly, showing formulas first, then mapping analytical constants, and tracing calculations meticulously.
3. Reference scholarly academic standards (e.g., standard textbooks, physics conventions, IUPAC structures) where appropriate.
4. When explaining, start with an elegant, clear high-level conceptual analogy, then dive into formal rigorous math or science blocks.
5. Create premium customized active recall flashcard decks, interactive practice quizzes, and custom weekly study timetables whenever requested by the student.

DELIVERABLE GENERATION FORMAT RULES:
If the student asks you for study materials, study decks, quizzes, flashcards, or study plans to prepare themselves, you MUST supply the requested materials inside one of these precise custom markdown codeblock coordinates so the dashboard can generate beautiful, fully-functional interactive training widgets:

1. FLASHCARD DECK (JSON Array of object pairs):
\`\`\`flashcard-deck
[
  {
    "front": "Definition query demanding recall (e.g., What is Coulomb's Law formula?)",
    "back": "Analytical response definition (e.g., F = k * (q1 * q2) / r^2)"
  }
]
\`\`\`

2. PRACTICE MCQS QUIZ (JSON Array of questions with 4 options):
\`\`\`quiz-deck
[
  {
    "id": 1,
    "question": "Conceptual numerical or theoretical query?",
    "options": ["Plausible choice A", "Plausible choice B", "Correct choice C", "Plausible choice D"],
    "correctAnswerIndex": 2,
    "explanation": "Meticulous step-by-step solution breakdown clarifying why choice C is correct."
  }
]
\`\`\`

3. CUSTOM STRATEGIC STUDY BLANKET TIMETABLE (JSON StudyPlan structure):
\`\`\`study-plan-deck
{
  "subject": "Active subject name",
  "overview": "Definitive 1-2 sentence overview mapping the exam scope and milestones.",
  "proTip": "Distinctive scientific habit rule tailored dynamically to this subject matter.",
  "milestones": [
    {
      "week": "Week 1-2",
      "title": "Module Title",
      "topics": ["Key syllabus topic A", "Key syllabus topic B"],
      "estimatedHours": 8
    }
  ]
}
\`\`/ (Do NOT add slash trailing, ensure correct block ending)

FORMATING AND ACCESSIBILITY RULES:
- Use clear markdown structure. Always use bolding (**), clear bullet parameters, and rigorous tables.
- Code blocks must declare language syntax tags clearly.
- NEVER assume the student studies Physics. Dynamically adapt your lexicon and analogies to match their registered curricula!`;

        // Log incoming user prompt
        const latestUserMessageObj = [...(messages || [])].reverse().find((m: any) => m.role === 'user');
        const latestUserMessageText = latestUserMessageObj ? latestUserMessageObj.content : 'N/A';
        console.log(`[GEMINI CHAT USER PROMPT]: "${latestUserMessageText}"`);

        // Filter out any leading model messages, and ensure alternating turns start with 'user'
        let chatHistory = (messages || []).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content || m.text || '',
          imageUrl: m.imageUrl || null
        }));

        // Find the first user message index to ensure history starts with 'user'
        const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
        if (firstUserIndex !== -1) {
          chatHistory = chatHistory.slice(firstUserIndex);
        } else {
          chatHistory = [];
        }

        // Map to Gemini parts and filter adjacent messages of the same role
        const intermediateContents = chatHistory.map((m: any) => {
          const parts: any[] = [];
          
          if (m.imageUrl) {
            let mimeType = "image/jpeg";
            let base64Data = m.imageUrl;
            
            if (m.imageUrl.startsWith("data:")) {
              const matches = m.imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
              if (matches && matches.length === 3) {
                mimeType = matches[1];
                base64Data = matches[2];
              }
            }
            
            parts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            });
          }
          
          parts.push({ text: m.content || " " });
          
          return {
            role: m.role as 'user' | 'model',
            parts: parts
          };
        });

        const contents: Array<{ role: 'user' | 'model'; parts: Array<any> }> = [];
        for (const item of intermediateContents) {
          if (contents.length === 0) {
            if (item.role === 'user') {
              contents.push(item);
            }
          } else {
            const lastItem = contents[contents.length - 1];
            if (lastItem.role === item.role) {
              // Same role consecutive turn: append parts
              lastItem.parts.push(...item.parts);
            } else {
              contents.push(item);
            }
          }
        }

        console.log(`[GEMINI CONVERSATION HISTORIES]:`, JSON.stringify(contents, null, 2));
        console.log(`[GEMINI SYSTEM INSTRUCTIONS]:`, systemInstruction);

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        const textResponse = response.text || "Unable to generate a response right now.";
        console.log(`[GEMINI API STATUS]: 200 OK`);
        console.log(`[GEMINI RESPONSE PAYLOAD - CHAT RESPONSE]:`, textResponse);
        console.log(`===============================================================\n`);

        return { text: textResponse };
      }

      case 'assessment_study_plan': {
        const { subjectsList, routine } = payload;

        const subjectsDescription = (subjectsList || []).map((sub: any, idx: number) => `
Subject #${idx + 1}:
- Name: ${sub.name}
- Exam Date: ${sub.examDate || 'Not specified'}
- Total Chapters: ${sub.totalChapters}
- Completed Chapters: ${sub.completedChapters}
- Important Chapters: ${sub.importantChapters || 'None flagged'}
- Difficulty Level: ${sub.difficultyLevel} (Easy / Medium / Hard)
- Confidence Level: ${sub.confidenceLevel} (1-10)
- Previous Marks: ${sub.previousMarks}%
- Desired Daily Study Hours: ${sub.desiredDailyHours}h
- Notes: ${sub.notes || 'None'}
- Days Remaining to Exam: ${sub.daysRemaining || 'Not computed'}
`).join('\n');

        const routineDescription = `
🌅 Wake-Up Time: ${routine?.wakeUpTime || '05:00'}
🌙 Sleep Time: ${routine?.sleepTime || '22:00'}

🍽 Breakfast: ${routine?.breakfastStart || '08:00'} to ${routine?.breakfastEnd || '08:30'}
🍽 Lunch: ${routine?.lunchStart || '13:00'} to ${routine?.lunchEnd || '14:00'}
🍽 Dinner: ${routine?.dinnerStart || '20:00'} to ${routine?.dinnerEnd || '21:00'}

📿 Fajr Time: ${routine?.fajrTime || '04:30'}
📿 Dhuhr Time: ${routine?.dhuhrTime || '12:30'}
📿 Asr Time: ${routine?.asrTime || '16:00'}
📿 Maghrib Time: ${routine?.maghribTime || '19:00'}
📿 Isha Time: ${routine?.ishaTime || '20:30'}
`;

        const prompt = `You are StudyForge AI, an elite educational designer and study coach.
Generate a comprehensive, highly personalized study plan based on the following complete student database containing individual subject details and daily routines/schedules.

📚 SUBJECTS DETAILS
${subjectsDescription}

📿 DAILY ROUTINE & BOUNDS SESSISONS
${routineDescription}

═══════════════════════
SUBJECT PRIORITY CALCULATION RULE
═══════════════════════
For each subject, calculate a Priority Score using these guidelines:
Priority Score = Difficulty + Low Confidence + Low Marks + Remaining Chapters + Exam Urgency + Important Topics
- Difficulty points: Hard = 15, Medium = 8, Easy = 2
- Low Confidence points: (10 - subject's confidence level) * 2
- Low Marks points: (100 - previous marks) * 0.2
- Remaining Chapters points: (total chapters - completed chapters) * 1.5
- Exam Urgency: if exam is within 10 days add 25, within 20 days add 15, within 30 days add 8, more than 30 days add 2
- Important topics score: if notes/important chapters are specified, add 5 points.

Rule:
- Harder, weaker, and urgent subjects (high priority score) receive:
  * More study hours in the schedule
  * More frequent revision blocks
  * Earlier (hardest first) scheduling during the day
- Easier, confident subjects receive:
  * Less study time
  * Less repetition

═══════════════════════
EXAM CRISIS MODE RULE
═══════════════════════
For each subject:
If Days Remaining is less than 14, AND the syllabus completed is less than 60% (more than 40% incomplete):
- Activate "🚨 EXAM CRISIS MODE" for that subject.
- This subject's riskLevel should be labeled as "high" (High Risk 🔴).
- You MUST prioritize high-weight/important chapters, increase revision frequency, reduce low-priority topics, and focus on maximum possible marks.
- Else: If syllabus completed is less than 80% or exam is within 30 days, set to "moderate" (Moderate 🟡). Otherwise, set to "safe" (Safe 🟢).

═══════════════════════
TIMETABLE SCHEDULING RULES (STRICT OVERLAP PREVENTION)
═══════════════════════
Study sessions MUST NEVER OVERLAP with:
1. Prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
2. Meal times (Breakfast, Lunch, Dinner start and end ranges)
3. Sleep time (Typical Sleep Time to Wake-Up Time)
- Timetable blocks should be placed elegantly in between prayers.
- Provide breaks matching the user's focus preferences.
- Difficult subjects scheduled first. Weak subjects scheduled more often. Highly frequent revision sessions automatically scheduled.

You MUST analyze this data thoroughly and respond with a JSON object fitting exactly the structure below. Return ONLY valid JSON:
{
  "calculatedMetrics": {
    "daysRemaining": 15, // overall shortest countdown
    "syllabusCompletionPercent": 40, // average chapters completed % across all subjects
    "subjectDifficultyScore": 8, // average difficulty score
    "weaknessScore": 7, // general weakness indicator (1-10)
    "confidenceScore": 5, // average confidence (1-10)
    "revisionRequirement": "Detailed Spaced Repetition Requirement phrase",
    "examReadinessScore": 65, // calculate average readiness (1-100)
    "riskLevel": "high" // overall risk Level matching highest risk subject
  },
  "priorityRanking": [
    {
      "subjectName": "Mathematics",
      "priorityScore": 38,
      "riskStatus": "high", // 'high' | 'moderate' | 'safe'
      "daysRemaining": 10,
      "reason": "Highly difficult, exam is very close, and syllabus is mostly incomplete."
    }
  ],
  "subjectCountdowns": [
    {
      "subjectName": "Mathematics",
      "daysLeft": 10,
      "riskStatus": "high", // 'high' | 'moderate' | 'safe'
      "isCrisis": true,
      "syllabusIncompletePercent": 50
    }
  ],
  "dailyStudyPlan": "A highly styled, detailed daily timetable. Place study blocks between prayers, respecting meals and sleep time strictly (using the actual times provided in routine details above). Do NOT overlap study blocks with breakfast, lunch, dinner, Fajr, Dhuhr, Asr, Maghrib, Isha, or sleep times. Use specific time ranges, e.g. '06:00 AM - 07:30 AM: Physics Review'. Organize with markdown lists or tables.",
  "weeklyStudyPlan": "A detailed week-by-week actionable progress and topics schema for all subjects, ordered by priority.",
  "monthlyStudyPlan": "A strategic long-term monthly plan mapping sprint milestones.",
  "revisionSchedule": "Spaced repetition intervals targeting high-priority/hard subjects more frequently and weaker areas specifically, showing automated revision block timings.",
  "examCrisisPlan": "Specific crisis mode emergency directives for subjects in crisis state, advising which chapters to prioritize, dropping lower-weight chapters to secure maximum marks.",
  "priorityTopics": [
    "Priority 1: Subject Name - high-priority topics",
    "Priority 2: Subject Name..."
  ],
  "aiRecommendations": [
    "Actionable daily study tip",
    "Time management/break recommendation",
    "Sleep and routine synchronization tip"
  ]
}

Ensure all generated schedules, count downs, revision sessions, and overlap guards use the student's actual uploaded dataset. Strictly return valid JSON. Do not return any wrap text outside the JSON block. Let markdown lists inside the text values look extremely beautiful.`;

        console.log(`[GEMINI CORE PROMPT]:`, prompt);

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        const textResponse = (response.text || '').trim();
        console.log(`[GEMINI API STATUS]: 200 OK`);
        console.log(`[GEMINI RESPONSE PAYLOAD]:`, textResponse);
        console.log(`===============================================================\n`);

        return JSON.parse(textResponse);
      }

      default:
        throw new Error(`Invalid generation type: ${type}`);
    }
  } catch (error: any) {
    console.error(`\n================== [GEMINI RUNTIME ERROR] ==================`);
    console.error(`Type: ${type}`);
    console.error(`Date: ${new Date().toISOString()}`);
    console.error(`Error details:`, error);
    console.error(`====================================================================\n`);
    throw new Error("Unable to generate a response right now.");
  }
}
