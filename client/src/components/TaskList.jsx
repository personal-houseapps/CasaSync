import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import { getLightColor } from '../utils/colors';
import TaskItem from './TaskItem';

export default function TaskList({ list, member, members, onBack }) {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [newText, setNewText] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newDueAt, setNewDueAt] = useState('');
  const [assignedIds, setAssignedIds] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchItems = async () => {
    const { data } = await supabase
      .from('items')
      .select('*, item_assignments(member_id)')
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

    const assignChannel = supabase
      .channel(`assignments-list-${list.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'item_assignments',
      }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(assignChannel);
    };
  }, [list.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    const newItem = {
      list_id: list.id,
      text: newText.trim(),
      added_by: member.display_name,
      added_by_member_id: member.id,
    };
    if (isDaily) newItem.is_daily = true;
    if (newDescription.trim()) newItem.description = newDescription.trim();
    if (newDueAt) newItem.due_at = new Date(newDueAt).toISOString();

    const { data } = await supabase.from('items').insert(newItem).select();

    if (data && data[0] && assignedIds.length > 0) {
      const assignments = assignedIds.map((mid) => ({
        item_id: data[0].id,
        member_id: mid,
      }));
      await supabase.from('item_assignments').insert(assignments);
    }

    setNewText('');
    setIsDaily(false);
    setNewDescription('');
    setNewDueAt('');
    setAssignedIds([]);
  };

  const toggleAssign = (memberId) => {
    setAssignedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleToggle = async (itemId, currentlyCompleted) => {
    if (currentlyCompleted) {
      await supabase.from('items').update({
        completed: false,
        completed_by: null,
        completed_by_member_id: null,
        completed_at: null,
      }).eq('id', itemId);
    } else {
      await supabase.from('items').update({
        completed: true,
        completed_by: member.display_name,
        completed_by_member_id: member.id,
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

  const handleUnassign = async (itemId, memberId) => {
    await supabase.from('item_assignments').delete()
      .eq('item_id', itemId)
      .eq('member_id', memberId);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'mine') {
      const a = item.item_assignments || [];
      return a.some((x) => x.member_id === member.id);
    }
    const a = item.item_assignments || [];
    return a.some((x) => x.member_id === filter);
  });

  const pendingCount = filteredItems.filter((i) => !i.completed).length;
  const completedCount = filteredItems.filter((i) => i.completed).length;

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

      {/* Filter tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.filterAll}
        </button>
        <button
          className={`filter-tab ${filter === 'mine' ? 'filter-tab-active' : ''}`}
          onClick={() => setFilter('mine')}
        >
          {t.filterMine}
        </button>
        {members.map((m) => (
          <button
            key={m.id}
            className={`filter-tab ${filter === m.id ? 'filter-tab-active' : ''}`}
            style={filter === m.id ? { background: getLightColor(m.color), color: m.color, borderColor: m.color } : {}}
            onClick={() => setFilter(filter === m.id ? 'all' : m.id)}
          >
            {m.display_name}
          </button>
        ))}
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

        <div className="add-options-row">
          <button
            type="button"
            className={`daily-chip ${isDaily ? 'daily-chip-active' : ''}`}
            onClick={() => setIsDaily(!isDaily)}
          >
            🔄 {t.daily}
          </button>
        </div>

        {/* Assignment chips */}
        <div className="assign-row">
          <span className="assign-label">{t.assignTo}</span>
          <div className="assign-chips">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`assign-chip ${assignedIds.includes(m.id) ? 'assign-chip-active' : ''}`}
                style={assignedIds.includes(m.id) ? { background: getLightColor(m.color), color: m.color, borderColor: m.color } : {}}
                onClick={() => toggleAssign(m.id)}
              >
                <span className="assign-chip-dot" style={{ background: m.color }} />
                {m.display_name}
              </button>
            ))}
          </div>
        </div>

        {/* Description & Due time */}
        <div className="add-extras">
          <textarea
            className="add-description"
            placeholder={t.description}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
          />
          <input
            type="datetime-local"
            className="add-due-input"
            value={newDueAt}
            onChange={(e) => setNewDueAt(e.target.value)}
          />
        </div>
      </form>

      <div className="items-list">
        {filteredItems.length === 0 ? (
          <p className="empty-state">{t.noItems}</p>
        ) : (
          filteredItems.map((item) => (
            <TaskItem
              key={item.id}
              item={item}
              member={member}
              members={members}
              onToggle={() => handleToggle(item.id, item.completed)}
              onDelete={() => handleDelete(item.id)}
              onUnassign={(memberId) => handleUnassign(item.id, memberId)}
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
