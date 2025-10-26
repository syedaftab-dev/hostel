import React, { useState } from 'react';
import { X, Search, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAttendance } from '../../hooks/useAttendance';
import { useToast } from '../ui/Toast';
import { Profile } from '../../hooks/useAuth';

interface AttendanceMarkingModalProps {
  users: Profile[];
  selectedDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AttendanceMarkingModal: React.FC<AttendanceMarkingModalProps> = ({
  users,
  selectedDate,
  onClose,
  onSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'late' | 'excused'>('present');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { markAttendance } = useAttendance();
  const { showToast } = useToast();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedUsers.size === 0) {
      showToast('Please select at least one student', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const promises = Array.from(selectedUsers).map(userId =>
        markAttendance(userId, selectedStatus, selectedDate, notes.trim() || undefined)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        showToast(`Failed to mark attendance for ${errors.length} students`, 'error');
      } else {
        showToast(`Attendance marked for ${selectedUsers.size} students`, 'success');
        onSuccess();
        onClose();
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Mark Attendance - {new Date(selectedDate).toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'present', label: 'Present', icon: 'present' },
                { value: 'absent', label: 'Absent', icon: 'absent' },
                { value: 'late', label: 'Late', icon: 'late' },
                { value: 'excused', label: 'Excused', icon: 'excused' }
              ].map((status) => (
                <label
                  key={status.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStatus === status.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.icon)}
                    <span className="font-medium">{status.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Select All */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedUsers.size} of {filteredUsers.length} students selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredUsers.map((user) => (
              <label
                key={user.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedUsers.has(user.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={() => handleUserToggle(user.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.roll_number}</p>
                    </div>
                    {user.room_number && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Room {user.room_number}</p>
                        {user.hostel_block && (
                          <p className="text-xs text-gray-500">{user.hostel_block}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found matching your search.</p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 p-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting || selectedUsers.size === 0}
          >
            {isSubmitting ? 'Marking...' : `Mark Attendance (${selectedUsers.size})`}
          </Button>
        </div>
      </Card>
    </div>
  );
};