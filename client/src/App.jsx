import { useState } from 'react';
import NameSelect from './components/NameSelect';
import ListSelector from './components/ListSelector';
import TaskList from './components/TaskList';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('casasync-user'));
  const [selectedList, setSelectedList] = useState(null);

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
              ← Back
            </button>
          )}
        </div>
        <h1 className="app-title">CasaSync</h1>
        <div className="header-right">
          <span className={`user-badge ${user === 'Filipa' ? 'user-filipa' : 'user-rafael'}`}>
            {user}
          </span>
          <button className="logout-btn" onClick={handleLogout}>Switch</button>
        </div>
      </header>

      <main className="app-main">
        {selectedList ? (
          <TaskList list={selectedList} user={user} onBack={() => setSelectedList(null)} />
        ) : (
          <ListSelector user={user} onSelectList={setSelectedList} />
        )}
      </main>
    </div>
  );
}
