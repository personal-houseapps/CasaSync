import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import ActivityFeed from './ActivityFeed';
import DailyTasks from './DailyTasks';
import QuickAdd from './QuickAdd';
import ListSelector from './ListSelector';

export default function Dashboard({ user, onSelectList }) {
  const { t } = useLanguage();
  const [lists, setLists] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const fetchLists = async () => {
    const { data } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setLists(data);
  };

  const fetchRecentItems = async () => {
    const { data } = await supabase
      .from('items')
      .select('id, list_id, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setRecentItems(data);
  };

  useEffect(() => {
    fetchLists();
    fetchRecentItems();

    const listsChannel = supabase
      .channel('dashboard-lists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, fetchLists)
      .subscribe();

    const itemsChannel = supabase
      .channel('dashboard-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchRecentItems)
      .subscribe();

    return () => {
      supabase.removeChannel(listsChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, []);

  // Compute how many new items each list has since the user last opened it
  const unreadCounts = useMemo(() => {
    const counts = {};
    for (const list of lists) {
      const seenAt = localStorage.getItem(`casasync-seen-${user}-${list.id}`);
      if (!seenAt) {
        counts[list.id] = recentItems.filter((i) => i.list_id === list.id).length;
      } else {
        counts[list.id] = recentItems.filter(
          (i) => i.list_id === list.id && new Date(i.created_at) > new Date(seenAt)
        ).length;
      }
    }
    return counts;
  }, [lists, recentItems, user]);

  // Mark list as seen when opening it
  const handleSelectList = (list) => {
    localStorage.setItem(`casasync-seen-${user}-${list.id}`, new Date().toISOString());
    onSelectList(list);
  };

  return (
    <div className="dashboard">
      <ActivityFeed lists={lists} onSelectList={handleSelectList} />

      <DailyTasks user={user} lists={lists} />

      <button className="quick-add-btn" onClick={() => setShowQuickAdd(true)}>
        + {t.addTask}
      </button>

      {showQuickAdd && (
        <QuickAdd user={user} lists={lists} onClose={() => setShowQuickAdd(false)} />
      )}

      <ListSelector lists={lists} onSelectList={handleSelectList} unreadCounts={unreadCounts} />
    </div>
  );
}
