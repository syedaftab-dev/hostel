import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Settings, 
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

interface ProfileScreenProps {
  onMenuClick: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onMenuClick }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const { profile, signOut, loading } = useAuth();
  const { showToast } = useToast();

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

  const menuItems = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: Bell,
      color: 'text-blue-600'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Password and privacy settings',
      icon: Shield,
      color: 'text-green-600'
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      color: 'text-purple-600'
    },
    {
      id: 'settings',
      title: 'App Settings',
      description: 'Theme, language, and preferences',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Profile" showMenu onMenuClick={onMenuClick} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" showMenu onMenuClick={onMenuClick} />

      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-white" />
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Edit className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.roll_number}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditProfile(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          </div>
        </Card>

        {/* Profile Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile.id}</p>
              </div>
            </div>

            {profile.phone_number && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{profile.phone_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Room & Block</p>
                <p className="font-medium text-gray-900">
                  {profile.room_number 
                    ? `Room ${profile.room_number}${profile.hostel_block ? `, ${profile.hostel_block}` : ''}` 
                    : 'Not Assigned'
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {/* Handle navigation */}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">3</p>
                <p className="text-sm text-gray-600">Notifications</p>
              </div>
            </div>
          </Card>

          <Card className="text-center cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600">Preferences</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Logout Button */}
        <Card className="border-red-200">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Hostel Management System</p>
          <p>Version 1.0.0</p>
          <p>© 2024 IIITDM Kurnool</p>
        </div>
      </div>
    </div>
  );
};