import { useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import EditListModal from './EditListModal';

const EMOJI_OPTIONS = ['📋', '🛒', '🏠', '🐢', '🍳', '🧹', '💊', '📦', '🎁', '✈️'];

export default function ListSelector({ lists, onSelectList, unreadCounts = {} }) {
  const { t } = useLanguage();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📋');
  const [editingList, setEditingList] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('lists').insert({ name: newName.trim(), emoji: newEmoji });
    setNewName('');
    setNewEmoji('📋');
    setShowNewForm(false);
  };

  const isGeneralList = (list) =>
    list.name === 'General' || list.name === 'Geral';

  const handleDelete = async (e, listId) => {
    e.stopPropagation();
    if (confirm(t.deleteListConfirm)) {
      await supabase.from('items').delete().eq('list_id', listId);
      await supabase.from('lists').delete().eq('id', listId);
    }
  };

  const handleEdit = (e, list) => {
    e.stopPropagation();
    setEditingList(list);
  };

  return (
    <div className="list-selector">
      <h2 className="section-title">{t.yourLists}</h2>

      <div className="lists-grid">
        {lists.map((list) => (
          <div
            key={list.id}
            className="list-card"
            onClick={() => onSelectList(list)}
          >
            {!isGeneralList(list) && (
              <div className="list-card-actions">
                <button
                  className="list-card-edit"
                  onClick={(e) => handleEdit(e, list)}
                  title={t.editList}
                >
                  ✏️
                </button>
                <button
                  className="list-card-delete"
                  onClick={(e) => handleDelete(e, list.id)}
                  title={t.delete}
                >
                  ×
                </button>
              </div>
            )}
            <div className="list-card-emoji-wrap">
              <span className="list-card-emoji">{list.emoji}</span>
              {unreadCounts[list.id] > 0 && (
                <span className="list-badge">{unreadCounts[list.id]}</span>
              )}
            </div>
            <span className="list-card-name">
              {isGeneralList(list) ? t.general : list.name}
            </span>
          </div>
        ))}

        <div
          className="list-card list-card-new"
          onClick={() => setShowNewForm(true)}
        >
          <span className="list-card-emoji">+</span>
          <span className="list-card-name">{t.newList}</span>
        </div>
      </div>

      {showNewForm && (
        <div className="modal-overlay" onClick={() => setShowNewForm(false)}>
          <form className="new-list-form" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h3>{t.createNewList}</h3>
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`emoji-option ${newEmoji === emoji ? 'emoji-selected' : ''}`}
                  onClick={() => setNewEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder={t.listName}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="new-list-input"
            />
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowNewForm(false)}>
                {t.cancel}
              </button>
              <button type="submit" className="btn-create">{t.create}</button>
            </div>
          </form>
        </div>
      )}

      {editingList && (
        <EditListModal list={editingList} onClose={() => setEditingList(null)} />
      )}
    </div>
  );
}
