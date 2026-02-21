import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import TaskItem from './TaskItem';

export default function TaskList({ list, user }) {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [newText, setNewText] = useState('');
  const [isDaily, setIsDaily] = useState(false);

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

    const channel = supabase
      .channel(`items-list-${list.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items',
      }, (payload) => {
        if (
          payload.eventType === 'DELETE' ||
          payload.new?.list_id === list.id ||
          payload.old?.list_id === list.id
        ) {
          fetchItems();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newItem = {
      list_id: list.id,
      text: newText.trim(),
      added_by: user,
    };
    if (isDaily) newItem.is_daily = true;

    await supabase.from('items').insert(newItem);
    setNewText('');
    setIsDaily(false);
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
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await supabase.from('items').delete().eq('id', itemId);
  };

  const handleClearCompleted = async () => {
    setItems((prev) => prev.filter((i) => !i.completed));
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
          {t.pending(pendingCount)}{completedCount > 0 && ` · ${t.done(completedCount)}`}
        </span>
      </div>

      <form className="add-item-form" onSubmit={handleAdd}>
        <div className="add-item-row">
          <input
            type="text"
            placeholder={t.addNewItem}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="add-item-input"
            autoFocus
          />
          <button type="submit" className="add-item-btn">{t.add}</button>
        </div>
        <button
          type="button"
          className={`daily-chip ${isDaily ? 'daily-chip-active' : ''}`}
          onClick={() => setIsDaily(!isDaily)}
        >
          🔄 {t.daily}
        </button>
      </form>

      <div className="items-list">
        {items.length === 0 ? (
          <p className="empty-state">{t.noItems}</p>
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
          {t.clearCompleted(completedCount)}
        </button>
      )}
    </div>
  );
}
