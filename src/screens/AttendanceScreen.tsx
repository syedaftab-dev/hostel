import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  UserCheck,
  Search,
  Filter,
  Download,
  Settings
} from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AttendanceMarkingModal } from '../components/modals/AttendanceMarkingModal';
import { AttendanceStatsModal } from '../components/modals/AttendanceStatsModal';
import { useAttendance } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { useToast } from '../components/ui/Toast';
import { AttendanceRecord } from '../types';

interface AttendanceScreenProps {
  onMenuClick: () => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ onMenuClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showMarkingModal, setShowMarkingModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);

  const { profile } = useAuth();
  const { users } = useUsers();
  const { 
    attendanceRecords, 
    loading, 
    markAttendance, 
    checkInOut, 
    getTodayAttendance,
    fetchAttendanceRecords 
  } = useAttendance();
  const { showToast } = useToast();

  const isStudent = profile?.role === 'student';
  const canManageAttendance = profile?.role === 'admin' || profile?.role === 'warden';

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceRecords(undefined, selectedDate, selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    const data = await getTodayAttendance();
    setTodayAttendance(data);
  };

  const handleCheckIn = async () => {
    if (!profile) return;
    
    const { error } = await checkInOut(profile.id, 'check_in');
    if (error) {
      showToast('Failed to check in', 'error');
    } else {
      showToast('Checked in successfully!', 'success');
      loadTodayAttendance();
    }
  };

  const handleCheckOut = async () => {
    if (!profile) return;
    
    const { error } = await checkInOut(profile.id, 'check_out');
    if (error) {
      showToast('Failed to check out', 'error');
    } else {
      showToast('Checked out successfully!', 'success');
      loadTodayAttendance();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'excused':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.user?.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const todayUserAttendance = todayAttendance.find(record => record.user_id === profile?.id);
  const hasCheckedIn = todayUserAttendance?.check_in_time;
  const hasCheckedOut = todayUserAttendance?.check_out_time;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Attendance" showMenu onMenuClick={onMenuClick} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Attendance" showMenu onMenuClick={onMenuClick} />

      <div className="px-4 py-6 space-y-6">
        {/* Student Check-in/Check-out */}
        {isStudent && (
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Today's Attendance</h3>
                <div className="space-y-1 text-blue-100">
                  {hasCheckedIn && (
                    <p>✓ Checked in at {new Date(todayUserAttendance.check_in_time!).toLocaleTimeString()}</p>
                  )}
                  {hasCheckedOut && (
                    <p>✓ Checked out at {new Date(todayUserAttendance.check_out_time!).toLocaleTimeString()}</p>
                  )}
                  {!hasCheckedIn && <p>Not checked in yet</p>}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  size="sm"
                >
                  {hasCheckedIn ? 'Checked In' : 'Check In'}
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!hasCheckedIn || hasCheckedOut}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  size="sm"
                >
                  {hasCheckedOut ? 'Checked Out' : 'Check Out'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Admin/Warden Controls */}
        {canManageAttendance && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayAttendance.filter(r => r.status === 'present').length}
                    </p>
                    <p className="text-sm text-gray-600">Present</p>
                  </div>
                </div>
              </Card>
              
              <Card className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayAttendance.filter(r => r.status === 'absent').length}
                    </p>
                    <p className="text-sm text-gray-600">Absent</p>
                  </div>
                </div>
              </Card>
              
              <Card className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {todayAttendance.filter(r => r.status === 'late').length}
                    </p>
                    <p className="text-sm text-gray-600">Late</p>
                  </div>
                </div>
              </Card>
              
              <Card className="text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {users.filter(u => u.role === 'student').length}
                    </p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowMarkingModal(true)}
                className="flex items-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Mark Attendance</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowStatsModal(true)}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>View Stats</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
          </>
        )}

        {/* Date and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {canManageAttendance && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2">
                {['all', 'present', 'absent', 'late', 'excused'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                      selectedStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Attendance Records */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance for {new Date(selectedDate).toLocaleDateString()}
          </h3>
          
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <Card key={record.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{record.user?.name}</h4>
                      <p className="text-sm text-gray-600">{record.user?.roll_number}</p>
                      {record.user?.room_number && (
                        <p className="text-xs text-gray-500">
                          Room {record.user.room_number}
                          {record.user.hostel_block && ` • ${record.user.hostel_block}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(record.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      {record.check_in_time && (
                        <p>In: {new Date(record.check_in_time).toLocaleTimeString()}</p>
                      )}
                      {record.check_out_time && (
                        <p>Out: {new Date(record.check_out_time).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {isStudent 
                    ? "No attendance record found for this date."
                    : "No attendance records found for the selected criteria."
                  }
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {showMarkingModal && (
        <AttendanceMarkingModal
          users={users.filter(u => u.role === 'student')}
          selectedDate={selectedDate}
          onClose={() => setShowMarkingModal(false)}
          onSuccess={() => {
            fetchAttendanceRecords(undefined, selectedDate, selectedDate);
            loadTodayAttendance();
          }}
        />
      )}

      {showStatsModal && (
        <AttendanceStatsModal
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
};