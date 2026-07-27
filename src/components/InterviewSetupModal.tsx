import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { PersonaType, FocusArea } from '../types';
import {
  X,
  Play,
  Smile,
  Shield,
  Zap,
  Mic,
  MessageSquare,
  Sparkles,
  Target,
  BrainCircuit,
  Sliders
} from 'lucide-react';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: () => void;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession
}) => {
  const { targetProfiles, activeProfile, setActiveProfile, startNewInterview, weakSpots } = useInterview();
  const [persona, setPersona] = useState<PersonaType>('friendly');
  const [focusArea, setFocusArea] = useState<FocusArea>('hybrid');
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeWeakSpotsCount = weakSpots.filter((w) => w.status === 'active').length;

  const handleStart = async () => {
    if (!activeProfile) {
      setError('Please select or create a target role first.');
      return;
    }
    setError(null);
    setIsStarting(true);
    try {
      await startNewInterview({
        targetProfileId: activeProfile.id,
        persona,
        focusArea,
        isVoiceMode,
        totalQuestions
      });
      onStartSession();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Configure Adaptive Mock Interview</h2>
              <p className="text-xs text-slate-500">Tailored by Gemini using your Resume & Target Role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Target Profile Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Target Role Profile</span>
              <span className="text-slate-800 font-semibold lowercase">{targetProfiles.length} profiles saved</span>
            </label>
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => {
                const found = targetProfiles.find((p) => p.id === e.target.value);
                if (found) setActiveProfile(found);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
            >
              {targetProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.company})
                </option>
              ))}
            </select>
          </div>

          {/* Interviewer Persona Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Interviewer Persona
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPersona('friendly')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  persona === 'friendly'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs mb-1 text-emerald-800">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>Friendly Coach</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Supportive tone, gives helpful hints when you get stuck, ideal for warm-up rounds.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPersona('neutral')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  persona === 'neutral'
                    ? 'bg-slate-100 border-slate-800 ring-2 ring-slate-800/20 text-slate-900'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs mb-1 text-slate-800">
                  <Shield className="w-4 h-4 text-slate-700" />
                  <span>Neutral Recruiter</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Standard corporate recruiter pace, structured questioning without immediate hints.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPersona('stress_test')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  persona === 'stress_test'
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-900'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-xs mb-1 text-rose-800">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>Stress-Test Manager</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Direct & rigorous. Pushes back on vague claims, tests edge cases & architecture trade-offs.
                </p>
              </button>
            </div>
          </div>

          {/* Focus Area Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Focus & Interview Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'hybrid', label: 'Hybrid / Complete', desc: 'Mix of tech & behavioral' },
                { id: 'technical', label: 'Technical Deep-Dive', desc: 'Code architecture & trade-offs' },
                { id: 'behavioral_star', label: 'Behavioral STAR', desc: 'Leadership & situation stories' },
                { id: 'system_design', label: 'System Architecture', desc: 'Scalability & API design' },
                { id: 'culture', label: 'Culture & Fit', desc: 'Values & cross-functional work' }
              ].map((f) => (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFocusArea(f.id as FocusArea)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    focusArea === f.id
                      ? 'bg-slate-100 border-slate-800 text-slate-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900">{f.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Mode Toggle & Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Interaction Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoiceMode(true)}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    isVoiceMode
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice + Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceMode(false)}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    !isVoiceMode
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Text Only</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Question Length
              </label>
              <div className="flex space-x-2">
                {[3, 5, 7].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setTotalQuestions(num)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      totalQuestions === num
                        ? 'bg-slate-100 border-slate-800 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Memory Engine Active Notice */}
          {activeWeakSpotsCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 font-medium">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Weak-Spot Memory Active:</strong> Interviewer will target your {activeWeakSpotsCount} known weak areas for adaptive practice.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isStarting ? 'Generating Adaptive Interview...' : 'Begin Interview Session'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
