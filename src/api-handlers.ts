import { GoogleGenAI } from '@google/genai';

// Initialize Gemini safely
let genAIInstance: any = null;

export function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Falling back to mock AI server mode.");
      return null;
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
    return getFallbackResponse(type, payload);
  }

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

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });
        return JSON.parse((response.text || '').trim());
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

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4,
          }
        });
        return JSON.parse((response.text || '').trim());
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

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });
        return JSON.parse((response.text || '').trim());
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

        // Incorporate profile details if available
        let profileInfo = "";
        if (profileContext) {
          const { username, streak, xp, subjectsList, goalsList } = profileContext;
          profileInfo = `STUDENT PROFILE CONTEXT:
- Student Name: ${username || 'Scholar'}
- Consistent Study Streak: ${streak || 0} days
- Accumulated XP: ${xp || 0} XP
`;
          if (subjectsList && subjectsList.length > 0) {
            profileInfo += `- Registered subjects in profile:\n${subjectsList.map((s: any) => `  * ${s.title} (${s.level || 'General'}) - Difficulty: ${s.difficulty || 'Medium'}, Confidence: ${s.confidenceLevel || 50}/100, Exam Date: ${s.examDate || 'None'}`).join("\n")}\n`;
            
            // Highlight weak/strong subjects based on confidence and difficulty
            const weak = subjectsList.filter((s: any) => s.difficulty === 'Hard' || (s.confidenceLevel && s.confidenceLevel < 50));
            const strong = subjectsList.filter((s: any) => s.difficulty === 'Easy' || (s.confidenceLevel && s.confidenceLevel >= 75));
            if (weak.length > 0) {
              profileInfo += `- Weak subjects: ${weak.map((s: any) => s.title).join(", ")}\n`;
            }
            if (strong.length > 0) {
              profileInfo += `- Strong subjects: ${strong.map((s: any) => s.title).join(", ")}\n`;
            }
          }
          if (goalsList && goalsList.length > 0) {
            profileInfo += `- Active Study Goals: ${goalsList.map((g: any) => g.title).join(", ")}\n`;
          }
        }

        const systemInstruction = `You are StudyForge AI, a top-tier general-purpose student assistant and personal study mentor. 
Your tone is encouraging, clear, precise, and academically supportive. 

ACTIVE TOPIC FOCUS: "${currentSubject || 'General study advice'}"

${profileInfo}

Your core responsibilities:
1. Answer academic questions.
2. Explain concepts simply and step-by-step.
3. Solve doubts and trace logic.
4. Help with assignments and clarify homework.
5. Provide detailed exam preparation guidelines.
6. Generate engaging quizzes.
7. Create active recall flashcards.
8. Summarize chapters or long study topics.
9. Motivate students, acknowledging their streaks and goals.
10. Give tactical scientific study advice (active recall, Pomodoro, spaced repetition).

${modeGuideline}

FORMATING RULES:
- Use clear markdown structure. Use bolding (**), bullet lists, and standard short headings.
- Maintain a friendly, supportive, yet highly professional tone.
- NEVER assume the student studies Physics or default to Quantum Physics unless they specifically select or prompt about it. Adapt dynamically to whatever subject is active: Mathematics, Chemistry, Computer Science, Biology, Literature, or General study tips.
- Keep answers scannable and relatively concise (usually under 250 words, depending on selected Mode).`;

        // Map client messages history to Gemini parts
        const contents = (messages || []).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        return { text: response.text || "Let's keep focusing on mastering this topic!" };
      }

      case 'assessment_study_plan': {
        const {
          academicDetails,
          examDetails,
          syllabusDetails,
          performanceAnalysis,
          timeManagement,
          routineDetails,
          resources,
        } = payload;

        const prompt = `You are StudyForge AI, an elite educational designer and study coach.
Generate a comprehensive, highly personalized study plan based on the following complete student assessment interview data:

📚 ACADEMIC DETAILS
- Course/Class/Standard: ${academicDetails?.course || 'Not specified'}
- Subjects being studied: ${academicDetails?.subjects || 'Not specified'}
- Hardest subject: ${academicDetails?.hardestSubject || 'Not specified'}
- Easiest subject: ${academicDetails?.easiestSubject || 'Not specified'}

📅 EXAM DETAILS
- Exam Start Date: ${examDetails?.startDate || 'Not specified'}
- Exam End Date: ${examDetails?.endDate || 'Not specified'}
- Study Holidays Available: ${examDetails?.studyHolidays || 0}
- Exam Type: ${examDetails?.examType || 'Semester Exams'}

📖 SYLLABUS DETAILS
- Total chapters/lessons count: ${syllabusDetails?.chaptersTotal || 10}
- Chapters completed: ${syllabusDetails?.chaptersCompleted || 0}
- Important chapters: ${syllabusDetails?.importantChapters || 'Not specified'}
- High marks chapters: ${syllabusDetails?.highMarksChapters || 'Not specified'}

🎯 PERFORMANCE ANALYSIS
- Previous marks / baseline performance: ${performanceAnalysis?.previousMarks || 'Not specified'}
- Subject confidence levels (1-10): ${performanceAnalysis?.confidenceLevel || 5}
- Hardest struggle topics: ${performanceAnalysis?.struggleTopics || 'Not specified'}
- Mastered topics: ${performanceAnalysis?.masteredTopics || 'Not specified'}

⏰ TIME MANAGEMENT
- Daily study hours available: ${timeManagement?.dailyHours || 4}
- Preferred study time: ${timeManagement?.preferredTime || 'Night'}
- Max focus duration: ${timeManagement?.maxFocusDuration || 25} minutes
- Break preference: ${timeManagement?.breakPreference || 5} minutes

📿 ROUTINE DETAILS
- Wake-up time: ${routineDetails?.wakeUpTime || '05:00'}
- Sleep time: ${routineDetails?.sleepTime || '22:00'}
- Prayer schedule tracking enabled: ${routineDetails?.prayerEnabled ? 'Yes' : 'No'}

📚 RESOURCES
- Attached PDFs: ${resources?.pdfsUploadedCount || 0}
- Attached notes: ${resources?.notesUploadedCount || 0}
- Attached topic images: ${resources?.imagesUploadedCount || 0}

You MUST analyze this data thoroughly and respond with a JSON object fitting exactly the structure below. Return ONLY valid JSON:
{
  "calculatedMetrics": {
    "daysRemaining": 15,
    "syllabusCompletionPercent": 40,
    "subjectDifficultyScore": 8,
    "weaknessScore": 7,
    "confidenceScore": 5,
    "revisionRequirement": "High priority active recall spaced every 2 days.",
    "examReadinessScore": 62,
    "riskLevel": "moderate" 
  },
  "dailyStudyPlan": "A completely personalized daily timeline, dividing study blocks, sleep block, and prayer slots if enabled, structured with specific times (e.g. 05:30 AM - 07:00 AM) based on their routine details. Focus on study times and break preferrence.",
  "weeklyStudyPlan": "Week-by-week actionable master priority guidelines and topic lists for the upcoming weeks until exams start.",
  "monthlyStudyPlan": "A high-level strategic month-by-month outline or sprint mapping for longer timelines.",
  "revisionSchedule": "Custom-designed spaced repetition intervals targeting their hardest struggle topics specifically.",
  "examCrisisPlan": "Targeted emergency mitigation strategies. List what chapters to drop/condense, high-mark chapters to prioritize first, and cram intervals if they are high risk.",
  "priorityTopics": [
    "Priority Topic 1: highly specific recommendation focusing on struggle topics / high-mark chapters",
    "Priority Topic 2",
    "Priority Topic 3"
  ],
  "aiRecommendations": [
    "A highly action-oriented personal tip based on preferred study time and sleep schedule.",
    "A recommendation based on resources available.",
    "A spiritual or routine consistency recommendation."
  ]
}

The response must be carefully formatted in markdown where suitable (such as bolding and bullet lists within the text fields of dailyStudyPlan, weeklyStudyPlan, monthlyStudyPlan, revisionSchedule, and examCrisisPlan) so it renders beautifully. Output strictly raw JSON without markdown codeblock wrapper around the object, or if wrapped, make sure it is valid JSON.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        return JSON.parse((response.text || '').trim());
      }

      default:
        throw new Error(`Invalid generation type: ${type}`);
    }
  } catch (error) {
    console.error(`Gemini GenAI Error for ${type}:`, error);
    return getFallbackResponse(type, payload);
  }
}

function getFallbackResponse(type: string, payload: any) {
  switch (type) {
    case 'study_plan':
      return {
        overview: `A progressive study roadmap in ${payload.subject} customized to target baseline parameters.`,
        proTip: "Combine work blocks with focused recall test quizzes to boost long-term retention.",
        milestones: [
          {
            week: "Week 1-2",
            title: "Foundations of " + payload.subject,
            topics: ["Introduction and underlying axioms", "Core vocabulary and definitions", "Active mental map modeling"],
            estimatedHours: 6
          },
          {
            week: "Week 3-4",
            title: "Practical Exercises & Solutions",
            topics: ["Formulas derivation calculations", "Sample queries and quizzes training", "Review of common student error logs"],
            estimatedHours: 8
          }
        ]
      };

    case 'flashcards':
      return [
        { front: `What is the core baseline theorem in ${payload.subject}?`, back: "The fundamental model describing how parameters interact to determine standard outcomes." },
        { front: "Explain how Active Recall benefits retention.", back: "Forcing cognitive retrieval triggers synaptic development and reinforces long-term pathways." },
        { front: "State the main benefit of Spaced Repetition.", back: "Reviews are strategically scheduled just as recall begins to fade, maximizing timing efficiency." }
      ];

    case 'quiz':
      return [
        {
          id: 1,
          question: `Which study habit is scientifically validated to yield the highest retention for ${payload.topic}?`,
          options: ["Highlighting definitions repeatedly", "Active self-testing and spaced intervals", "Cramming continuously with study guides", "Prerecorded audio lecture playback"],
          correctAnswerIndex: 1,
          explanation: "Active self-testing forces retrieval, strengthening brain pathways much faster than passive reading."
        },
        {
          id: 2,
          question: "How should we normalize a quantum mechanical wavefunction?",
          options: ["Set its absolute square integral over space equal to 1", "Verify that its maximum limit is infinity", "Omit imaginary phase components", "Divide it by Planck's constant"],
          correctAnswerIndex: 0,
          explanation: "Normalizing the wave function guarantees a 100% total probability of finding the particle somewhere in physical space."
        }
      ];

    case 'chat':
      return {
        text: "I am analyzing your progress. Let's execute some Pomodoro sessions and test our recollection using study flashcards! What specific subject topics should we focus on next?"
      };

    case 'assessment_study_plan':
      return {
        calculatedMetrics: {
          daysRemaining: 15,
          syllabusCompletionPercent: Math.round(((payload?.syllabusDetails?.chaptersCompleted || 0) / (payload?.syllabusDetails?.chaptersTotal || 10)) * 100),
          subjectDifficultyScore: payload?.performanceAnalysis?.confidenceLevel ? Math.max(1, 10 - payload.performanceAnalysis.confidenceLevel) : 5,
          weaknessScore: 6,
          confidenceScore: payload?.performanceAnalysis?.confidenceLevel || 5,
          revisionRequirement: "Fallback design: Revise hardest chapters first every 3 days.",
          examReadinessScore: 65,
          riskLevel: "moderate"
        },
        dailyStudyPlan: `**Fallback Baseline Daily Schedule**:\n\n*   **06:00 AM - 07:30 AM**: Heavy conceptual revision for ${payload?.academicDetails?.hardestSubject || 'Hardest topics'}.\n*   **01:30 PM - 03:00 PM**: Working out exercises & math equations.\n*   **08:00 PM - 09:30 PM**: Fast active recall testing and review of flashcards.`,
        weeklyStudyPlan: `**Fallback Week-by-Week Breakdown**:\n\n*   **Week 1**: Focus purely on the fundamental lessons of ${payload?.academicDetails?.hardestSubject || 'your hardest subject'}.\n*   **Week 2**: Tackle past papers and mock multiple choice questions.\n*   **Week 3**: Final mock tests and targeted spaced repetition intervals.`,
        monthlyStudyPlan: `**Fallback Monthly Milestones**:\n\n*   **Month 1**: Cover 75% of remaining syllabus lessons.\n*   **Month 2**: Active recall sprints, focus drills, and complete revision checklist.`,
        revisionSchedule: `**Fallback Spaced Recall Spacing**:\n\n*   Review struggle topics after 1 day, 3 days, and 7 days. Use Flashcard matrices.`,
        examCrisisPlan: `**Crisis Compression Plan**:\n\n*   Highlight and prioritize high-marks topics immediately.\n*   Compress minor chapters and delegate last 3 days before exams entirely to quick review loops.`,
        priorityTopics: [
          "Priority 1: Key milestones and important topics in " + (payload?.academicDetails?.hardestSubject || 'hardest subject'),
          "Priority 2: Practical formulas derivation challenges",
          "Priority 3: Fast concept review logs"
        ],
        aiRecommendations: [
          "Establish focus triggers corresponding to your preferred " + (payload?.timeManagement?.preferredTime || "selected") + " study session block.",
          "Dedicate at least 30 minutes to review PDF resources uploaded in PDF Vault.",
          "Maintain absolute sleep consistency between Sleep Time and Wake up times."
        ]
      };

    default:
      return { text: "No content generated." };
  }
}
