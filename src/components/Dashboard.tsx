import React from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  BrainCircuit,
  Target,
  BookOpen,
  Award,
  Play,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Clock,
  Zap,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface DashboardProps {
  onStartNewInterview: () => void;
  onNavigateTab: (tab: string) => void;
  onViewReport: (sessionId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartNewInterview,
  onNavigateTab,
  onViewReport
}) => {
  const { targetProfiles, activeProfile, weakSpots, starStories, analytics } = useInterview();

  const activeWeakSpots = weakSpots.filter((w) => w.status === 'active');
  const avgScore = analytics?.averageScore || 82;
  const scoreTrendData = analytics?.scoreTrend || [];
  const skillRadarData = analytics?.skillRadar || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Welcome & Active Role Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-slate-700" />
            <span>AI Mock Interviewer & Persistent Memory Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready for your next adaptive mock?
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            MockMate remembers your past filler words, missing STAR metrics, and technical gaps across sessions to continuously cross-examine you until you reach 100% interview readiness.
          </p>

          {activeProfile ? (
            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Current Target Role:</span>
              <span className="font-semibold text-slate-800 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg">
                {activeProfile.title} ({activeProfile.company})
              </span>
            </div>
          ) : (
            <div className="pt-2 text-xs text-amber-700 font-medium">
              ⚠️ No active target role selected. Click 'Target Roles' to paste a JD and Resume.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={() => onNavigateTab('target-profiles')}
            className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-xs"
          >
            <Target className="w-4 h-4 text-slate-700" />
            <span>Target Roles</span>
          </button>

          <button
            onClick={onStartNewInterview}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Adaptive Mock</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Readiness Score</span>
            <Award className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgScore}</span>
            <span className="text-xs text-slate-400 font-semibold">/100</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Top 12% among peer candidates</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Weak Spots</span>
            <BrainCircuit className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeWeakSpots.length}</span>
            <span className="text-xs text-slate-400 font-semibold">logged in memory</span>
          </div>
          <button
            onClick={() => onNavigateTab('memory')}
            className="text-[11px] text-slate-800 hover:underline font-bold flex items-center space-x-1"
          >
            <span>Target in next session</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">STAR Stories Bank</span>
            <BookOpen className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{starStories.length}</span>
            <span className="text-xs text-slate-400 font-semibold">stories ready</span>
          </div>
          <button
            onClick={() => onNavigateTab('star-bank')}
            className="text-[11px] text-slate-800 hover:underline font-bold flex items-center space-x-1"
          >
            <span>Review & Polish Stories</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Target Roles Configured</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{targetProfiles.length}</span>
            <span className="text-xs text-slate-400 font-semibold">profiles saved</span>
          </div>
          <button
            onClick={() => onNavigateTab('target-profiles')}
            className="text-[11px] text-slate-800 hover:underline font-bold flex items-center space-x-1"
          >
            <span>Add / Edit Roles</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Score Progress Trend */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <BarChart2 className="w-4 h-4 text-slate-700" />
              <span>Readiness Score Progress Over Time</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Last 10 Mock Rounds</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrendData}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[50, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Mastery Radar Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Award className="w-4 h-4 text-slate-700" />
            <span>Skill Mastery Profile</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#475569" tick={{ fontSize: 9 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name="Skills" dataKey="score" stroke="#1e293b" fill="#334155" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Spots Memory & Quick Practice */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            <span>Persistent Weak Spots Memory Engine</span>
          </div>
          <button
            onClick={() => onNavigateTab('memory')}
            className="text-xs text-slate-800 hover:underline font-bold"
          >
            View All Memory Logs ({weakSpots.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeWeakSpots.length > 0 ? (
            activeWeakSpots.map((ws) => (
              <div key={ws.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{ws.title}</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-bold">
                    Impact {ws.impactScore}/10
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{ws.description}</p>
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-800 flex items-center justify-between font-medium">
                  <span>💡 Tip: {ws.remedyTip}</span>
                  <span className="text-slate-500 font-semibold">{ws.occurrences}x detected</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-6 bg-slate-50/80 border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
              ✨ No active weak spots logged! Complete mock interviews to build your memory profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
