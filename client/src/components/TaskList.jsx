import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import TaskItem from './TaskItem';

export default function TaskList({ list, user }) {
  const [items, setItems] = useState([]);
  const [newText, setNewText] = useState('');

  const fetchItems = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', list.id)
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  useEffect(() => {
    fetchItems();

    // Real-time subscription for this list's items
    const channel = supabase
      .channel(`items-list-${list.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items',
        filter: `list_id=eq.${list.id}`,
      }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await supabase.from('items').insert({
      list_id: list.id,
      text: newText.trim(),
      added_by: user,
    });
    setNewText('');
  };

  const handleToggle = async (itemId, currentlyCompleted) => {
    if (currentlyCompleted) {
      await supabase.from('items').update({
        completed: false,
        completed_by: null,
        completed_at: null,
      }).eq('id', itemId);
    } else {
      await supabase.from('items').update({
        completed: true,
        completed_by: user,
        completed_at: new Date().toISOString(),
      }).eq('id', itemId);
    }
  };

  const handleDelete = async (itemId) => {
    await supabase.from('items').delete().eq('id', itemId);
  };

  const handleClearCompleted = async () => {
    await supabase.from('items').delete().eq('list_id', list.id).eq('completed', true);
  };

  const pendingCount = items.filter((i) => !i.completed).length;
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2 className="section-title">
          {list.emoji} {list.name}
        </h2>
        <span className="task-count">
          {pendingCount} pending{completedCount > 0 && ` · ${completedCount} done`}
        </span>
      </div>

      <form className="add-item-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Add new item..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          className="add-item-input"
          autoFocus
        />
        <button type="submit" className="add-item-btn">Add</button>
      </form>

      <div className="items-list">
        {items.length === 0 ? (
          <p className="empty-state">No items yet. Add something!</p>
        ) : (
          items.map((item) => (
            <TaskItem
              key={item.id}
              item={item}
              user={user}
              onToggle={() => handleToggle(item.id, item.completed)}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        )}
      </div>

      {completedCount > 0 && (
        <button className="clear-completed-btn" onClick={handleClearCompleted}>
          Clear {completedCount} completed item{completedCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
