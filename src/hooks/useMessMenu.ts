import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MessMenu {
  id: string;
  day_of_week: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
  meal_time: string;
  created_at: string;
  updated_at: string;
}

export const useMessMenu = () => {
  const [messMenus, setMessMenus] = useState<MessMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessMenus();
  }, []);

  const fetchMessMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('mess_menus')
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('meal_type', { ascending: true });

      if (error) {
        console.error('Error fetching mess menus:', error);
      } else {
        setMessMenus(data || []);
      }
    } catch (error) {
      console.error('Error fetching mess menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuForDay = (day: string) => {
    return messMenus.filter(menu => menu.day_of_week === day);
  };

  const getMenuForDayAndMeal = (day: string, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    return messMenus.find(menu => menu.day_of_week === day && menu.meal_type === mealType);
  };

  return {
    messMenus,
    loading,
    fetchMessMenus,
    getMenuForDay,
    getMenuForDayAndMeal,
  };
};