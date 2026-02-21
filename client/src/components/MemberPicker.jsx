import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';
import { getLightColor } from '../utils/colors';

export default function MemberPicker() {
  const { members, setActiveMember, signOut } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [selectedMember, setSelectedMember] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleMemberClick = (m) => {
    if (m.pin) {
      setSelectedMember(m);
      setPinInput('');
      setPinError(false);
    } else {
      setActiveMember(m);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === selectedMember.pin) {
      setActiveMember(selectedMember);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  if (selectedMember) {
    return (
      <div className="name-select">
        <div className="name-select-content">
          <div
            className="member-avatar-large"
            style={{ background: selectedMember.color, color: 'white' }}
          >
            {selectedMember.display_name[0].toUpperCase()}
          </div>
          <h2 className="member-picker-name">{selectedMember.display_name}</h2>

          <form className="pin-form" onSubmit={handlePinSubmit}>
            <input
              type="password"
              className="pin-input"
              placeholder={t.enterPin}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
              autoFocus
            />
            {pinError && <p className="auth-error">{t.wrongPin}</p>}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setSelectedMember(null)}>
                {t.back}
              </button>
              <button type="submit" className="btn-create">{t.confirm}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="name-select">
      <div className="name-select-content">
        <h1 className="name-select-title">CasaSync</h1>
        <p className="name-select-subtitle">{t.whoAreYou}</p>

        <div className="member-picker-grid">
          {members.map((m) => (
            <button
              key={m.id}
              className="member-picker-btn"
              onClick={() => handleMemberClick(m)}
            >
              <div
                className="member-avatar"
                style={{ background: m.color, color: 'white' }}
              >
                {m.display_name[0].toUpperCase()}
              </div>
              <span className="member-picker-label">{m.display_name}</span>
              {m.pin && <span className="pin-indicator">🔒</span>}
            </button>
          ))}
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
