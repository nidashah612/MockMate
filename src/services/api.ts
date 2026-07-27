import {
  UserProfile,
  TargetProfile,
  InterviewSession,
  WeakSpotItem,
  STARStory,
  AnalyticsSummary,
  QuestionEvaluation
} from '../types';

function getUserIdHeader(): Record<string, string> {
  const userJson = localStorage.getItem('mockmate_user');
  if (userJson) {
    try {
      const u = JSON.parse(userJson);
      if (u?.id) return { 'x-user-id': u.id };
    } catch (e) {
      // ignore
    }
  }
  return { 'x-user-id': 'demo-user' };
}

export async function loginApi(email: string, password?: string): Promise<{ user: UserProfile }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function registerApi(email: string, name: string, password?: string): Promise<{ user: UserProfile }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password })
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function resetPasswordApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Password reset failed');
  return res.json();
}

export async function fetchCurrentAuthUser(): Promise<{ user: UserProfile }> {
  const res = await fetch('/api/auth/me', {
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to get current user');
  return res.json();
}

export async function fetchTargetProfiles(): Promise<TargetProfile[]> {
  const res = await fetch('/api/target-profiles', {
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch target profiles');
  const data = await res.json();
  return data.profiles;
}

export async function createTargetProfile(payload: {
  title: string;
  company?: string;
  roleCategory?: string;
  jobDescription: string;
  resumeText: string;
}): Promise<TargetProfile> {
  const res = await fetch('/api/target-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create target profile');
  const data = await res.json();
  return data.profile;
}

export async function deleteTargetProfileApi(id: string): Promise<void> {
  const res = await fetch(`/api/target-profiles/${id}`, {
    method: 'DELETE',
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to delete target profile');
}

export async function parseDocumentsApi(jobDescription: string, resumeText: string) {
  const res = await fetch('/api/parse-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify({ jobDescription, resumeText })
  });
  if (!res.ok) throw new Error('Parsing documents failed');
  const data = await res.json();
  return data.parsed;
}

export async function startInterviewApi(payload: {
  targetProfileId: string;
  persona: string;
  focusArea: string;
  isVoiceMode: boolean;
  totalQuestions: number;
}): Promise<InterviewSession> {
  const res = await fetch('/api/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to start interview');
  const data = await res.json();
  return data.session;
}

export async function submitAnswerApi(payload: {
  sessionId: string;
  answer: string;
  audioDurationSeconds?: number;
}): Promise<{ session: InterviewSession; isSessionComplete: boolean; evaluation: QuestionEvaluation }> {
  const res = await fetch('/api/interview/submit-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to submit answer');
  return res.json();
}

export async function fetchWeakSpots(): Promise<WeakSpotItem[]> {
  const res = await fetch('/api/weak-spots', {
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch weak spots');
  const data = await res.json();
  return data.weakSpots;
}

export async function updateWeakSpotStatusApi(id: string, status: 'active' | 'improving' | 'mastered'): Promise<void> {
  const res = await fetch(`/api/weak-spots/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update weak spot status');
}

export async function fetchSTARStories(): Promise<STARStory[]> {
  const res = await fetch('/api/star-stories', {
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch STAR stories');
  const data = await res.json();
  return data.stories;
}

export async function createSTARStoryApi(story: Partial<STARStory>): Promise<STARStory> {
  const res = await fetch('/api/star-stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify(story)
  });
  if (!res.ok) throw new Error('Failed to create STAR story');
  const data = await res.json();
  return data.story;
}

export async function polishSTARStoryApi(id: string): Promise<STARStory> {
  const res = await fetch(`/api/star-stories/${id}/polish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() }
  });
  if (!res.ok) throw new Error('Failed to polish STAR story');
  const data = await res.json();
  return data.story;
}

export async function deleteSTARStoryApi(id: string): Promise<void> {
  const res = await fetch(`/api/star-stories/${id}`, {
    method: 'DELETE',
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to delete STAR story');
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch('/api/analytics', {
    headers: getUserIdHeader()
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  const data = await res.json();
  return data.analytics;
}

export async function fetchTTSApi(text: string, persona: string): Promise<string | null> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, persona })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.audioBase64 || null;
  } catch (e) {
    return null;
  }
}
