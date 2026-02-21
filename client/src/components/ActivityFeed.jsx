import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';

export default function ActivityFeed({ lists, onSelectList, member, members }) {
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);

  const getDismissedAt = () =>
    localStorage.getItem(`casasync-activity-dismissed-${member.id}`) || null;

  const getAuthorColor = (addedBy, addedByMemberId) => {
    if (addedByMemberId) {
      const m = members.find((mem) => mem.id === addedByMemberId);
      return m?.color || '#6b7280';
    }
    const m = members.find((mem) => mem.display_name === addedBy);
    return m?.color || '#6b7280';
  };

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

    const filtered = dismissedAt
      ? data.filter((item) => new Date(item.created_at) > new Date(dismissedAt))
      : data;

    const grouped = [];
    let current = null;

    for (const item of filtered) {
      const list = listMap[item.list_id];
      const listName = list ? `${list.emoji} ${list.name}` : '';
      const groupKey = item.added_by_member_id || item.added_by;

      if (current && current.groupKey === groupKey && current.listId === item.list_id) {
        current.count++;
        current.items.push(item);
      } else {
        if (current) grouped.push(current);
        current = {
          groupKey,
          addedBy: item.added_by,
          addedByMemberId: item.added_by_member_id,
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
  }, [lists, members]);

  const handleClearAll = () => {
    localStorage.setItem(`casasync-activity-dismissed-${member.id}`, new Date().toISOString());
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
        {activities.map((a, i) => {
          const color = getAuthorColor(a.addedBy, a.addedByMemberId);
          return (
            <div
              key={i}
              className="activity-item activity-item-clickable"
              style={{ borderLeftColor: color }}
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
          );
        })}
      </div>
    </div>
  );
}
