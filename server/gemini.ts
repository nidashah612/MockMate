import { GoogleGenAI, Type } from "@google/genai";
import {
  PersonaType,
  FocusArea,
  InterviewTurn,
  QuestionEvaluation,
  WeakSpotItem,
  STARStory
} from "../src/types";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

const DEFAULT_MODEL = "gemini-3.6-flash";
const TTS_MODEL = "gemini-3.1-flash-tts-preview";

// Helper for structured JSON generation
async function generateJSON<T>(prompt: string, systemInstruction?: string): Promise<T> {
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Gemini JSON Generation Error:", error);
    throw error;
  }
}

/**
 * 1. Parse Job Description & Resume
 */
export async function parseJobAndResume(jobDescription: string, resumeText: string) {
  const systemInstruction = `You are an expert HR Talent Partner and Technical Recruiting Architect. 
Analyze the target Job Description (JD) alongside the candidate's Resume. Identify overlap, key technical & domain requirements, potential experience gaps, and strategic focus areas for adaptive mock interviews. Return valid JSON.`;

  const prompt = `JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Analyze these two documents and return a JSON object with:
{
  "keyRequirements": ["string (3-5 top expectations from the JD)"],
  "technicalStack": ["string (core tools, frameworks, and skills required)"],
  "matchingSkills": ["string (skills present in both resume & JD)"],
  "potentialGaps": ["string (areas where candidate resume lacks clear evidence or metrics)"],
  "suggestedFocusAreas": ["string (3 actionable topics to test during mock interviews)"]
}`;

  return await generateJSON<{
    keyRequirements: string[];
    technicalStack: string[];
    matchingSkills: string[];
    potentialGaps: string[];
    suggestedFocusAreas: string[];
  }>(prompt, systemInstruction);
}

/**
 * Persona Prompt Configuration
 */
function getPersonaPrompt(persona: PersonaType): string {
  switch (persona) {
    case 'friendly':
      return `YOU ARE ALEX (FRIENDLY COACH): Encouraging, supportive, and constructive. You create a psychological safety space. When probing, you frame questions as collaborative challenges. Tone: Warm, approachable, professional mentor.`;
    case 'neutral':
      return `YOU ARE MORGAN (NEUTRAL RECRUITER): Objective, precise, and standard corporate recruiter style. You do not show emotion or give immediate hints during questioning. Tone: Formal, polite, structured.`;
    case 'stress_test':
      return `YOU ARE VIKTOR (STRESS-TEST HIRING MANAGER): Direct, rigorous, and challenging. You aggressively test edge cases, push back on vague or hand-wavy claims, challenge trade-offs, and probe for concrete metrics and architecture failure modes. Tone: Sharp, direct, persistent.`;
  }
}

/**
 * 2. Generate Next Adaptive Interview Question
 */
export async function generateAdaptiveQuestion(params: {
  persona: PersonaType;
  focusArea: FocusArea;
  jobDescription: string;
  resumeText: string;
  previousTurns: InterviewTurn[];
  weakSpotsMemory: WeakSpotItem[];
  questionIndex: number;
  totalQuestions: number;
}) {
  const {
    persona,
    focusArea,
    jobDescription,
    resumeText,
    previousTurns,
    weakSpotsMemory,
    questionIndex,
    totalQuestions
  } = params;

  const personaInstruction = getPersonaPrompt(persona);

  const turnsHistoryText = previousTurns
    .map(
      (t, idx) =>
        `Q${idx + 1} (${t.isFollowUp ? "Follow-Up" : "Main"}): ${t.question}\nAnswer: ${
          t.candidateAnswer || "(No answer given yet)"
        }\nScore: ${t.evaluation?.score ?? "N/A"}`
    )
    .join("\n---\n");

  const weakSpotsText = weakSpotsMemory.length
    ? weakSpotsMemory
        .filter((w) => w.status === "active")
        .map((w) => `- ${w.category}: ${w.title} (${w.description})`)
        .join("\n")
    : "No previous active weak spots logged.";

  const isFinalQuestion = questionIndex === totalQuestions;

  const systemInstruction = `${personaInstruction}
You are conducting a live, realistic adaptive mock interview.
Your goal is to evaluate candidate fit for the target role by formulating the single best next question.
Focus Area: ${focusArea.toUpperCase()}.
Question ${questionIndex} of ${totalQuestions}.

CRITICAL ADAPTIVE RULES:
1. CROSS-EXAMINE RESUME & JD: Reference specific claims or projects from their resume and test them against JD requirements.
2. PERSISTENT WEAK-SPOT MEMORY: Incorporate active candidate weak spots into this question if relevant!
3. ADAPTIVE PROGRESSION:
   - Question 1: Broad opening or high-impact experience deep dive.
   - Middle Questions: Technical trade-offs, behavioral STAR scenario, or system architecture challenge based on their performance.
   - Final Question: High-level leadership/conflict resolution or complex trade-off question.
4. Keep the question natural, spoken-style, clear, and direct.`;

  const prompt = `TARGET JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

CANDIDATE KNOWN WEAK SPOTS MEMORY:
${weakSpotsText}

PAST INTERVIEW CONVERSATION HISTORY:
${turnsHistoryText || "(This is Question 1 of the interview session)"}

Formulate Question ${questionIndex} of ${totalQuestions} and return JSON:
{
  "question": "string (the natural, spoken interviewer question)",
  "interviewerRationale": "string (1-2 sentences explaining why this specific question was chosen given their resume, weak spots, or previous answers)",
  "expectedKeyPoints": ["string (3 key elements a top candidate answer must cover)"],
  "targetedWeakSpot": "string (optional: name of active weak spot targeted by this question, if applicable)"
}`;

  return await generateJSON<{
    question: string;
    interviewerRationale: string;
    expectedKeyPoints: string[];
    targetedWeakSpot?: string;
  }>(prompt, systemInstruction);
}

