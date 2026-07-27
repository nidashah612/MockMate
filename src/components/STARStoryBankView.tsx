import React, { useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { STARStory } from '../types';
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Tag,
  Zap,
  ChevronDown,
  X,
  ArrowLeft
} from 'lucide-react';

interface STARStoryBankViewProps {
  onBack?: () => void;
}

export const STARStoryBankView: React.FC<STARStoryBankViewProps> = ({ onBack }) => {
  const { starStories, addSTARStory, polishSTARStory, deleteSTARStory } = useInterview();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [polishingId, setPolishingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Performance Optimization');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');

  const categories = ['all', 'Performance Optimization', 'System Design', 'Leadership', 'Conflict Resolution', 'Technical Challenge'];

  const filteredStories = starStories.filter((st) => {
    const matchesCat = selectedCategory === 'all' || st.category === selectedCategory;
    const matchesSearch =
      st.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.result.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !situation || !action || !result) return;
    await addSTARStory({
      title,
      category,
      situation,
      task,
      action,
      result,
      metrics: [],
      tags: [category]
    });
    setShowAddModal(false);
    setTitle('');
    setSituation('');
    setTask('');
    setAction('');
    setResult('');
  };

  const handlePolish = async (id: string) => {
    setPolishingId(id);
    try {
      await polishSTARStory(id);
    } catch (e) {
      alert('Failed to polish story');
    } finally {
      setPolishingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3.5 py-2 rounded-xl transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-800" />
          <span>Back to Recent Page</span>
        </button>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Behavioral & Technical Experience Repository</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">STAR Story Bank</h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Auto-built from your mock interview responses. Each experience is framed into Situation, Task, Action, and Result (STAR) format with Gemini AI polishing to sharpen your quantitative impact metrics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom STAR Story</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stories by keyword, framework, or outcome..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* STAR Stories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px] font-bold uppercase">
                    {story.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-1">{story.title}</h3>
                </div>

                <div className="flex items-center space-x-1">
                  {story.isPolished && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>AI Polished</span>
                    </span>
                  )}
                  <button
                    onClick={() => deleteSTARStory(story.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* STAR Components Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 block mb-0.5 uppercase tracking-wider text-[10px]">
                    Situation & Task
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{story.situation} {story.task}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-700 block mb-0.5 uppercase tracking-wider text-[10px]">
                    Key Action Taken
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{story.action}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-emerald-700 block mb-0.5 uppercase tracking-wider text-[10px]">
                    Quantified Result & Impact
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">{story.result}</p>
                </div>
              </div>

              {/* Metrics Tags */}
              {story.metrics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {story.metrics.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                      ⚡ {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Polish Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">
                Created {new Date(story.createdAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => handlePolish(story.id)}
                disabled={polishingId === story.id}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-300 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{polishingId === story.id ? 'Polishing...' : 'Polish Story with Gemini'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Story Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New STAR Story</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Story Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Optimizing Payment Gateway Throughput"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Situation & Task</label>
                <textarea
                  required
                  rows={2}
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Describe the context and technical objective..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action</label>
                <textarea
                  required
                  rows={2}
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Specific engineering steps you took..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Result & Impact</label>
                <textarea
                  required
                  rows={2}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="Measurable outcomes (e.g. 40% latency drop, $50k saved)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-800"
                >
                  Save STAR Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
