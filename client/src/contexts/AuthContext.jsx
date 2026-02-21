import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [member, setMember] = useState(null);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMemberData = async (userId) => {
    const { data: memberData } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!memberData) {
      setMember(null);
      setHousehold(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    setMember(memberData);

    const { data: householdData } = await supabase
      .from('households')
      .select('*')
      .eq('id', memberData.household_id)
      .single();

    setHousehold(householdData);

    const { data: allMembers } = await supabase
      .from('members')
      .select('*')
      .eq('household_id', memberData.household_id)
      .order('joined_at', { ascending: true });

    setMembers(allMembers || []);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchMemberData(s.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        fetchMemberData(s.user.id);
      } else {
        setMember(null);
        setHousehold(null);
        setMembers([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime updates for household members
  useEffect(() => {
    if (!member?.household_id) return;

    const channel = supabase
      .channel('household-members')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'members',
      }, () => {
        supabase
          .from('members')
          .select('*')
          .eq('household_id', member.household_id)
          .order('joined_at', { ascending: true })
          .then(({ data }) => setMembers(data || []));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [member?.household_id]);

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMember(null);
    setHousehold(null);
    setMembers([]);
  };

  const createHousehold = async (householdName, displayName, color) => {
    const userId = session.user.id;

    const { data: h, error: hErr } = await supabase
      .from('households')
      .insert({ name: householdName, created_by: userId })
      .select()
      .single();

    if (hErr) return { error: hErr };

    const { error: mErr } = await supabase
      .from('members')
      .insert({
        user_id: userId,
        household_id: h.id,
        display_name: displayName,
        color,
        is_owner: true,
      });

    if (mErr) return { error: mErr };

    await fetchMemberData(userId);
    return { error: null };
  };

  const joinHousehold = async (joinCode, displayName, color) => {
    const { error } = await supabase.rpc('join_household', {
      p_join_code: joinCode,
      p_display_name: displayName,
      p_color: color,
    });

    if (error) return { error };

    await fetchMemberData(session.user.id);
    return { error: null };
  };

  // Set the active member (for MemberPicker — switching profiles on same device)
  const setActiveMember = (m) => {
    setMember(m);
  };

  const value = {
    session,
    member,
    household,
    members,
    loading,
    signUp,
    signIn,
    signOut,
    createHousehold,
    joinHousehold,
    setActiveMember,
    refreshMembers: () => session?.user && fetchMemberData(session.user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
