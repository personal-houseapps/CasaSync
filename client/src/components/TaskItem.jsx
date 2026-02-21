import { useLanguage } from '../i18n';
import { getLightColor } from '../utils/colors';

export default function TaskItem({ item, member, members, onToggle, onDelete, onUnassign }) {
  const { t, lang } = useLanguage();

  const getAuthorColor = () => {
    if (item.added_by_member_id) {
      const m = members.find((mem) => mem.id === item.added_by_member_id);
      return m?.color || '#6b7280';
    }
    const m = members.find((mem) => mem.display_name === item.added_by);
    return m?.color || '#6b7280';
  };

  const authorColor = getAuthorColor();

  const canDelete = item.added_by_member_id
    ? member.id === item.added_by_member_id
    : member.display_name === item.added_by;

  const assignments = item.item_assignments || [];

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return time;
    }
    const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
    const dateStr2 = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    return `${dateStr2} ${time}`;
  };

  const formatDue = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now && !item.completed;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let label;
    if (date.toDateString() === today.toDateString()) {
      label = time;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      const tmrw = lang === 'pt' ? 'Amanha' : 'Tomorrow';
      label = `${tmrw} ${time}`;
    } else {
      const locale = lang === 'pt' ? 'pt-PT' : 'en-GB';
      const dateStr2 = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
      label = `${dateStr2} ${time}`;
    }

    return { label, isOverdue };
  };

  const dueInfo = formatDue(item.due_at);

  return (
    <div className={`task-item ${item.completed ? 'task-completed' : ''}`}>
      <button
        className={`task-checkbox ${item.completed ? 'checked' : ''}`}
        onClick={() => onToggle(item.id)}
      >
        {item.completed && '✓'}
      </button>

      <div className="task-content">
        <div className="task-text-row">
          <span className={`task-text ${item.completed ? 'task-text-done' : ''}`}>
            {item.text}
          </span>
          {item.is_daily && <span className="daily-badge">{t.daily}</span>}
          {dueInfo && (
            <span className={`due-badge ${dueInfo.isOverdue ? 'due-overdue' : ''}`}>
              {dueInfo.label}
            </span>
          )}
        </div>

        {item.description && (
          <p className="task-description">{item.description}</p>
        )}

        <div className="task-meta">
          <span
            className="task-author"
            style={{ background: getLightColor(authorColor), color: authorColor }}
          >
            {item.added_by}
          </span>
          <span className="task-time-info">
            {t.addedAt(formatTime(item.created_at))}
          </span>
          {item.completed && item.completed_by && (
            <span className="task-completed-info">
              — {t.doneBy(item.completed_by, formatTime(item.completed_at))}
            </span>
          )}
        </div>

        {assignments.length > 0 && (
          <div className="assignment-badges">
            {assignments.map((a) => {
              const m = members.find((mem) => mem.id === a.member_id);
              if (!m) return null;
              return (
                <span
                  key={a.member_id}
                  className="assignment-badge"
                  style={{ background: getLightColor(m.color), color: m.color }}
                >
                  {m.display_name}
                  {onUnassign && (
                    <button
                      className="unassign-btn"
                      onClick={(e) => { e.stopPropagation(); onUnassign(a.member_id); }}
                      style={{ color: m.color }}
                    >
                      ✕
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {canDelete && (
        <button
          className="task-delete"
          onClick={() => onDelete(item.id)}
          title={t.delete}
        >
          ×
        </button>
      )}
    </div>
  );
}
