import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  HelpCircle,
  Sliders
} from 'lucide-react';

interface WeakSpotMemoryViewProps {
  onStartTargetedInterview: () => void;
}

export const WeakSpotMemoryView: React.FC<WeakSpotMemoryViewProps> = ({
  onStartTargetedInterview
}) => {
  const { weakSpots, updateWeakSpotStatus } = useInterview();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'STAR Method', 'Communication', 'Technical', 'System Design'];

  const filteredWeakSpots = weakSpots.filter((w) => {
    if (filterCategory !== 'all' && w.category !== filterCategory) return false;
    return true;
  });

  const activeCount = weakSpots.filter((w) => w.status === 'active').length;
  const masteredCount = weakSpots.filter((w) => w.status === 'mastered').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            <span>Persistent Cross-Session Memory Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Weak-Spot Memory & Remedy Vault</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            MockMate keeps a persistent log of your recurring speech patterns, missing STAR quantitative metrics, and technical gaps. Interviewer personas use this memory to continuously cross-examine you until each weak spot is mastered.
          </p>
        </div>

        <button
          onClick={onStartTargetedInterview}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Targeted Practice ({activeCount} Active)</span>
        </button>
      </div>

      {/* Filter Tabs & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                filterCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <span className="text-amber-800 flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{activeCount} Active</span>
          </span>
          <span className="text-emerald-800 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{masteredCount} Mastered</span>
          </span>
        </div>
      </div>

      {/* Weak Spots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWeakSpots.map((ws) => {
          return (
            <div
              key={ws.id}
              className={`bg-white border rounded-2xl p-6 transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                ws.status === 'active'
                  ? 'border-amber-300 ring-1 ring-amber-300/30'
                  : ws.status === 'improving'
                  ? 'border-slate-400'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-bold uppercase">
                    {ws.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ws.status === 'active'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : ws.status === 'improving'
                        ? 'bg-slate-100 text-slate-800 border border-slate-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {ws.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{ws.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ws.description}</p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-slate-700" />
                    <span>Actionable Remedy Strategy:</span>
                  </div>
                  <p className="text-slate-800 text-[11px] leading-relaxed font-medium">{ws.remedyTip}</p>
                </div>
              </div>

              {/* Status Selector */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] font-medium">Detected {ws.occurrences}x</span>
                <select
                  value={ws.status}
                  onChange={(e) => updateWeakSpotStatus(ws.id, e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-semibold rounded-lg px-2 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="active">Active Focus</option>
                  <option value="improving">Improving</option>
                  <option value="mastered">Mark Mastered</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
