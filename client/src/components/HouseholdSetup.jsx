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
      <div className="household-screen">
        <div className="household-card">
          <h1>CasaSync</h1>
          <p className="household-subtitle">{t.householdSetupSubtitle}</p>

          <div className="household-choice">
            <button className="household-choice-btn" onClick={() => setMode('create')}>
              🏠 {t.createHousehold}
            </button>
            <button className="household-choice-btn" onClick={() => setMode('join')}>
              🔑 {t.joinHousehold}
            </button>
          </div>

          <div className="household-footer">
            <button className="lang-btn-login" onClick={toggleLanguage}>
              {lang === 'en' ? '🌐 Portugues' : '🌐 English'}
            </button>
            <button className="btn-cancel" onClick={signOut} style={{ marginLeft: 8 }}>{t.logOut}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="household-screen">
      <div className="household-card">
        <h1>CasaSync</h1>

        <form className="household-form" onSubmit={mode === 'create' ? handleCreate : handleJoin}>
          <h3 style={{ textAlign: 'center', marginBottom: 8 }}>
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

          <label>{t.pickColor}</label>
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
