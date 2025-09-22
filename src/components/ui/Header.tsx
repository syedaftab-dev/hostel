import React from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showNotifications = false,
  showMenu = false,
  onMenuClick
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {showNotifications && (
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        )}
      </div>
    </header>
  );
};