import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from './useAuth';

export const useUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        target_user_id: userId
      });

      if (!error) {
        await fetchUsers();
      }

      return { error };
    } catch (error) {
      console.error('Error promoting to admin:', error);
      return { error };
    }
  };

  const promoteToWarden = async (userId: string, department?: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_warden', {
        target_user_id: userId,
        warden_department: department
      });

      if (!error) {
        await fetchUsers();
      }

      return { error };
    } catch (error) {
      console.error('Error promoting to warden:', error);
      return { error };
    }
  };

  const demoteToStudent = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('demote_to_student', {
        target_user_id: userId
      });

      if (!error) {
        await fetchUsers();
      }

      return { error };
    } catch (error) {
      console.error('Error demoting to student:', error);
      return { error };
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (!error) {
        await fetchUsers();
      }

      return { data, error };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error };
    }
  };

  return {
    users,
    loading,
    fetchUsers,
    promoteToAdmin,
    promoteToWarden,
    demoteToStudent,
    updateUserProfile,
  };
};