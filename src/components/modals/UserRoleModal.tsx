import React, { useState } from 'react';
import { X, Crown, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useUsers } from '../../hooks/useUsers';
import { useToast } from '../ui/Toast';
import { Profile } from '../../hooks/useAuth';

interface UserRoleModalProps {
  user: Profile;
  currentUserRole: string;
  onClose: () => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({ 
  user, 
  currentUserRole, 
  onClose 
}) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [department, setDepartment] = useState(user.department || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { promoteToAdmin, promoteToWarden, demoteToStudent } = useUsers();
  const { showToast } = useToast();

  const availableRoles = currentUserRole === 'admin' 
    ? ['student', 'warden', 'admin']
    : ['student']; // Wardens can only manage students

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRole === user.role && department === user.department) {
      showToast('No changes made', 'info');
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      switch (selectedRole) {
        case 'admin':
          result = await promoteToAdmin(user.id);
          break;
        case 'warden':
          result = await promoteToWarden(user.id, department);
          break;
        case 'student':
          result = await demoteToStudent(user.id);
          break;
        default:
          throw new Error('Invalid role selected');
      }

      if (result.error) {
        showToast(result.error.message || 'Failed to update user role', 'error');
      } else {
        showToast(`User role updated to ${selectedRole} successfully!`, 'success');
        onClose();
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5 text-yellow-600" />;
      case 'warden':
        return <Shield className="w-5 h-5 text-blue-600" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access, can manage all users and settings';
      case 'warden':
        return 'Can manage students and handle hostel operations';
      case 'student':
        return 'Basic access to hostel services and personal data';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Manage User Role</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.roll_number}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getRoleIcon(user.role)}
                <span className="text-sm text-gray-600">Current: {user.role}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Role
            </label>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <label
                  key={role}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    {getRoleIcon(role)}
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{role}</p>
                      <p className="text-sm text-gray-600">{getRoleDescription(role)}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Department Field for Wardens */}
          {selectedRole === 'warden' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department (Optional)
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Maintenance, Security, Mess"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Warning for Role Changes */}
          {selectedRole !== user.role && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Changing user roles will immediately affect their 
                access permissions. Make sure this change is intentional.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || selectedRole === user.role}
            >
              {isSubmitting ? 'Updating...' : 'Update Role'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};