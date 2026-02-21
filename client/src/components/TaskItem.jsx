import { useLanguage } from '../i18n';

export default function TaskItem({ item, user, onToggle, onDelete }) {
  const { t, lang } = useLanguage();
  const isFilipa = item.added_by === 'Filipa';
  const userClass = isFilipa ? 'user-filipa' : 'user-rafael';

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
        </div>
        <div className="task-meta">
          <span className={`task-author ${userClass}`}>
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
      </div>

      {user === item.added_by && (
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
