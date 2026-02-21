import { useState } from 'react';
import { useLanguage } from './i18n';
import { useAuth } from './contexts/AuthContext';
import { getLightColor } from './utils/colors';
import AuthScreen from './components/AuthScreen';
import HouseholdSetup from './components/HouseholdSetup';
import MemberPicker from './components/MemberPicker';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import Settings from './components/Settings';

export default function App() {
  const { session, member, household, members, loading } = useAuth();
  const [selectedList, setSelectedList] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const { t, lang, toggleLanguage } = useLanguage();

  if (loading) {
    return (
      <div className="loading-screen">
        <h1 className="name-select-title">CasaSync</h1>
      </div>
    );
  }

  // Not logged in
  if (!session) return <AuthScreen />;

  // Logged in but no household
  if (!household) return <HouseholdSetup />;

  // Logged in + household but no active member selected (Disney+ style picker)
  if (!member) return <MemberPicker />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          {(selectedList || showSettings) && (
            <button className="back-btn" onClick={() => { setSelectedList(null); setShowSettings(false); }}>
              {t.back}
            </button>
          )}
        </div>
        <h1 className="app-title">CasaSync</h1>
        <div className="header-right">
          <button className="lang-btn" onClick={toggleLanguage} title="Switch language">
            {lang === 'en' ? 'PT' : 'EN'}
          </button>
          <span
            className="user-badge"
            style={{ background: getLightColor(member.color), color: member.color }}
          >
            {member.display_name}
          </span>
          <button className="settings-btn" onClick={() => { setShowSettings(true); setSelectedList(null); }}>
            ⚙️
          </button>
        </div>
      </header>

      <main className="app-main">
        {showSettings ? (
          <Settings onClose={() => setShowSettings(false)} />
        ) : selectedList ? (
          <TaskList list={selectedList} member={member} members={members} onBack={() => setSelectedList(null)} />
        ) : (
          <Dashboard member={member} members={members} onSelectList={setSelectedList} />
        )}
      </main>
    </div>
  );
}
