import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AttendanceRecord, AttendanceSettings, AttendanceStats } from '../types';

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSettings, setAttendanceSettings] = useState<AttendanceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceRecords();
    fetchAttendanceSettings();
  }, []);

  const fetchAttendanceRecords = async (userId?: string, startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          user:profiles(name, roll_number, room_number, hostel_block)
        `)
        .order('date', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (startDate) {
        query = query.gte('date', startDate);
      }

      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendance records:', error);
      } else {
        setAttendanceRecords(data || []);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching attendance settings:', error);
      } else {
        setAttendanceSettings(data);
      }
    } catch (error) {
      console.error('Error fetching attendance settings:', error);
    }
  };

  const markAttendance = async (
    userId: string,
    status: 'present' | 'absent' | 'late' | 'excused',
    date?: string,
    notes?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('mark_attendance', {
        target_user_id: userId,
        attendance_date: date || new Date().toISOString().split('T')[0],
        attendance_status: status,
        check_time: new Date().toISOString(),
        attendance_notes: notes
      });

      if (error) {
        console.error('Error marking attendance:', error);
        return { data: null, error };
      }

      await fetchAttendanceRecords();
      return { data, error: null };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { data: null, error };
    }
  };

  const checkInOut = async (userId: string, type: 'check_in' | 'check_out') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      // Get existing record for today
      const { data: existingRecord } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      let updateData: any = {
        updated_at: now
      };

      if (type === 'check_in') {
        updateData.check_in_time = now;
        updateData.status = 'present';
      } else {
        updateData.check_out_time = now;
      }

      if (existingRecord) {
        const { data, error } = await supabase
          .from('attendance_records')
          .update(updateData)
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (!error) {
          await fetchAttendanceRecords();
        }

        return { data, error };
      } else if (type === 'check_in') {
        const { data, error } = await supabase
          .from('attendance_records')
          .insert({
            user_id: userId,
            date: today,
            status: 'present',
            check_in_time: now,
            marked_by: userId
          })
          .select()
          .single();

        if (!error) {
          await fetchAttendanceRecords();
        }

        return { data, error };
      }

      return { data: null, error: new Error('Cannot check out without checking in') };
    } catch (error) {
      console.error('Error with check in/out:', error);
      return { data: null, error };
    }
  };

  const getAttendanceStats = async (
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceStats | null> => {
    try {
      const { data, error } = await supabase.rpc('get_attendance_stats', {
        start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: endDate || new Date().toISOString().split('T')[0],
        target_user_id: userId || null
      });

      if (error) {
        console.error('Error fetching attendance stats:', error);
        return null;
      }

      return data[0] || null;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return null;
    }
  };

  const updateAttendanceSettings = async (settings: Partial<AttendanceSettings>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', attendanceSettings?.id)
        .select()
        .single();

      if (!error) {
        setAttendanceSettings(data);
      }

      return { data, error };
    } catch (error) {
      console.error('Error updating attendance settings:', error);
      return { data: null, error };
    }
  };

  const getTodayAttendance = async (userId?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          user:profiles(name, roll_number, room_number, hostel_block)
        `)
        .eq('date', today);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching today attendance:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching today attendance:', error);
      return [];
    }
  };

  return {
    attendanceRecords,
    attendanceSettings,
    loading,
    fetchAttendanceRecords,
    fetchAttendanceSettings,
    markAttendance,
    checkInOut,
    getAttendanceStats,
    updateAttendanceSettings,
    getTodayAttendance,
  };
};