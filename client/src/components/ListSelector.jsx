import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const EMOJI_OPTIONS = ['📋', '🛒', '🏠', '🐢', '🍳', '🧹', '💊', '📦', '🎁', '✈️'];

export default function ListSelector({ user, onSelectList }) {
  const [lists, setLists] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📋');

  const fetchLists = async () => {
    const { data } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setLists(data);
  };

  useEffect(() => {
    fetchLists();

    // Real-time subscription
    const channel = supabase
      .channel('lists-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, () => {
        fetchLists();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await supabase.from('lists').insert({ name: newName.trim(), emoji: newEmoji });
    setNewName('');
    setNewEmoji('📋');
    setShowNewForm(false);
  };

  const handleDelete = async (e, listId) => {
    e.stopPropagation();
    if (confirm('Delete this list and all its items?')) {
      await supabase.from('items').delete().eq('list_id', listId);
      await supabase.from('lists').delete().eq('id', listId);
    }
  };

  return (
    <div className="list-selector">
      <h2 className="section-title">Your Lists</h2>

      <div className="lists-grid">
        {lists.map((list) => (
          <div
            key={list.id}
            className="list-card"
            onClick={() => onSelectList(list)}
          >
            <span className="list-card-emoji">{list.emoji}</span>
            <span className="list-card-name">{list.name}</span>
            <button
              className="list-card-delete"
              onClick={(e) => handleDelete(e, list.id)}
              title="Delete list"
            >
              ×
            </button>
          </div>
        ))}

        <div
          className="list-card list-card-new"
          onClick={() => setShowNewForm(true)}
        >
          <span className="list-card-emoji">+</span>
          <span className="list-card-name">New List</span>
        </div>
      </div>

      {showNewForm && (
        <div className="modal-overlay" onClick={() => setShowNewForm(false)}>
          <form className="new-list-form" onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}>
            <h3>Create New List</h3>
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
              placeholder="List name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="new-list-input"
            />
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowNewForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-create">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
