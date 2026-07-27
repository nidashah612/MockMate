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

async function handleResponse<T>(res: Response, defaultError: string): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || defaultError);
  }
  return res.json();
}

export async function loginApi(email: string, password?: string): Promise<{ user: UserProfile }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse<{ user: UserProfile }>(res, 'Login failed');
}

export async function registerApi(email: string, name: string, password?: string): Promise<{ user: UserProfile }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password })
  });
  return handleResponse<{ user: UserProfile }>(res, 'Registration failed');
}

export async function resetPasswordApi(email: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse<{ success: boolean; message: string }>(res, 'Password reset failed');
}

export async function fetchCurrentAuthUser(): Promise<{ user: UserProfile }> {
  const res = await fetch('/api/auth/me', {
    headers: getUserIdHeader()
  });
  return handleResponse<{ user: UserProfile }>(res, 'Failed to get current user');
}

export async function fetchTargetProfiles(): Promise<TargetProfile[]> {
  const res = await fetch('/api/target-profiles', {
    headers: getUserIdHeader()
  });
  const data = await handleResponse<{ profiles: TargetProfile[] }>(res, 'Failed to fetch target profiles');
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
  const data = await handleResponse<{ profile: TargetProfile }>(res, 'Failed to create target profile');
  return data.profile;
}

export async function deleteTargetProfileApi(id: string): Promise<void> {
  const res = await fetch(`/api/target-profiles/${id}`, {
    method: 'DELETE',
    headers: getUserIdHeader()
  });
  await handleResponse<{ success: boolean }>(res, 'Failed to delete target profile');
}

export async function parseDocumentsApi(jobDescription: string, resumeText: string) {
  const res = await fetch('/api/parse-documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify({ jobDescription, resumeText })
  });
  const data = await handleResponse<{ parsed: any }>(res, 'Parsing documents failed');
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
  const data = await handleResponse<{ session: InterviewSession }>(res, 'Failed to start interview');
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
  return handleResponse<{ session: InterviewSession; isSessionComplete: boolean; evaluation: QuestionEvaluation }>(
    res,
    'Failed to submit answer'
  );
}

export async function fetchWeakSpots(): Promise<WeakSpotItem[]> {
  const res = await fetch('/api/weak-spots', {
    headers: getUserIdHeader()
  });
  const data = await handleResponse<{ weakSpots: WeakSpotItem[] }>(res, 'Failed to fetch weak spots');
  return data.weakSpots;
}

export async function updateWeakSpotStatusApi(id: string, status: 'active' | 'improving' | 'mastered'): Promise<void> {
  const res = await fetch(`/api/weak-spots/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify({ status })
  });
  await handleResponse<{ success: boolean }>(res, 'Failed to update weak spot status');
}

export async function fetchSTARStories(): Promise<STARStory[]> {
  const res = await fetch('/api/star-stories', {
    headers: getUserIdHeader()
  });
  const data = await handleResponse<{ stories: STARStory[] }>(res, 'Failed to fetch STAR stories');
  return data.stories;
}

export async function createSTARStoryApi(story: Partial<STARStory>): Promise<STARStory> {
  const res = await fetch('/api/star-stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() },
    body: JSON.stringify(story)
  });
  const data = await handleResponse<{ story: STARStory }>(res, 'Failed to create STAR story');
  return data.story;
}

export async function polishSTARStoryApi(id: string): Promise<STARStory> {
  const res = await fetch(`/api/star-stories/${id}/polish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getUserIdHeader() }
  });
  const data = await handleResponse<{ story: STARStory }>(res, 'Failed to polish STAR story');
  return data.story;
}

export async function deleteSTARStoryApi(id: string): Promise<void> {
  const res = await fetch(`/api/star-stories/${id}`, {
    method: 'DELETE',
    headers: getUserIdHeader()
  });
  await handleResponse<{ success: boolean }>(res, 'Failed to delete STAR story');
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const res = await fetch('/api/analytics', {
    headers: getUserIdHeader()
  });
  const data = await handleResponse<{ analytics: AnalyticsSummary }>(res, 'Failed to fetch analytics');
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
