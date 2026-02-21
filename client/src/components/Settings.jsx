import { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n';
import { getLightColor } from '../utils/colors';
import ColorPicker from './ColorPicker';

export default function Settings({ onClose }) {
  const { member, household, members, signOut, refreshMembers } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(member?.display_name || '');
  const [editColor, setEditColor] = useState(member?.color || '#2196f3');
  const [editPin, setEditPin] = useState(member?.pin || '');
  const [showPinSetup, setShowPinSetup] = useState(false);

  const handleCopyCode = async () => {
    if (household?.join_code) {
      await navigator.clipboard.writeText(household.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (confirm(t.removeMemberConfirm)) {
      await supabase.from('members').delete().eq('id', memberId);
      refreshMembers();
    }
  };

  const handleSaveProfile = async () => {
    const updates = { display_name: editName.trim(), color: editColor };
    await supabase.from('members').update(updates).eq('id', member.id);
    setEditingProfile(false);
    refreshMembers();
  };

  const handleSavePin = async () => {
    const pinValue = editPin.trim() || null;
    await supabase.from('members').update({ pin: pinValue }).eq('id', member.id);
    setShowPinSetup(false);
    refreshMembers();
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <h2 className="section-title">{t.settings}</h2>
        <button className="back-btn" onClick={onClose}>{t.back}</button>
      </div>

      {/* Household Info */}
      <div className="settings-card">
        <h3>{household?.name}</h3>
        <div className="join-code-row">
          <span className="join-code-label">{t.shareCode}</span>
          <div className="join-code-display">
            <code className="join-code-value">{household?.join_code}</code>
            <button className="btn-copy" onClick={handleCopyCode}>
              {copied ? t.codeCopied : t.copyCode}
            </button>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="settings-card">
        <h3>{t.members}</h3>
        <div className="member-list">
          {members.map((m) => (
            <div key={m.id} className="member-row">
              <div
                className="member-dot"
                style={{ background: m.color }}
              />
              <span className="member-name">{m.display_name}</span>
              {m.is_owner && <span className="owner-badge">{t.owner}</span>}
              {m.id === member.id && <span className="you-badge">({t.you})</span>}
              {member.is_owner && m.id !== member.id && (
                <button
                  className="btn-remove-member"
                  onClick={() => handleRemoveMember(m.id)}
                >
                  {t.removeMember}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile */}
      <div className="settings-card">
        <h3>{t.editProfile}</h3>
        {editingProfile ? (
          <div className="edit-profile-form">
            <input
              type="text"
              className="auth-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t.displayName}
            />
            <ColorPicker selected={editColor} onSelect={setEditColor} />
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setEditingProfile(false)}>{t.cancel}</button>
              <button className="btn-create" onClick={handleSaveProfile}>{t.save}</button>
            </div>
          </div>
        ) : (
          <button className="btn-edit-profile" onClick={() => setEditingProfile(true)}>
            <div className="member-dot" style={{ background: member.color }} />
            {member.display_name} — {t.editProfile}
          </button>
        )}
      </div>

      {/* PIN Setup */}
      <div className="settings-card">
        <h3>{t.pinSetup}</h3>
        <p className="settings-description">{t.pinDescription}</p>
        {showPinSetup ? (
          <div className="edit-profile-form">
            <input
              type="text"
              className="pin-input"
              value={editPin}
              onChange={(e) => setEditPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder={t.enterPin}
              inputMode="numeric"
              maxLength={4}
            />
            <p className="settings-hint">{t.pinHint}</p>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setShowPinSetup(false)}>{t.cancel}</button>
              <button className="btn-create" onClick={handleSavePin}>{t.save}</button>
            </div>
          </div>
        ) : (
          <button className="btn-edit-profile" onClick={() => { setEditPin(member.pin || ''); setShowPinSetup(true); }}>
            {member.pin ? `🔒 ${t.changePin}` : `🔓 ${t.setPin}`}
          </button>
        )}
      </div>

      {/* Log Out */}
      <button className="btn-logout" onClick={handleLogout}>
        {t.logOut}
      </button>
    </div>
  );
}
