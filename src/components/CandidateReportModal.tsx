import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import {
  Award,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  Target,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  X,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

interface CandidateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateReportModal: React.FC<CandidateReportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { analytics, activeProfile, weakSpots, starStories } = useInterview();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const candidateName = user?.name || 'Nida Shah';
  const candidateEmail = user?.email || 'nidashah6122003@gmail.com';
  const avgScore = analytics?.averageScore || 82;
  const totalMocks = analytics?.totalMockSessions || 12;
  const activeWeakSpots = weakSpots.filter((w) => w.status === 'active');

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const categoryBreakdown = [
    { name: 'Technical Depth', score: 88, status: 'Strong' },
    { name: 'System Design', score: 76, status: 'Developing' },
    { name: 'Behavioral & STAR', score: 85, status: 'Strong' },
    { name: 'Problem Solving', score: 82, status: 'Strong' },
    { name: 'Communication & Delivery', score: 79, status: 'Proficient' }
  ];

  const sessionHistory = [
    { id: 'sess_1', date: '2026-07-26', role: 'Senior Frontend Engineer', company: 'Stripe', score: 88, verdict: 'Strong Hire', starCoverage: '92%' },
    { id: 'sess_2', date: '2026-07-24', role: 'Fullstack Systems Engineer', company: 'DataStack', score: 81, verdict: 'Hire', starCoverage: '85%' },
    { id: 'sess_3', date: '2026-07-21', role: 'Product Manager', company: 'Meta', score: 75, verdict: 'Leaning Hire', starCoverage: '78%' },
    { id: 'sess_4', date: '2026-07-18', role: 'AI & Data Science Lead', company: 'OpenAI', score: 84, verdict: 'Strong Hire', starCoverage: '89%' }
  ];

  const handleCopySummary = () => {
    const text = `MOCKMATE CANDIDATE READINESS REPORT
Candidate: ${candidateName} (${candidateEmail})
Date Generated: ${reportDate}
Target Role: ${activeProfile ? `${activeProfile.title} (${activeProfile.company})` : 'General Engineering Candidate'}
Overall Readiness Score: ${avgScore}/100 (Top 12% Peer Placement)
Completed Mock Rounds: ${totalMocks}
Active Weak Spots: ${activeWeakSpots.length}
Saved STAR Stories: ${starStories.length}

CATEGORY BREAKDOWN:
- Technical Depth: 88/100
- Behavioral & STAR: 85/100
- Problem Solving: 82/100
- Communication: 79/100
- System Design: 76/100

ACTIVE WEAK SPOTS IN MEMORY:
${activeWeakSpots.map(w => `• ${w.title}: ${w.description} (Tip: ${w.remedyTip})`).join('\n') || 'None'}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:static print:block">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:border-none">
        {/* Header bar - Fixed at top, Hidden when printing */}
        <div className="flex-shrink-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Candidate Progress & Readiness Report</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Summary' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 print:p-6 print:overflow-visible text-slate-900">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-xs uppercase tracking-widest">
                <BrainCircuit className="w-4 h-4 text-slate-800" />
                <span>MockMate Candidate Performance Evaluation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {candidateName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Email: {candidateEmail} • Report Generated: {reportDate}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right min-w-[200px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Readiness</div>
              <div className="text-3xl font-extrabold text-slate-900">{avgScore}<span className="text-sm text-slate-400">/100</span></div>
              <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Top 12% Peer Readiness</div>
            </div>
          </div>

          {/* Target Role Focus */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Primary Target Role</span>
              <span className="text-sm font-bold text-slate-900">
                {activeProfile ? `${activeProfile.title} (${activeProfile.company})` : 'Senior Engineering Candidate'}
              </span>
            </div>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              Active Focus
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Mock Score</div>
              <div className="text-2xl font-black text-slate-900">{avgScore}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Ready for interviews</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Mocks Completed</div>
              <div className="text-2xl font-black text-slate-900">{totalMocks}</div>
              <div className="text-[10px] text-slate-500 font-medium">Adaptive rounds</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Weak Spots</div>
              <div className="text-2xl font-black text-slate-900">{activeWeakSpots.length}</div>
              <div className="text-[10px] text-amber-700 font-semibold">Memory triggers</div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">STAR Story Bank</div>
              <div className="text-2xl font-black text-slate-900">{starStories.length}</div>
              <div className="text-[10px] text-slate-500 font-medium">Polished stories</div>
            </div>
          </div>

          {/* Category Proficiency Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-slate-700" />
              <span>Competency Breakdown</span>
            </h3>

            <div className="space-y-2">
              {categoryBreakdown.map((cat, i) => (
                <div key={i} className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 sm:w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${cat.score}%` }} />
                    </div>
                    <span className="font-extrabold text-slate-900 w-8 text-right">{cat.score}</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">
                      {cat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Weak Spots Memory Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <BrainCircuit className="w-4 h-4 text-amber-600" />
              <span>Tracked Weak Spots Memory & Remediation</span>
            </h3>

            {activeWeakSpots.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {activeWeakSpots.map((ws) => (
                  <div key={ws.id} className="p-3.5 bg-white space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ws.title}</span>
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                        Occurrences: {ws.occurrences}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{ws.description}</p>
                    <div className="text-[11px] text-slate-800 font-medium pt-1">
                      💡 <strong>Remedy:</strong> {ws.remedyTip}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
                No active weak spots recorded in candidate memory profile.
              </div>
            )}
          </div>

          {/* Recent Mock Interviews History */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Mock Interview Log</span>
            </h3>

            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              {sessionHistory.map((sess) => (
                <div key={sess.id} className="p-3 bg-white flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{sess.role} ({sess.company})</div>
                    <div className="text-[10px] text-slate-400">{sess.date} • STAR Coverage {sess.starCoverage}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-slate-900">{sess.score}/100</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                      {sess.verdict}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Footer */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
            Generated by MockMate AI Interviewer & Candidate Performance Analytics Engine • Confidential Candidate Report
          </div>
        </div>
      </div>
    </div>
  );
};
