import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'mess' | 'security' | 'other';
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints:', error);
      } else {
        setComplaints(data || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComplaint = async (complaint: {
    title: string;
    description: string;
    category: 'maintenance' | 'mess' | 'security' | 'other';
    priority?: 'low' | 'medium' | 'high';
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          ...complaint,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error) {
        await fetchComplaints();
      }

      return { data, error };
    } catch (error) {
      console.error('Error creating complaint:', error);
      return { data: null, error };
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: 'pending' | 'in-progress' | 'resolved') => {
    try {
      const updates: any = { status };
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', complaintId)
        .select()
        .single();

      if (!error) {
        await fetchComplaints();
      }

      return { data, error };
    } catch (error) {
      console.error('Error updating complaint:', error);
      return { data: null, error };
    }
  };

  return {
    complaints,
    loading,
    fetchComplaints,
    createComplaint,
    updateComplaintStatus,
  };
};