/**
 * 3. Evaluate Candidate Response
 */
export async function evaluateAnswer(params: {
  question: string;
  candidateAnswer: string;
  expectedKeyPoints: string[];
  persona: PersonaType;
  focusArea: FocusArea;
  jobDescription: string;
  resumeText: string;
  knownWeakSpots: WeakSpotItem[];
  isFollowUp: boolean;
}) {
  const {
    question,
    candidateAnswer,
    expectedKeyPoints,
    persona,
    focusArea,
    jobDescription,
    resumeText,
    knownWeakSpots,
    isFollowUp
  } = params;

  const systemInstruction = `You are a world-class Hiring Committee Lead and AI Career Coach.
Evaluate the candidate's answer with strict, objective standards.
Persona Context: ${persona}. Focus Area: ${focusArea}.

EVALUATION CRITERIA:
1. Technical Depth (0-100): Accuracy, engineering rigor, trade-offs awareness.
2. STAR Method Alignment (0-100): Clear Situation, Task, Action, and Quantified Result (metrics!).
3. Communication & Clarity (0-100): Structure, conciseness, absence of hedging/rambling.
4. Confidence & Pace (0-100): Directness, tone, conviction.
5. Filler Words Analysis: Identify fillers (um, uh, like, you know, kind of, basically, I guess).
6. Adaptive Follow-Up Check: Is the answer vague, incomplete, missing key STAR metrics, or dodging the core technical difficulty? If YES and this is not already a follow-up, suggest followUpNeeded = true and provide a sharp follow-up question.
7. Weak Spot Detection: Identify any persistent structural weak spots demonstrated in this answer.
8. STAR Story Extraction: If the candidate shared a concrete project experience, extract it into Situation, Task, Action, Result for their STAR Story Bank!`;

  const prompt = `QUESTION ASKED:
${question}

EXPECTED KEY POINTS:
${expectedKeyPoints.join(", ")}

CANDIDATE ANSWER:
${candidateAnswer}

TARGET JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Analyze this answer and return JSON:
{
  "score": 85,
  "technicalDepthScore": 88,
  "starAlignmentScore": 78,
  "communicationClarityScore": 84,
  "confidenceScore": 82,
  "strengths": ["string (2-3 key strengths of this response)"],
  "weaknesses": ["string (1-2 specific deficiencies)"],
  "fillerWordsDetected": [
    {"word": "um", "count": 2},
    {"word": "like", "count": 1}
  ],
  "idealResponseSummary": "string (a concise example of how a top 1% candidate would answer this)",
  "actionableAdvice": "string (1 clear tip to improve this exact answer)",
  "followUpNeeded": false,
  "suggestedFollowUpQuestion": "string (optional: sharp follow-up question if answer was vague or incomplete)",
  "detectedWeakSpots": [
    {
      "category": "STAR Method",
      "title": "Missing Quantified Impact in STAR Results",
      "description": "Candidate explained the action well but failed to mention percentage improvements or monetary impact.",
      "impactScore": 7,
      "remedyTip": "Always state a specific metric (e.g., 'reduced load time by 35%')."
    }
  ],
  "extractedSTARStory": {
    "title": "Title of the project experience",
    "category": "Technical Challenge / Leadership",
    "situation": "Context and problem statement",
    "task": "Specific responsibility",
    "action": "Concrete technical steps taken",
    "result": "Quantifiable outcome achieved",
    "metrics": ["40% speedup", "Saved 15 hours/week"],
    "tags": ["React", "Performance"]
  }
}`;

  return await generateJSON<QuestionEvaluation>(prompt, systemInstruction);
}

