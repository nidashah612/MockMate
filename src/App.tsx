import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider, useInterview } from './context/InterviewContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { TargetProfileManager } from './components/TargetProfileManager';
import { InterviewSetupModal } from './components/InterviewSetupModal';
import { InterviewRoom } from './components/InterviewRoom';
import { SessionReportCard } from './components/SessionReportCard';
import { Dashboard } from './components/Dashboard';
import { WeakSpotMemoryView } from './components/WeakSpotMemoryView';
import { STARStoryBankView } from './components/STARStoryBankView';
import { ProgressAnalyticsView } from './components/ProgressAnalyticsView';

const MainAppContent: React.FC = () => {
  const { activeSession, setActiveSession } = useInterview();
  const [tabHistory, setTabHistory] = useState<string[]>(['dashboard']);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);

  const currentTab = tabHistory[tabHistory.length - 1] || 'dashboard';

  const handleNavigateTab = (newTab: string) => {
    setIsViewingReport(false);
    if (activeSession && activeSession.status === 'in_progress') {
      setActiveSession({
        ...activeSession,
        status: 'completed'
      });
    }
    if (newTab === currentTab) return;
    setTabHistory((prev) => [...prev, newTab]);
  };

  const handleGoBack = () => {
    if (isViewingReport) {
      setIsViewingReport(false);
      return;
    }
    if (activeSession && activeSession.status === 'in_progress') {
      setActiveSession({
        ...activeSession,
        status: 'completed'
      });
    }
    if (tabHistory.length > 1) {
      setTabHistory((prev) => prev.slice(0, -1));
    } else {
      setTabHistory(['dashboard']);
    }
  };

  const handleStartNewInterview = () => {
    setIsSetupModalOpen(true);
  };

  const handleSessionStarted = () => {
    setIsViewingReport(false);
  };

  const handleFinishSession = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        status: 'completed'
      });
    }
    setIsViewingReport(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-800 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigateTab}
        onGoBack={handleGoBack}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onStartNewInterview={handleStartNewInterview}
      />

      <main className="flex-1 pb-16">
        {/* Active Session View */}
        {activeSession && activeSession.status === 'in_progress' && !isViewingReport ? (
          <InterviewRoom onFinishSession={handleFinishSession} />
        ) : isViewingReport && activeSession ? (
          <SessionReportCard
            onBackToDashboard={() => {
              setIsViewingReport(false);
              handleNavigateTab('dashboard');
            }}
            onStartNewSession={handleStartNewInterview}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                onStartNewInterview={handleStartNewInterview}
                onNavigateTab={handleNavigateTab}
                onViewReport={() => setIsViewingReport(true)}
              />
            )}

            {currentTab === 'target-profiles' && (
              <TargetProfileManager
                onBack={handleGoBack}
                onStartInterview={handleStartNewInterview}
              />
            )}

            {currentTab === 'memory' && (
              <WeakSpotMemoryView
                onBack={handleGoBack}
                onStartTargetedInterview={handleStartNewInterview}
              />
            )}

            {currentTab === 'star-bank' && (
              <STARStoryBankView onBack={handleGoBack} />
            )}

            {currentTab === 'progress' && (
              <ProgressAnalyticsView
                onBack={handleGoBack}
                onStartNewInterview={handleStartNewInterview}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-slate-500 text-xs text-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-800">MockMate</strong> — AI Adaptive Mock Interviewer & Persistent Memory Coach
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => handleNavigateTab('progress')} className="hover:text-slate-900 font-medium">
              Progress & Analytics
            </button>
            <span>•</span>
            <button onClick={() => handleNavigateTab('target-profiles')} className="hover:text-slate-900 font-medium">
              Target Roles
            </button>
            <span>•</span>
            <button onClick={() => handleNavigateTab('memory')} className="hover:text-slate-900 font-medium">
              Weak Spots Memory
            </button>
            <span>•</span>
            <button onClick={() => handleNavigateTab('star-bank')} className="hover:text-slate-900 font-medium">
              STAR Story Bank
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <InterviewSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onStartSession={handleSessionStarted}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <MainAppContent />
      </InterviewProvider>
    </AuthProvider>
  );
}
