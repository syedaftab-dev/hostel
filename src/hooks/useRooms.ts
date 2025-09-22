import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Room {
  id: string;
  number: string;
  block: string;
  capacity: number;
  occupied: number;
  amenities: string[];
  rent: number;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomBooking {
  id: string;
  user_id: string;
  room_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  booking_date: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<RoomBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('block', { ascending: true })
        .order('number', { ascending: true });

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        setRooms(data || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .select(`
          *,
          room:rooms(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const bookRoom = async (roomId: string, startDate: string, endDate?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      
      const { data, error } = await supabase
        .from('room_bookings')
        .insert({
          room_id: roomId,
          user_id: user.id,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single();

      if (!error) {
        await fetchBookings();
      }

      return { data, error };
    } catch (error) {
      console.error('Error booking room:', error);
      return { data: null, error };
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single();

      if (!error) {
        await fetchBookings();
      }

      return { data, error };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { data: null, error };
    }
  };

  return {
    rooms,
    bookings,
    loading,
    fetchRooms,
    fetchBookings,
    bookRoom,
    cancelBooking,
  };
};