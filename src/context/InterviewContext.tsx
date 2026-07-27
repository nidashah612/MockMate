import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TargetProfile,
  InterviewSession,
  WeakSpotItem,
  STARStory,
  AnalyticsSummary,
  QuestionEvaluation
} from '../types';
import {
  fetchTargetProfiles,
  createTargetProfile,
  deleteTargetProfileApi,
  startInterviewApi,
  submitAnswerApi,
  fetchWeakSpots,
  updateWeakSpotStatusApi,
  fetchSTARStories,
  createSTARStoryApi,
  polishSTARStoryApi,
  deleteSTARStoryApi,
  fetchAnalytics
} from '../services/api';

interface InterviewContextType {
  targetProfiles: TargetProfile[];
  activeProfile: TargetProfile | null;
  setActiveProfile: (profile: TargetProfile | null) => void;
  activeSession: InterviewSession | null;
  setActiveSession: (session: InterviewSession | null) => void;
  weakSpots: WeakSpotItem[];
  starStories: STARStory[];
  analytics: AnalyticsSummary | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  addProfile: (payload: {
    title: string;
    company?: string;
    roleCategory?: string;
    jobDescription: string;
    resumeText: string;
  }) => Promise<TargetProfile>;
  deleteProfile: (id: string) => Promise<void>;
  startNewInterview: (payload: {
    targetProfileId: string;
    persona: string;
    focusArea: string;
    isVoiceMode: boolean;
    totalQuestions: number;
  }) => Promise<InterviewSession>;
  submitAnswer: (
    answer: string,
    audioDurationSeconds?: number
  ) => Promise<{ session: InterviewSession; isSessionComplete: boolean; evaluation: QuestionEvaluation }>;
  updateWeakSpotStatus: (id: string, status: 'active' | 'improving' | 'mastered') => Promise<void>;
  addSTARStory: (story: Partial<STARStory>) => Promise<STARStory>;
  polishSTARStory: (id: string) => Promise<STARStory>;
  deleteSTARStory: (id: string) => Promise<void>;
}

const InterviewContext = createContext<InterviewContextType | null>(null);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targetProfiles, setTargetProfiles] = useState<TargetProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<TargetProfile | null>(null);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [weakSpots, setWeakSpots] = useState<WeakSpotItem[]>([]);
  const [starStories, setStarStories] = useState<STARStory[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = async () => {
    try {
      const [profiles, ws, stories, stats] = await Promise.all([
        fetchTargetProfiles(),
        fetchWeakSpots(),
        fetchSTARStories(),
        fetchAnalytics()
      ]);
      setTargetProfiles(profiles);
      if (profiles.length > 0 && !activeProfile) {
        setActiveProfile(profiles[0]);
      }
      setWeakSpots(ws);
      setStarStories(stories);
      setAnalytics(stats);
    } catch (e) {
      console.warn('Data sync warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addProfile = async (payload: {
    title: string;
    company?: string;
    roleCategory?: string;
    jobDescription: string;
    resumeText: string;
  }) => {
    const newProf = await createTargetProfile(payload);
    setTargetProfiles((prev) => [newProf, ...prev]);
    setActiveProfile(newProf);
    return newProf;
  };

  const deleteProfile = async (id: string) => {
    await deleteTargetProfileApi(id);
    setTargetProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfile?.id === id) {
      setActiveProfile(targetProfiles.find((p) => p.id !== id) || null);
    }
  };

  const startNewInterview = async (payload: {
    targetProfileId: string;
    persona: string;
    focusArea: string;
    isVoiceMode: boolean;
    totalQuestions: number;
  }) => {
    const session = await startInterviewApi(payload);
    setActiveSession(session);
    return session;
  };

  const submitAnswer = async (answer: string, audioDurationSeconds?: number) => {
    if (!activeSession) throw new Error('No active session');
    const res = await submitAnswerApi({
      sessionId: activeSession.id,
      answer,
      audioDurationSeconds
    });
    setActiveSession(res.session);

    // Refresh memory data in background
    refreshData();

    return res;
  };

  const updateWeakSpotStatus = async (id: string, status: 'active' | 'improving' | 'mastered') => {
    await updateWeakSpotStatusApi(id, status);
    setWeakSpots((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status, updatedAt: new Date().toISOString() } : w))
    );
  };

  const addSTARStory = async (story: Partial<STARStory>) => {
    const newStory = await createSTARStoryApi(story);
    setStarStories((prev) => [newStory, ...prev]);
    return newStory;
  };

  const polishStory = async (id: string) => {
    const updated = await polishSTARStoryApi(id);
    setStarStories((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteStory = async (id: string) => {
    await deleteSTARStoryApi(id);
    setStarStories((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <InterviewContext.Provider
      value={{
        targetProfiles,
        activeProfile,
        setActiveProfile,
        activeSession,
        setActiveSession,
        weakSpots,
        starStories,
        analytics,
        loading,
        refreshData,
        addProfile,
        deleteProfile,
        startNewInterview,
        submitAnswer,
        updateWeakSpotStatus,
        addSTARStory,
        polishSTARStory: polishStory,
        deleteSTARStory: deleteStory
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) throw new Error('useInterview must be used within an InterviewProvider');
  return context;
};
