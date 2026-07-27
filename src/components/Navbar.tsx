import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import {
  Sparkles,
  Target,
  BrainCircuit,
  BookOpen,
  LayoutDashboard,
  Play,
  User,
  LogOut,
  ChevronDown,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onGoBack?: () => void;
  onOpenAuthModal: () => void;
  onStartNewInterview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onGoBack,
  onOpenAuthModal,
  onStartNewInterview
}) => {
  const { user, logout } = useAuth();
  const { weakSpots } = useInterview();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const activeWeakSpotsCount = weakSpots.filter((w) => w.status === 'active').length;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo & Nav Links */}
          <div className="flex items-center space-x-8 lg:space-x-12">
            {/* Logo & Brand & Back Button */}
            <div className="flex items-center space-x-3">
              {currentTab !== 'dashboard' && onGoBack && (
                <button
                  onClick={onGoBack}
                  title="Go back to recent page"
                  className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1.5 rounded-xl transition-all mr-1 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-800" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              <button
                onClick={() => setCurrentTab('dashboard')}
                className="flex items-center space-x-2.5 focus:outline-none group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    MockMate
                  </span>
                </div>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('target-profiles')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'target-profiles'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Target Roles</span>
            </button>

            <button
              onClick={() => setCurrentTab('memory')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors relative ${
                currentTab === 'memory'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Weak-Spot Memory</span>
              {activeWeakSpotsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  {activeWeakSpotsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('star-bank')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'star-bank'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>STAR Story Bank</span>
            </button>

            <button
              onClick={() => setCurrentTab('progress')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentTab === 'progress'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Progress & Analytics</span>
            </button>
          </nav>
        </div>

        {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onStartNewInterview}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Adaptive Mock</span>
            </button>

            {/* User Account / Auth */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 pl-1 pr-2 py-1 bg-slate-100 border border-slate-300 rounded-full hover:bg-slate-200/80 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-400"
                  />
                  <span className="text-xs font-semibold text-slate-800 hidden md:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center space-x-1.5 text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {showUserMenu && user && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
