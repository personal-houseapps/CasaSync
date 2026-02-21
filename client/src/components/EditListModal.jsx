import { useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';

const EMOJI_OPTIONS = ['📋', '🛒', '🏠', '🐢', '🍳', '🧹', '💊', '📦', '🎁', '✈️', '📌'];

export default function EditListModal({ list, onClose }) {
  const { t } = useLanguage();
  const [name, setName] = useState(list.name);
  const [emoji, setEmoji] = useState(list.emoji);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from('lists').update({ name: name.trim(), emoji }).eq('id', list.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="new-list-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
        <h3>{t.editList}</h3>
        <div className="emoji-picker">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-option ${emoji === e ? 'emoji-selected' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={t.listName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="new-list-input"
        />
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            {t.cancel}
          </button>
          <button type="submit" className="btn-create">{t.save}</button>
        </div>
      </form>
    </div>
  );
}
