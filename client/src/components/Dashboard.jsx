import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import ActivityFeed from './ActivityFeed';
import DailyTasks from './DailyTasks';
import QuickAdd from './QuickAdd';
import ListSelector from './ListSelector';

export default function Dashboard({ member, members, onSelectList }) {
  const { t } = useLanguage();
  const [lists, setLists] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const fetchLists = async () => {
    const { data } = await supabase
      .from('lists')
      .select('*')
      .eq('household_id', member.household_id)
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
  }, [member.household_id]);

  const unreadCounts = useMemo(() => {
    const counts = {};
    for (const list of lists) {
      const seenAt = localStorage.getItem(`casasync-seen-${member.id}-${list.id}`);
      if (!seenAt) {
        counts[list.id] = recentItems.filter((i) => i.list_id === list.id).length;
      } else {
        counts[list.id] = recentItems.filter(
          (i) => i.list_id === list.id && new Date(i.created_at) > new Date(seenAt)
        ).length;
      }
    }
    return counts;
  }, [lists, recentItems, member.id]);

  const handleSelectList = (list) => {
    localStorage.setItem(`casasync-seen-${member.id}-${list.id}`, new Date().toISOString());
    onSelectList(list);
  };

  return (
    <div className="dashboard">
      <ActivityFeed lists={lists} onSelectList={handleSelectList} member={member} members={members} />

      <button className="quick-add-btn" onClick={() => setShowQuickAdd(true)}>
        + {t.addTask}
      </button>

      {showQuickAdd && (
        <QuickAdd member={member} members={members} lists={lists} onClose={() => setShowQuickAdd(false)} />
      )}

      <DailyTasks member={member} members={members} lists={lists} />

      <ListSelector lists={lists} onSelectList={handleSelectList} unreadCounts={unreadCounts} member={member} />
    </div>
  );
}
