import { useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import { getLightColor } from '../utils/colors';

export default function QuickAdd({ member, members, lists, onClose }) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [assignedIds, setAssignedIds] = useState([]);

  const toggleAssign = (memberId) => {
    setAssignedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    let listId = selectedListId;
    if (!listId) {
      const general = lists.find((l) => l.name === 'General' || l.name === 'Geral');
      if (general) {
        listId = general.id;
      } else if (lists.length > 0) {
        listId = lists[0].id;
      }
    }

    const newItem = {
      list_id: listId,
      text: text.trim(),
      added_by: member.display_name,
      added_by_member_id: member.id,
    };
    if (isDaily) newItem.is_daily = true;
    if (description.trim()) newItem.description = description.trim();
    if (dueAt) newItem.due_at = new Date(dueAt).toISOString();

    const { data } = await supabase.from('items').insert(newItem).select();

    if (data && data[0] && assignedIds.length > 0) {
      const assignments = assignedIds.map((mid) => ({
        item_id: data[0].id,
        member_id: mid,
      }));
      await supabase.from('item_assignments').insert(assignments);
    }

    setText('');
    setSelectedListId('');
    setIsDaily(false);
    setDescription('');
    setDueAt('');
    setAssignedIds([]);
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

        <textarea
          className="add-description"
          placeholder={t.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
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

        <input
          type="datetime-local"
          className="add-due-input"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />

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
