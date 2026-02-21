import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../i18n';
import ActivityFeed from './ActivityFeed';
import DailyTasks from './DailyTasks';
import QuickAdd from './QuickAdd';
import ListSelector from './ListSelector';

export default function Dashboard({ user, onSelectList }) {
  const { t } = useLanguage();
  const [lists, setLists] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const fetchLists = async () => {
    const { data } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setLists(data);
  };

  useEffect(() => {
    fetchLists();

    const channel = supabase
      .channel('dashboard-lists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lists' }, () => {
        fetchLists();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="dashboard">
      <ActivityFeed lists={lists} />

      <DailyTasks user={user} lists={lists} />

      <button className="quick-add-btn" onClick={() => setShowQuickAdd(true)}>
        + {t.addTask}
      </button>

      {showQuickAdd && (
        <QuickAdd user={user} lists={lists} onClose={() => setShowQuickAdd(false)} />
      )}

      <ListSelector lists={lists} onSelectList={onSelectList} />
    </div>
  );
}
