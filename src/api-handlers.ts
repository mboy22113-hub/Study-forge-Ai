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
        const { messages, currentSubject } = payload;
        const systemInstruction = `You are StudyForge AI Study Coach, an encouraging, professional, and brilliant learning coach inspired by Google AI Studio. 
The current subject being mastered is: "${currentSubject}". 
Guide students to build robust neural schemas via active recall, spaced repetition, and deep focus habits. 
Give quick, structured feedback, recommend study tasks, and explain complex concepts simply.
Keep answers highly scannable (using bolding/bullets) and relatively concise (under 150 words).`;

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

    default:
      return { text: "No content generated." };
  }
}
