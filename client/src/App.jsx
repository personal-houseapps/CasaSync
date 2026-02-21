import { useState } from 'react';
import { useLanguage } from './i18n';
import NameSelect from './components/NameSelect';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('casasync-user'));
  const [selectedList, setSelectedList] = useState(null);
  const { t, lang, toggleLanguage } = useLanguage();

  const handleSelectUser = (name) => {
    localStorage.setItem('casasync-user', name);
    setUser(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('casasync-user');
    setUser(null);
    setSelectedList(null);
  };

  if (!user) {
    return <NameSelect onSelect={handleSelectUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          {selectedList && (
            <button className="back-btn" onClick={() => setSelectedList(null)}>
              {t.back}
            </button>
          )}
        </div>
        <h1 className="app-title">CasaSync</h1>
        <div className="header-right">
          <button className="lang-btn" onClick={toggleLanguage} title="Switch language">
            {lang === 'en' ? 'PT' : 'EN'}
          </button>
          <span className={`user-badge ${user === 'Filipa' ? 'user-filipa' : 'user-rafael'}`}>
            {user}
          </span>
          <button className="logout-btn" onClick={handleLogout}>{t.switchUser}</button>
        </div>
      </header>

      <main className="app-main">
        {selectedList ? (
          <TaskList list={selectedList} user={user} onBack={() => setSelectedList(null)} />
        ) : (
          <Dashboard user={user} onSelectList={setSelectedList} />
        )}
      </main>
    </div>
  );
}
