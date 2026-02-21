import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';

export default function ActivityFeed({ lists, onSelectList, user }) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);

  const getDismissedAt = () =>
    localStorage.getItem(`casasync-activity-dismissed-${user}`) || null;

  const fetchActivity = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!data || data.length === 0) {
      setActivities([]);
      return;
    }

    const listMap = {};
    lists.forEach((l) => { listMap[l.id] = l; });

    const dismissedAt = getDismissedAt();

    // Filter out dismissed activities
    const filtered = dismissedAt
      ? data.filter((item) => new Date(item.created_at) > new Date(dismissedAt))
      : data;

    // Group consecutive items by same added_by + same list_id
    const grouped = [];
    let current = null;

    for (const item of filtered) {
      const list = listMap[item.list_id];
      const listName = list ? `${list.emoji} ${list.name}` : '📌';

      if (current && current.addedBy === item.added_by && current.listId === item.list_id) {
        current.count++;
        current.items.push(item);
      } else {
        if (current) grouped.push(current);
        current = {
          addedBy: item.added_by,
          listId: item.list_id,
          listName,
          list,
          count: 1,
          items: [item],
          time: item.created_at,
        };
      }
    }
    if (current) grouped.push(current);

    setActivities(grouped.slice(0, 4));
  };

  useEffect(() => {
    if (lists.length > 0) fetchActivity();

    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchActivity();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lists]);

  const handleClearAll = () => {
    localStorage.setItem(`casasync-activity-dismissed-${user}`, new Date().toISOString());
    setActivities([]);
  };

  if (activities.length === 0) return null;

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 className="section-title">{t.recentActivity}</h2>
        <button className="clear-activity-btn" onClick={handleClearAll}>
          {t.clearAll}
        </button>
      </div>
      <div className="activity-list">
        {activities.map((a, i) => (
          <div
            key={i}
            className={`activity-item activity-item-clickable ${a.addedBy === 'Filipa' ? 'activity-filipa' : 'activity-rafael'}`}
            onClick={() => a.list && onSelectList(a.list)}
          >
            <div className="activity-text">
              {a.count > 1
                ? t.addedTasks(a.addedBy, a.count, a.listName)
                : t.newTaskIn(a.listName, a.items[0].text)
              }
            </div>
            <span className="activity-time">{formatTime(a.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
