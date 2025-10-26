import React from 'react';
import { Chrome as Home, Calendar, MessageSquare, User, Utensils, X, LogOut, Bell, Settings, Users, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from './Toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const getMenuItems = (role: string) => [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'room-booking', label: 'Room Booking', icon: Calendar, path: '/room-booking' },
  { id: 'mess-menu', label: 'Mess Menu', icon: Utensils, path: '/mess-menu' },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare, path: '/complaints' },
  { id: 'attendance', label: 'Attendance', icon: Calendar, path: '/attendance' },
  ...(role === 'admin' || role === 'warden' ? [
    { id: 'user-management', label: 'User Management', icon: Users, path: '/user-management' }
  ] : []),
  ...(role === 'admin' ? [
    { id: 'admin-panel', label: 'Admin Panel', icon: Shield, path: '/admin-panel' }
  ] : []),
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();

  const menuItems = getMenuItems(profile?.role || 'student');

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        showToast('Failed to sign out', 'error');
      } else {
        showToast('Signed out successfully', 'success');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">IIITDM Hostel</h2>
              <p className="text-xs text-gray-600">Management System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {profile?.name || 'Student'}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {profile?.roll_number || 'Loading...'} • {profile?.role || 'student'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => handleNavigation('/profile')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};