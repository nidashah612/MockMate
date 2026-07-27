export type PersonaType = 'friendly' | 'neutral' | 'stress_test';

export type FocusArea = 'technical' | 'behavioral_star' | 'system_design' | 'culture' | 'hybrid';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface TargetProfile {
  id: string;
  userId: string;
  title: string; // e.g. "Senior Frontend Engineer @ Stripe"
  company: string;
  roleCategory: string;
  jobDescription: string;
  resumeText: string;
  resumeFileName?: string;
  parsedSummary?: {
    keyRequirements: string[];
    technicalStack: string[];
    matchingSkills: string[];
    potentialGaps: string[];
    suggestedFocusAreas: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface WeakSpotItem {
  id: string;
  userId: string;
  category: 'Technical' | 'Behavioral' | 'Communication' | 'System Design' | 'STAR Method';
  title: string;
  description: string;
  impactScore: number; // 1-10
  status: 'active' | 'improving' | 'mastered';
  firstDetectedSessionId?: string;
  lastSeenSessionId?: string;
  occurrences: number;
  remedyTip: string;
  createdAt: string;
  updatedAt: string;
}

export interface STARStory {
  id: string;
  userId: string;
  title: string;
  category: string; // e.g. "Leadership", "Conflict Resolution", "Performance Optimization"
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  tags: string[];
  sourceSessionId?: string;
  isPolished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionEvaluation {
  score: number; // 0 - 100
  technicalDepthScore: number; // 0 - 100
  starAlignmentScore: number; // 0 - 100
  communicationClarityScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  strengths: string[];
  weaknesses: string[];
  fillerWordsDetected: { word: string; count: number }[];
  idealResponseSummary: string;
  actionableAdvice: string;
  followUpNeeded: boolean;
  suggestedFollowUpQuestion?: string;
  detectedWeakSpots?: Omit<WeakSpotItem, 'id' | 'userId' | 'status' | 'occurrences' | 'createdAt' | 'updatedAt'>[];
  extractedSTARStory?: Omit<STARStory, 'id' | 'userId' | 'isPolished' | 'createdAt' | 'updatedAt'>;
}

export interface InterviewTurn {
  id: string;
  questionNumber: number;
  isFollowUp: boolean;
  question: string;
  interviewerRationale: string;
  expectedKeyPoints: string[];
  candidateAnswer?: string;
  audioDurationSeconds?: number;
  evaluation?: QuestionEvaluation;
  answeredAt?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  targetProfileId: string;
  targetProfileTitle: string;
  persona: PersonaType;
  focusArea: FocusArea;
  isVoiceMode: boolean;
  totalQuestions: number;
  turns: InterviewTurn[];
  currentTurnIndex: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  overallScore?: number;
  summaryFeedback?: {
    overallRating: string;
    keyTakeaways: string[];
    topStrengths: string[];
    priorityImprovements: string[];
    personaVerdict: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface AnalyticsSummary {
  totalSessions: number;
  averageScore: number;
  completedSessionsCount: number;
  totalSTARStoriesCount: number;
  activeWeakSpotsCount: number;
  scoreTrend: { date: string; score: number; persona: string }[];
  skillRadar: { subject: string; score: number; fullMark: number }[];
  fillerWordsStats: { word: string; count: number }[];
}
