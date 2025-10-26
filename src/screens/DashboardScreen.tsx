import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  Utensils, 
  Bell, 
  Home as HomeIcon,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { useNotices } from '../hooks/useNotices';
import { useComplaints } from '../hooks/useComplaints';
import { useRooms } from '../hooks/useRooms';

interface DashboardScreenProps {
  onMenuClick: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onMenuClick }) => {
  const { profile } = useAuth();
  const { notices, loading: noticesLoading } = useNotices();
  const { complaints } = useComplaints();
  const { bookings } = useRooms();
  const navigate = useNavigate();

  // Show loading only if we don't have profile data yet
  if (noticesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    {
      id: 'room-booking',
      title: 'Room Booking',
      description: 'Book or change rooms',
      icon: Calendar,
      color: 'bg-blue-500',
      path: '/room-booking'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Check in/out & view records',
      icon: CheckCircle,
      color: 'bg-green-500',
      path: '/attendance'
    },
    {
      id: 'mess-menu',
      title: 'Mess Menu',
      description: 'View weekly menu',
      icon: Utensils,
      color: 'bg-yellow-500',
      path: '/mess-menu'
    },
    {
      id: 'complaints',
      title: 'Complaints',
      description: 'Report issues',
      icon: MessageSquare,
      color: 'bg-orange-500',
      path: '/complaints'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage account',
      icon: Users,
      color: 'bg-purple-500',
      path: '/profile'
    }
  ];

  const userComplaints = complaints.filter(c => profile && c.user_id === profile.id);
  const userBookings = bookings.filter(b => profile && b.user_id === profile.id);
  const pendingComplaints = userComplaints.filter(c => c.status === 'pending').length;
  const activeBookings = userBookings.filter(b => b.status === 'approved' || b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        title="Dashboard" 
        showNotifications={true}
        showMenu={true}
        onMenuClick={onMenuClick}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <HomeIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Welcome back, {profile?.name || 'Student'}!</h2>
              <p className="text-blue-100">
                {profile?.room_number ? `Room ${profile.room_number}` : 'No Room Assigned'} 
                {profile?.hostel_block && ` • ${profile.hostel_block}`}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Notices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notices</h3>
            <button 
              className="text-blue-600 text-sm font-medium"
              onClick={() => navigate('/notices')}
            >
              View All
            </button>
          </div>
          
          {noticesLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => (
                <Card key={notice.id} className="border-l-4 border-l-blue-500">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {notice.priority === 'high' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Bell className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notice.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {notices.length === 0 && (
                <Card>
                  <p className="text-center text-gray-500 py-4">No notices available</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeBookings}</p>
                <p className="text-sm text-gray-600">Active Bookings</p>
              </div>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingComplaints}</p>
                <p className="text-sm text-gray-600">Pending Issues</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};