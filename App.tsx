import React, { useState, useCallback, useMemo } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { ActionMenu } from './components/ActionMenu';
import { LogModal } from './components/modals/LogModal';
import { CameraModal } from './components/modals/CameraModal';
import { Profile } from './components/Profile';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserProfile, LogEntry, LogType, ModalType } from './types';
import { I18nProvider, useI18n } from './contexts/I18nContext';

const AppContent: React.FC = () => {
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('logs', []);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { t } = useI18n();

  const handleOnboardingComplete = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, [setUserProfile]);

  const addLogEntry = useCallback((entry: Omit<LogEntry, 'id' | 'date'>) => {
    setLogs(prevLogs => [...prevLogs, { ...entry, id: Date.now(), date: new Date().toISOString().split('T')[0] }]);
    setActiveModal(null);
  }, [setLogs]);

  const handleProfileSave = useCallback((updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    setIsProfileOpen(false);
  }, [setUserProfile]);

  const handleResetApp = useCallback(() => {
    if (window.confirm(t('profile.resetConfirmationText'))) {
      setUserProfile(null);
      setLogs([]);
      localStorage.removeItem('dailyTip_en');
      localStorage.removeItem('dailyTip_tr');
      localStorage.removeItem('language');
      setIsProfileOpen(false);
    }
  }, [setUserProfile, setLogs, t]);

  if (!userProfile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-slate-950 font-sans relative">
      <Dashboard userProfile={userProfile} logs={logs} onOpenProfile={() => setIsProfileOpen(true)} />
      <ActionMenu onSelect={setActiveModal} />

      {activeModal && ['food', 'workout', 'weight'].includes(activeModal) && (
        <LogModal
          type={activeModal as LogType}
          onClose={() => setActiveModal(null)}
          onSave={addLogEntry}
          userProfile={userProfile}
        />
      )}
      
      {activeModal && ['aiAnalyzer', 'barcode'].includes(activeModal) && (
        <CameraModal
          mode={activeModal as 'aiAnalyzer' | 'barcode'}
          onClose={() => setActiveModal(null)}
          onLog={addLogEntry}
        />
      )}

      {isProfileOpen && (
        <Profile
          userProfile={userProfile}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleProfileSave}
          onReset={handleResetApp}
        />
      )}
    </div>
  );
};


const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App;