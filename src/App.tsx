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

const MainAppContent: React.FC = () => {
  const { activeSession, setActiveSession } = useInterview();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isViewingReport, setIsViewingReport] = useState(false);

  const handleStartNewInterview = () => {
    setIsSetupModalOpen(true);
  };

  const handleSessionStarted = () => {
    setIsViewingReport(false);
  };

  const handleFinishSession = () => {
    setIsViewingReport(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-800 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setIsViewingReport(false);
        }}
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
              setCurrentTab('dashboard');
            }}
            onStartNewSession={handleStartNewInterview}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                onStartNewInterview={handleStartNewInterview}
                onNavigateTab={setCurrentTab}
                onViewReport={() => setIsViewingReport(true)}
              />
            )}

            {currentTab === 'target-profiles' && <TargetProfileManager />}

            {currentTab === 'memory' && (
              <WeakSpotMemoryView onStartTargetedInterview={handleStartNewInterview} />
            )}

            {currentTab === 'star-bank' && <STARStoryBankView />}
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
            <button onClick={() => setCurrentTab('target-profiles')} className="hover:text-slate-900 font-medium">
              Target Roles
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('memory')} className="hover:text-slate-900 font-medium">
              Weak Spots Memory
            </button>
            <span>•</span>
            <button onClick={() => setCurrentTab('star-bank')} className="hover:text-slate-900 font-medium">
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
