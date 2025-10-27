import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { RoomBookingScreen } from './screens/RoomBookingScreen';
import { MessMenuScreen } from './screens/MessMenuScreen';
import { ComplaintsScreen } from './screens/ComplaintsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { UserManagementScreen } from './screens/UserManagementScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { FeesScreen } from './screens/FeesScreen';
import { Sidebar } from './components/ui/Sidebar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ToastProvider } from './components/ui/Toast';
import { useAuth } from './hooks/useAuth';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <LoadingSpinner size="lg" />
          </div>
          <p className="text-white text-lg">Loading IIITDM Hostel Management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ToastProvider>
        <Router>
          <LoginScreen />
        </Router>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <div className="flex-1 flex flex-col lg:ml-64">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/room-booking" element={<RoomBookingScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/mess-menu" element={<MessMenuScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/complaints" element={<ComplaintsScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/profile" element={<ProfileScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/attendance" element={<AttendanceScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/fees" element={<FeesScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="/user-management" element={<UserManagementScreen onMenuClick={() => setSidebarOpen(true)} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
};