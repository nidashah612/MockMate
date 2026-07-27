import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BarChart3,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface SessionReportCardProps {
  onBackToDashboard: () => void;
  onStartNewSession: () => void;
}

export const SessionReportCard: React.FC<SessionReportCardProps> = ({
  onBackToDashboard,
  onStartNewSession
}) => {
  const { activeSession } = useInterview();
  const [expandedTurnIndex, setExpandedTurnIndex] = useState<number | null>(0);

  if (!activeSession || !activeSession.overallScore) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <p>No completed interview report found.</p>
        <button onClick={onBackToDashboard} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const overallScore = activeSession.overallScore || 80;
  const rating = activeSession.summaryFeedback?.overallRating || 'Hire';
  const turns = activeSession.turns || [];

  // Recharts Radar data derived from average turn evaluations
  const avgTech = Math.round(turns.reduce((acc, t) => acc + (t.evaluation?.technicalDepthScore || 80), 0) / (turns.length || 1));
  const avgSTAR = Math.round(turns.reduce((acc, t) => acc + (t.evaluation?.starAlignmentScore || 75), 0) / (turns.length || 1));
  const avgClarity = Math.round(turns.reduce((acc, t) => acc + (t.evaluation?.communicationClarityScore || 85), 0) / (turns.length || 1));
  const avgConfidence = Math.round(turns.reduce((acc, t) => acc + (t.evaluation?.confidenceScore || 80), 0) / (turns.length || 1));

  const radarData = [
    { subject: 'Technical Depth', score: avgTech, fullMark: 100 },
    { subject: 'STAR Alignment', score: avgSTAR, fullMark: 100 },
    { subject: 'Communication', score: avgClarity, fullMark: 100 },
    { subject: 'Confidence & Pace', score: avgConfidence, fullMark: 100 }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner & Overall Verdict */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Award className="w-4 h-4 text-slate-700" />
              <span>Interview Session Report Card</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {activeSession.targetProfileTitle}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Persona: <strong className="text-slate-800 capitalize">{activeSession.persona}</strong> • Focus Area:{' '}
              <strong className="text-slate-800 capitalize">{activeSession.focusArea.replace('_', ' ')}</strong>
            </p>

            {/* Persona Verdict Box */}
            {activeSession.summaryFeedback?.personaVerdict && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                  <span>Interviewer Persona Verdict</span>
                </div>
                <p className="italic text-slate-800 leading-relaxed">
                  "{activeSession.summaryFeedback.personaVerdict}"
                </p>
              </div>
            )}
          </div>

          {/* Overall Score Badge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs text-center">
            <div className="text-5xl font-black text-slate-900">
              {overallScore}
              <span className="text-lg text-slate-400 font-semibold">/100</span>
            </div>
            <div className="mt-2 px-3.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              {rating}
            </div>
          </div>
        </div>
      </div>

      {/* Radar Skill Dimensions & Key Takeaways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Skill Radar Chart */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-slate-700" />
            <span>Skill Dimensions Analysis</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" stroke="#475569" tick={{ fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name="Candidate Score" dataKey="score" stroke="#1e293b" fill="#334155" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Priority Fixes */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <BrainCircuit className="w-4 h-4 text-slate-700" />
              <span>Key Strengths & Critical Improvements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-800 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Top Strengths</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {activeSession.summaryFeedback?.topStrengths?.map((s, i) => (
                    <li key={i}>{s}</li>
                  )) || <li>Solid technical fundamentals demonstrated</li>}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="font-bold text-amber-800 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Priority Focus Areas</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {activeSession.summaryFeedback?.priorityImprovements?.map((p, i) => (
                    <li key={i}>{p}</li>
                  )) || <li>Add quantitative metrics to STAR results</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={onStartNewSession}
              className="flex items-center space-x-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Another Mock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Per-Question Turn-by-Turn Breakdown */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Question-by-Question Deep Dive ({turns.length} Turns)</span>
        </h3>

        <div className="space-y-3">
          {turns.map((turn, idx) => {
            const isExpanded = expandedTurnIndex === idx;
            const evalData = turn.evaluation;

            return (
              <div
                key={turn.id}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedTurnIndex(isExpanded ? null : idx)}
                  className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 max-w-[80%]">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      Q{turn.questionNumber}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {turn.question}
                      </div>
                      {turn.isFollowUp && (
                        <span className="text-[10px] text-amber-700 font-bold">
                          Adaptive Follow-Up
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-extrabold text-slate-900">
                      {evalData?.score || 80}/100
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </button>

                {isExpanded && evalData && (
                  <div className="p-5 border-t border-slate-200 bg-white space-y-4 text-xs animate-fadeIn">
                    <div>
                      <strong className="text-slate-500 text-[11px] uppercase tracking-wider block mb-1 font-bold">
                        Candidate Answer
                      </strong>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-medium">
                        {turn.candidateAnswer || '(No answer recorded)'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                        <strong className="text-emerald-800 font-bold">Strengths:</strong>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {evalData.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                        <strong className="text-amber-800 font-bold">Actionable Tip:</strong>
                        <p className="text-slate-700">{evalData.actionableAdvice}</p>
                      </div>
                    </div>

                    {evalData.idealResponseSummary && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800">
                        <strong className="text-slate-800 block mb-1 font-bold">Top 1% Response Benchmark:</strong>
                        <p className="italic text-slate-600">{evalData.idealResponseSummary}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
