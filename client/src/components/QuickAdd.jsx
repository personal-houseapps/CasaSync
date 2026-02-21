import { useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';

export default function QuickAdd({ user, lists, onClose }) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [isDaily, setIsDaily] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    // Find selected list or fallback to General
    let listId = selectedListId;
    if (!listId) {
      const general = lists.find((l) => l.name === 'General' || l.name === 'Geral');
      if (general) {
        listId = general.id;
      } else if (lists.length > 0) {
        listId = lists[0].id;
      }
    }

    await supabase.from('items').insert({
      list_id: listId,
      text: text.trim(),
      added_by: user,
      is_daily: isDaily,
    });

    setText('');
    setSelectedListId('');
    setIsDaily(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="quick-add-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{t.addTask}</h3>

        <input
          type="text"
          placeholder={t.addNewItem}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          className="new-list-input"
        />

        <select
          className="list-select"
          value={selectedListId}
          onChange={(e) => setSelectedListId(e.target.value)}
        >
          <option value="">{t.selectList} ({t.general})</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.emoji} {list.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`daily-chip ${isDaily ? 'daily-chip-active' : ''}`}
          onClick={() => setIsDaily(!isDaily)}
        >
          🔄 {t.daily}
        </button>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            {t.cancel}
          </button>
          <button type="submit" className="btn-create">{t.add}</button>
        </div>
      </form>
    </div>
  );
}
