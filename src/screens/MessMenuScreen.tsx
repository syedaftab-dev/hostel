import React, { useState } from 'react';
import { Calendar, Clock, ChefHat } from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useMessMenu } from '../hooks/useMessMenu';

interface MessMenuScreenProps {
  onMenuClick: () => void;
}

export const MessMenuScreen: React.FC<MessMenuScreenProps> = ({ onMenuClick }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const { messMenus, loading, getMenuForDay } = useMessMenu();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayMenus = getMenuForDay(selectedDay);

  const mealTimes = [
    { 
      name: 'Breakfast', 
      type: 'breakfast' as const,
      icon: '🌅',
      menu: currentDayMenus.find(m => m.meal_type === 'breakfast')
    },
    { 
      name: 'Lunch', 
      type: 'lunch' as const,
      icon: '☀️',
      menu: currentDayMenus.find(m => m.meal_type === 'lunch')
    },
    { 
      name: 'Dinner', 
      type: 'dinner' as const,
      icon: '🌙',
      menu: currentDayMenus.find(m => m.meal_type === 'dinner')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Mess Menu" showMenu onMenuClick={onMenuClick} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Mess Menu" showMenu onMenuClick={onMenuClick} />

      <div className="px-4 py-6 space-y-6">
        {/* Day Selector */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Select Day
          </h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Menu for Selected Day */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            {selectedDay}'s Menu
          </h3>

          {mealTimes.map((meal) => (
            <Card key={meal.name}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {meal.menu?.meal_time || 'Time not available'}
                    </div>
                  </div>
                </div>
              </div>

              {meal.menu ? (
                <div className="grid grid-cols-2 gap-2">
                  {meal.menu.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Menu not available for {meal.name.toLowerCase()}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Mess Timings Info */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Mess Timings</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>Breakfast: 7:30 AM - 9:30 AM</p>
                <p>Lunch: 12:00 PM - 2:00 PM</p>
                <p>Dinner: 7:00 PM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Special Notes */}
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-lg">⚠️</span>
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
              <div className="space-y-1 text-sm text-yellow-800">
                <p>• Menu may change based on availability</p>
                <p>• Special meals on festivals and occasions</p>
                <p>• Report any food quality issues immediately</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};