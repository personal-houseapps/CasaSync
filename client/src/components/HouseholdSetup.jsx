import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';
import ColorPicker from './ColorPicker';

export default function HouseholdSetup() {
  const { createHousehold, joinHousehold, signOut } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [mode, setMode] = useState(null); // null, 'create', 'join'
  const [householdName, setHouseholdName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState('#e91e8c');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!householdName.trim() || !displayName.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await createHousehold(householdName.trim(), displayName.trim(), color);
    if (err) setError(err.message || t.authError);
    setLoading(false);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || !displayName.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await joinHousehold(joinCode.trim(), displayName.trim(), color);
    if (err) setError(t.invalidCode);
    setLoading(false);
  };

  if (!mode) {
    return (
      <div className="name-select">
        <div className="name-select-content">
          <h1 className="name-select-title">CasaSync</h1>
          <p className="name-select-subtitle">{t.householdSetupSubtitle}</p>

          <div className="name-select-buttons">
            <button className="name-btn" onClick={() => setMode('create')}>
              <span className="name-btn-emoji">🏠</span>
              <span className="name-btn-name">{t.createHousehold}</span>
            </button>
            <button className="name-btn" onClick={() => setMode('join')}>
              <span className="name-btn-emoji">🔑</span>
              <span className="name-btn-name">{t.joinHousehold}</span>
            </button>
          </div>

          <div className="household-footer">
            <button className="lang-btn-login" onClick={toggleLanguage}>
              {lang === 'en' ? '🌐 Português' : '🌐 English'}
            </button>
            <button className="btn-cancel" onClick={signOut}>{t.logOut}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="name-select">
      <div className="name-select-content">
        <h1 className="name-select-title">CasaSync</h1>

        <form className="auth-form" onSubmit={mode === 'create' ? handleCreate : handleJoin}>
          <h3 className="auth-form-title">
            {mode === 'create' ? t.createHousehold : t.joinHousehold}
          </h3>

          {mode === 'create' && (
            <input
              type="text"
              className="auth-input"
              placeholder={t.householdName}
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              required
              autoFocus
            />
          )}

          {mode === 'join' && (
            <input
              type="text"
              className="auth-input"
              placeholder={t.enterJoinCode}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              autoFocus
            />
          )}

          <input
            type="text"
            className="auth-input"
            placeholder={t.displayName}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <p className="color-picker-label">{t.pickColor}</p>
          <ColorPicker selected={color} onSelect={setColor} />

          {error && <p className="auth-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => { setMode(null); setError(''); }}>
              {t.back}
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {mode === 'create' ? t.create : t.join}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
