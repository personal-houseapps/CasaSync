export default function TaskItem({ item, user, onToggle, onDelete }) {
  const isFilipa = item.added_by === 'Filipa';
  const userClass = isFilipa ? 'user-filipa' : 'user-rafael';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
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
        <span className={`task-text ${item.completed ? 'task-text-done' : ''}`}>
          {item.text}
        </span>
        <div className="task-meta">
          <span className={`task-author ${userClass}`}>
            {item.added_by}
          </span>
          {item.completed && item.completed_by && (
            <span className="task-completed-info">
              — done by {item.completed_by} {formatTime(item.completed_at)}
            </span>
          )}
        </div>
      </div>

      <button
        className="task-delete"
        onClick={() => onDelete(item.id)}
        title="Delete item"
      >
        ×
      </button>
    </div>
  );
}
