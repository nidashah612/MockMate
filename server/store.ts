import {
  UserProfile,
  TargetProfile,
  InterviewSession,
  WeakSpotItem,
  STARStory,
  AnalyticsSummary
} from '../src/types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'mockmate-db.json');

interface LocalDB {
  users: Record<string, UserProfile & { passwordHash?: string }>;
  targetProfiles: Record<string, TargetProfile>;
  interviewSessions: Record<string, InterviewSession>;
  weakSpots: Record<string, WeakSpotItem>;
  starStories: Record<string, STARStory>;
}

const defaultDB: LocalDB = {
  users: {
    'demo-user': {
      id: 'demo-user',
      email: 'alex.candidate@example.com',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    }
  },
  targetProfiles: {
    'demo-target-1': {
      id: 'demo-target-1',
      userId: 'demo-user',
      title: 'Senior Frontend Engineer @ Stripe',
      company: 'Stripe',
      roleCategory: 'Frontend Engineering',
      jobDescription: `Key Responsibilities:
- Architect and build accessible, ultra-performant Web UI components for financial dashboards.
- Optimize React component rendering pipelines and client state synchronization.
- Lead code reviews, drive system design discussions, and mentor junior engineers.
- Collaborate with backend APIs to build real-time transaction monitoring dashboards.

Requirements:
- 5+ years with React, TypeScript, state management, and Web Vitals optimization.
- Proven experience handling heavy data grids and async API performance bottlenecks.
- Excellent behavioral STAR communication and system architecture design skills.`,
      resumeText: `Alex Rivera | Senior Frontend Developer
Email: alex.candidate@example.com | GitHub: github.com/alexrivera-dev

SUMMARY:
Frontend Engineer with 6 years of experience scaling React/TypeScript web apps. Specialized in performance optimization, design systems, and state management.

EXPERIENCE:
Senior Web Developer @ TechCore (2022 - Present)
- Reduced web dashboard load time by 42% by implementing code-splitting, lazy loading, and dynamic SVG rendering.
- Re-architected data fetching pipeline using React Query, cutting redundant API requests by 65%.
- Led a team of 4 frontend engineers building high-density real-time analytics widgets.

Frontend Software Engineer @ WebMetrics (2019 - 2022)
- Built custom component library used across 12 micro-frontends with 100% WCAG accessibility compliance.
- Resolved memory leaks in WebSocket streaming dashboard during heavy market volatility events.

SKILLS:
React, TypeScript, Next.js, Webpack, Tailwind CSS, Jest, GraphQL, REST APIs, Web Vitals, WebSockets.`,
      parsedSummary: {
        keyRequirements: [
          '5+ years React & TypeScript expertise',
          'Heavy data grid & dashboard optimization',
          'System architecture & state management design',
          'Behavioral STAR communication & leadership'
        ],
        technicalStack: ['React', 'TypeScript', 'State Management', 'Web Vitals', 'REST/GraphQL', 'WebSockets'],
        matchingSkills: ['React', 'TypeScript', 'Performance Optimization', 'Component Libraries'],
        potentialGaps: ['Financial transaction systems exposure', 'Deep GraphQL micro-frontend security'],
        suggestedFocusAreas: [
          'Deep dive into React state optimization & re-render prevention',
          'System design for high-throughput real-time payment dashboards',
          'STAR stories detailing technical disagreement resolution'
        ]
      },
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  },
  interviewSessions: {},
  weakSpots: {
    'ws-1': {
      id: 'ws-1',
      userId: 'demo-user',
      category: 'STAR Method',
      title: 'Missing Quantified Impact in STAR Results',
      description: 'Often describes actions thoroughly but ends behavioral answers without concrete metrics or business revenue/time savings data.',
      impactScore: 8,
      status: 'active',
      occurrences: 3,
      remedyTip: 'Conclude every STAR story with 2 specific numbers: percentage efficiency gained (e.g. 35% faster load) and business outcome (e.g. saved $50k/yr).',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    'ws-2': {
      id: 'ws-2',
      userId: 'demo-user',
      category: 'Communication',
      title: 'Hedging & Filler Words Under Pressure',
      description: 'Tendency to use filler phrases like "I guess", "kind of", and "um" when asked unexpected follow-up questions during stress tests.',
      impactScore: 7,
      status: 'improving',
      occurrences: 2,
      remedyTip: 'Take a deliberate 2-second pause before answering instead of speaking immediately with filler words.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  },
  starStories: {
    'story-1': {
      id: 'story-1',
      userId: 'demo-user',
      title: 'Slashing Dashboard Latency by 42%',
      category: 'Performance Optimization',
      situation: 'TechCore analytics dashboard was suffering from 4.8s initial load times, causing customer churn in enterprise accounts.',
      task: 'As Senior Lead, I was tasked with bringing the page load time under 2.0s without reducing real-time chart features.',
      action: 'Audited Webpack bundles, implemented Route-level code splitting, virtualized heavy data tables, and converted polling to server-sent events.',
      result: 'Reduced load time to 1.8s (42% speedup) and lowered client memory footprint by 55%, preventing enterprise account cancellation.',
      metrics: ['42% reduction in initial load time', '55% reduction in client RAM usage', '$120k ARR customer retention'],
      tags: ['React', 'Performance', 'Code Splitting', 'Leadership'],
      isPolished: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  }
};

class MemoryStore {
  private db: LocalDB;

  constructor() {
    this.db = this.loadFromFile();
  }

  private loadFromFile(): LocalDB {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read db file, using default in-memory store:', e);
    }
    return defaultDB;
  }

  private saveToFile() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist db to file:', e);
    }
  }

  // Users
  getUser(id: string): UserProfile | undefined {
    const user = this.db.users[id];
    if (!user) return undefined;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  findUserByEmail(email: string) {
    return Object.values(this.db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(email: string, name: string, passwordHash?: string): UserProfile {
    const id = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newUser = {
      id,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      passwordHash
    };
    this.db.users[id] = newUser;
    this.saveToFile();
    const { passwordHash: _, ...profile } = newUser;
    return profile;
  }

  // Target Profiles
  getTargetProfiles(userId: string): TargetProfile[] {
    return Object.values(this.db.targetProfiles).filter((tp) => tp.userId === userId);
  }

  getTargetProfile(id: string): TargetProfile | undefined {
    return this.db.targetProfiles[id];
  }

  saveTargetProfile(profile: TargetProfile): TargetProfile {
    this.db.targetProfiles[profile.id] = profile;
    this.saveToFile();
    return profile;
  }

  deleteTargetProfile(id: string) {
    delete this.db.targetProfiles[id];
    this.saveToFile();
  }

  // Interview Sessions
  getSessions(userId: string): InterviewSession[] {
    return Object.values(this.db.interviewSessions)
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getSession(id: string): InterviewSession | undefined {
    return this.db.interviewSessions[id];
  }

  saveSession(session: InterviewSession): InterviewSession {
    this.db.interviewSessions[session.id] = session;
    this.saveToFile();
    return session;
  }

  // Weak Spots
  getWeakSpots(userId: string): WeakSpotItem[] {
    return Object.values(this.db.weakSpots).filter((ws) => ws.userId === userId);
  }

  saveWeakSpot(item: WeakSpotItem): WeakSpotItem {
    this.db.weakSpots[item.id] = item;
    this.saveToFile();
    return item;
  }

  updateWeakSpotStatus(id: string, status: 'active' | 'improving' | 'mastered') {
    if (this.db.weakSpots[id]) {
      this.db.weakSpots[id].status = status;
      this.db.weakSpots[id].updatedAt = new Date().toISOString();
      this.saveToFile();
    }
  }

  // STAR Stories
  getSTARStories(userId: string): STARStory[] {
    return Object.values(this.db.starStories).filter((st) => st.userId === userId);
  }

  saveSTARStory(story: STARStory): STARStory {
    this.db.starStories[story.id] = story;
    this.saveToFile();
    return story;
  }

  deleteSTARStory(id: string) {
    delete this.db.starStories[id];
    this.saveToFile();
  }

  // Analytics
  getAnalytics(userId: string): AnalyticsSummary {
    const sessions = Object.values(this.db.interviewSessions).filter(
      (s) => s.userId === userId && s.status === 'completed'
    );
    const weakSpots = this.getWeakSpots(userId);
    const stories = this.getSTARStories(userId);

    const totalSessions = sessions.length;
    const scores = sessions.map((s) => s.overallScore || 70);
    const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 82;

    // Trend
    const scoreTrend = sessions.slice(0, 10).map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: s.overallScore || 75,
      persona: s.persona
    })).reverse();

    if (scoreTrend.length === 0) {
      scoreTrend.push(
        { date: 'Jul 20', score: 72, persona: 'friendly' },
        { date: 'Jul 22', score: 78, persona: 'neutral' },
        { date: 'Jul 25', score: 85, persona: 'stress_test' }
      );
    }

    // Radar default
    const skillRadar = [
      { subject: 'Technical Depth', score: 84, fullMark: 100 },
      { subject: 'STAR Framework', score: 76, fullMark: 100 },
      { subject: 'Communication Clarity', score: 82, fullMark: 100 },
      { subject: 'Problem Solving', score: 88, fullMark: 100 },
      { subject: 'Confidence & Pace', score: 79, fullMark: 100 },
      { subject: 'System Architecture', score: 81, fullMark: 100 }
    ];

    return {
      totalSessions: totalSessions || 3,
      averageScore,
      completedSessionsCount: totalSessions || 3,
      totalSTARStoriesCount: stories.length,
      activeWeakSpotsCount: weakSpots.filter((w) => w.status === 'active').length,
      scoreTrend,
      skillRadar,
      fillerWordsStats: [
        { word: 'um / uh', count: 12 },
        { word: 'like', count: 8 },
        { word: 'you know', count: 5 },
        { word: 'kind of', count: 4 }
      ]
    };
  }
}

export const dbStore = new MemoryStore();
