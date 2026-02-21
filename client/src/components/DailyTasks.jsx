import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';

export default function DailyTasks({ user, lists }) {
  const { t } = useLanguage();
  const [dailyItems, setDailyItems] = useState([]);

  const fetchDaily = async () => {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('is_daily', true)
      .order('created_at', { ascending: true });
    if (data) setDailyItems(data);
  };

  useEffect(() => {
    fetchDaily();

    const channel = supabase
      .channel('daily-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchDaily();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const isDoneToday = (item) => {
    if (!item.completed || !item.completed_at) return false;
    return new Date(item.completed_at).toDateString() === new Date().toDateString();
  };

  const handleToggle = async (item) => {
    const doneToday = isDoneToday(item);
    if (doneToday) {
      await supabase.from('items').update({
        completed: false,
        completed_by: null,
        completed_at: null,
      }).eq('id', item.id);
    } else {
      await supabase.from('items').update({
        completed: true,
        completed_by: user,
        completed_at: new Date().toISOString(),
      }).eq('id', item.id);
    }
  };

  const handleUnmarkDaily = async (itemId) => {
    await supabase.from('items').update({ is_daily: false }).eq('id', itemId);
  };

  const listMap = {};
  lists.forEach((l) => { listMap[l.id] = l; });

  if (dailyItems.length === 0) return null;

  return (
    <div className="dashboard-section">
      <h2 className="section-title">{t.dailyTasks}</h2>
      <div className="daily-list">
        {dailyItems.map((item) => {
          const doneToday = isDoneToday(item);
          const list = listMap[item.list_id];
          const isFilipa = item.added_by === 'Filipa';

          return (
            <div key={item.id} className={`daily-item ${doneToday ? 'daily-item-done' : ''}`}>
              <button
                className={`task-checkbox ${doneToday ? 'checked' : ''}`}
                onClick={() => handleToggle(item)}
              >
                {doneToday && '✓'}
              </button>

              <div className="daily-item-content">
                <span className={`daily-item-text ${doneToday ? 'task-text-done' : ''}`}>
                  {item.text}
                </span>
                <div className="daily-item-meta">
                  {list && (
                    <span className="daily-list-badge">{list.emoji} {list.name}</span>
                  )}
                  <span className={`task-author ${isFilipa ? 'user-filipa' : 'user-rafael'}`}>
                    {item.added_by}
                  </span>
                  <span className={doneToday ? 'done-today-badge' : 'not-done-badge'}>
                    {doneToday ? t.doneToday : t.notDoneToday}
                  </span>
                </div>
              </div>

              <button
                className="unmark-daily-btn"
                onClick={() => handleUnmarkDaily(item.id)}
                title={t.unmarkDaily}
              >
                🔄
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
