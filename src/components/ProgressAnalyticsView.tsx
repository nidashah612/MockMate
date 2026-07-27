import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { CandidateReportModal } from './CandidateReportModal';
import {
  TrendingUp,
  Award,
  BarChart2,
  BrainCircuit,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  FileText,
  Printer
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
  Radar,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface ProgressAnalyticsViewProps {
  onBack: () => void;
  onStartNewInterview: () => void;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  onBack,
  onStartNewInterview
}) => {
  const { analytics, targetProfiles, weakSpots, starStories } = useInterview();
  const [timeFilter, setTimeFilter] = useState<'all' | '30days' | '7days'>('all');
  const [showReportModal, setShowReportModal] = useState(false);

  const activeWeakSpots = weakSpots.filter((w) => w.status === 'active');
  const avgScore = analytics?.averageScore || 82;
  const totalMocks = analytics?.totalMockSessions || 12;
  const scoreTrendData = analytics?.scoreTrend || [];
  const skillRadarData = analytics?.skillRadar || [];

  const categoryBreakdown = [
    { name: 'Technical Depth', score: 88, fill: '#0f172a' },
    { name: 'System Design', score: 76, fill: '#334155' },
    { name: 'Behavioral & STAR', score: 85, fill: '#475569' },
    { name: 'Problem Solving', score: 82, fill: '#64748b' },
    { name: 'Communication & Delivery', score: 79, fill: '#94a3b8' }
  ];

  const recentSessionsHistory = [
    { id: 'sess_1', date: '2026-07-26', role: 'Senior Frontend Engineer', company: 'Stripe', score: 88, status: 'Completed', fillerWords: 3, starCoverage: '92%' },
    { id: 'sess_2', date: '2026-07-24', role: 'Fullstack Systems Engineer', company: 'DataStack', score: 81, status: 'Completed', fillerWords: 6, starCoverage: '85%' },
    { id: 'sess_3', date: '2026-07-21', role: 'Product Manager', company: 'Meta', score: 75, status: 'Completed', fillerWords: 9, starCoverage: '78%' },
    { id: 'sess_4', date: '2026-07-18', role: 'AI & Data Science Lead', company: 'OpenAI', score: 84, status: 'Completed', fillerWords: 4, starCoverage: '89%' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Back & Navigation Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-800" />
          <span>Back to Recent Page</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Time Horizon:</span>
          <div className="bg-slate-200/80 p-1 rounded-xl flex space-x-1">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('30days')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeFilter === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter('7days')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeFilter === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Hero Title Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Candidate Performance & Progress Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personal Progress & Performance Analytics
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Detailed breakdown of your interview readiness, metric trends over time, skill mastery radar, and memory bank status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Export Progress Report</span>
          </button>

          <button
            onClick={onStartNewInterview}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-current text-amber-400" />
            <span>Start New Mock Round</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards Moved Here */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Candidate Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{avgScore}</span>
            <span className="text-xs text-slate-400 font-semibold">/100 Avg Score</span>
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
            <span className="text-xs text-slate-400 font-semibold">in memory</span>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            <span>Tracked cross-session memory triggers</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">STAR Stories Bank</span>
            <BookOpen className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{starStories.length}</span>
            <span className="text-xs text-slate-400 font-semibold">stories saved</span>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            <span>Polished behavioral story bank</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Target Roles</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">{targetProfiles.length}</span>
            <span className="text-xs text-slate-400 font-semibold">configured</span>
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            <span>Target job descriptions & custom resumes</span>
          </div>
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

          <div className="h-72 w-full pt-2">
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
            <span>Skill Mastery Radar</span>
          </div>

          <div className="h-72 w-full">
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

      {/* Category Performance Bar Breakdown & Recent Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Target className="w-4 h-4 text-slate-700" />
            <span>Category Proficiency Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryBreakdown} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 9 }} width={110} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Session History Log */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Historical Session Logs</span>
            </div>
            <span className="text-[11px] text-slate-500">Last 4 Interviews</span>
          </div>

          <div className="space-y-3">
            {recentSessionsHistory.map((sess) => (
              <div key={sess.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{sess.role}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {sess.company} • {sess.date}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Score</div>
                    <div className="font-extrabold text-slate-900 text-sm">{sess.score}/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">STAR Coverage</div>
                    <div className="font-bold text-slate-700 text-xs">{sess.starCoverage}</div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold">
                    {sess.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persistent Weak Spots Memory Block Moved Here */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            <span>Persistent Weak Spots Memory Engine Summary</span>
          </div>
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

      {/* Candidate Progress Report Modal */}
      <CandidateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
};
