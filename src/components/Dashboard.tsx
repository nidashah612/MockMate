import React from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  BrainCircuit,
  Target,
  BookOpen,
  Play,
  TrendingUp,
  ArrowRight,
  Zap,
  Sparkles,
  Award
} from 'lucide-react';

interface DashboardProps {
  onStartNewInterview: () => void;
  onNavigateTab: (tab: string) => void;
  onViewReport: (sessionId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartNewInterview,
  onNavigateTab,
}) => {
  const { activeProfile } = useInterview();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Welcome & Active Role Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-slate-700" />
            <span>AI Mock Interviewer & Memory Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready for your next adaptive mock?
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            MockMate analyzes your speech pattern, STAR responses, and technical depth in real-time, cross-examining you based on your target role's job description.
          </p>

          {activeProfile ? (
            <div className="pt-2 flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Current Target Role:</span>
              <span className="font-semibold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl">
                {activeProfile.title} ({activeProfile.company})
              </span>
            </div>
          ) : (
            <div className="pt-2 text-xs text-amber-700 font-medium">
              ⚠️ No active target role selected. Click 'Target Roles' to configure a job description and resume.
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
            <Play className="w-4 h-4 fill-current text-emerald-400" />
            <span>Start Adaptive Mock</span>
          </button>
        </div>
      </div>

      {/* Feature Navigation Cards (Clean Launchpad layout without progress metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Target Roles</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure job descriptions and resumes to tailor AI cross-examination for specific companies.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('target-profiles')}
            className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center space-x-1.5 pt-2 border-t border-slate-100"
          >
            <span>Manage Target Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <BrainCircuit className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Weak Spots Memory</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review memory logs of recurring technical gaps and filler word triggers logged from past sessions.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('memory')}
            className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center space-x-1.5 pt-2 border-t border-slate-100"
          >
            <span>Open Memory Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <BookOpen className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">STAR Story Bank</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Craft, refine, and polish behavioral stories using Situation, Task, Action, and Result frameworks.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('star-bank')}
            className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center space-x-1.5 pt-2 border-t border-slate-100"
          >
            <span>Open STAR Story Bank</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Progress & Analytics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View your complete candidate progress scores, skill radar, performance trends, and session logs.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('progress')}
            className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center space-x-1.5 pt-2 border-t border-slate-100"
          >
            <span>View Progress & Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
