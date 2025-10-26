import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp, Users, ChartBar as BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAttendance } from '../../hooks/useAttendance';
import { useUsers } from '../../hooks/useUsers';
import { AttendanceStats } from '../../types';

interface AttendanceStatsModalProps {
  onClose: () => void;
}

export const AttendanceStatsModal: React.FC<AttendanceStatsModalProps> = ({ onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedUser, setSelectedUser] = useState('all');
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);

  const { getAttendanceStats } = useAttendance();
  const { users } = useUsers();

  const students = users.filter(u => u.role === 'student');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod, selectedUser]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const data = await getAttendanceStats(
        selectedUser === 'all' ? undefined : selectedUser,
        startDate,
        endDate
      );

      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B', color: 'text-yellow-500' };
    if (percentage >= 60) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Attendance Statistics
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="180">Last 6 months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.roll_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Display */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* Overall Attendance */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">
                    {stats.attendance_percentage.toFixed(1)}%
                  </h3>
                  <p className="text-blue-100">Overall Attendance</p>
                  <div className="mt-2">
                    <span className={`text-lg font-semibold ${getAttendanceGrade(stats.attendance_percentage).color}`}>
                      Grade: {getAttendanceGrade(stats.attendance_percentage).grade}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Calendar className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stats.total_days}</p>
                      <p className="text-sm text-gray-600">Total Days</p>
                    </div>
                  </div>
                </Card>

                <Card className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stats.present_days}</p>
                      <p className="text-sm text-gray-600">Present</p>
                    </div>
                  </div>
                </Card>

                <Card className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stats.absent_days}</p>
                      <p className="text-sm text-gray-600">Absent</p>
                    </div>
                  </div>
                </Card>

                <Card className="text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stats.late_days}</p>
                      <p className="text-sm text-gray-600">Late</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Visual Progress Bar */}
              <Card>
                <h4 className="font-medium text-gray-900 mb-3">Attendance Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Present</span>
                    <span>{((stats.present_days / stats.total_days) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.present_days / stats.total_days) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Late</span>
                    <span>{((stats.late_days / stats.total_days) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(stats.late_days / stats.total_days) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Absent</span>
                    <span>{((stats.absent_days / stats.total_days) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(stats.absent_days / stats.total_days) * 100}%` }}
                    ></div>
                  </div>

                  {stats.excused_days > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Excused</span>
                        <span>{((stats.excused_days / stats.total_days) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(stats.excused_days / stats.total_days) * 100}%` }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="bg-yellow-50 border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-2">Recommendations</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  {stats.attendance_percentage < 75 && (
                    <p>• Attendance is below 75%. Consider improving regularity.</p>
                  )}
                  {stats.late_days > stats.total_days * 0.1 && (
                    <p>• High number of late arrivals. Try to arrive on time.</p>
                  )}
                  {stats.attendance_percentage >= 90 && (
                    <p>• Excellent attendance! Keep up the good work.</p>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance data available for the selected period.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
};