/**
 * 4. Generate Final Interview Session Summary Report
 */
export async function generateSessionReport(params: {
  persona: PersonaType;
  focusArea: FocusArea;
  targetTitle: string;
  turns: InterviewTurn[];
  jobDescription: string;
}) {
  const { persona, focusArea, targetTitle, turns, jobDescription } = params;

  const turnsText = turns
    .map(
      (t, idx) =>
        `Turn ${idx + 1}: ${t.question}\nAnswer: ${t.candidateAnswer || "(No answer)"}\nScore: ${
          t.evaluation?.score ?? 0
        }\nStrengths: ${t.evaluation?.strengths?.join("; ")}\nWeaknesses: ${t.evaluation?.weaknesses?.join("; ")}`
    )
    .join("\n---\n");

  const systemInstruction = `You are the Lead Executive Hiring Manager conducting a final candidate calibration meeting for ${targetTitle}.
Review all turns of this mock interview and produce a comprehensive, inspiring, and actionable report card.`;

  const prompt = `INTERVIEW PROFILE: ${targetTitle}
PERSONA: ${persona}
FOCUS AREA: ${focusArea}

INTERVIEW TURNS & EVALUATIONS:
${turnsText}

JOB REQUIREMENTS SUMMARY:
${jobDescription}

Generate final summary JSON:
{
  "overallScore": 84,
  "overallRating": "Strong Hire / Hire / Lean Hire / Lean No Hire",
  "keyTakeaways": ["string (3 overarching observations)"],
  "topStrengths": ["string (3 primary candidate advantages)"],
  "priorityImprovements": ["string (3 urgent areas for candidate to fix)"],
  "personaVerdict": "string (2-3 sentences in the persona's voice providing direct hiring feedback)"
}`;

  return await generateJSON<{
    overallScore: number;
    overallRating: string;
    keyTakeaways: string[];
    topStrengths: string[];
    priorityImprovements: string[];
    personaVerdict: string;
  }>(prompt, systemInstruction);
}

/**
 * 5. Polish STAR Story
 */
export async function polishSTARStory(rawStory: Partial<STARStory>) {
  const systemInstruction = `You are a Senior Executive Career Coach specializing in behavioral interview prep.
Refine raw candidate story components into a crisp, high-impact STAR story ready for 60-second interview delivery.
Maximize quantitative metrics, strong action verbs, and clear business outcomes.`;

  const prompt = `RAW STORY:
Title: ${rawStory.title || "Untitled Project"}
Category: ${rawStory.category || "General"}
Situation: ${rawStory.situation}
Task: ${rawStory.task}
Action: ${rawStory.action}
Result: ${rawStory.result}

Refine and return JSON:
{
  "title": "Clean concise title",
  "category": "Category name",
  "situation": "Crisp 1-2 sentence background framing problem context",
  "task": "Clear 1 sentence objective",
  "action": "Bullet-pointed or framed concrete actions led by candidate using strong technical verbs",
  "result": "High-impact ending emphasizing quantitative business metrics and outcomes",
  "metrics": ["string (extracted numbers or estimated percentage gains)"],
  "tags": ["string (relevant tech stack & soft skills tags)"]
}`;

  return await generateJSON<{
    title: string;
    category: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    metrics: string[];
    tags: string[];
  }>(prompt, systemInstruction);
}

/**
 * 6. Generate TTS Audio Base64 (Optional Gemini Speech)
 */
export async function generateTTSAudio(text: string, voiceName: string = "Kore"): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: `Say clearly in a professional interviewer voice: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.warn("Gemini TTS Error (falling back gracefully to browser SpeechSynthesis):", error);
    return null;
  }
}
