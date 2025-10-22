import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  UserCheck, 
  UserX,
  Edit,
  MoreVertical,
  Crown,
  User as UserIcon
} from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { UserRoleModal } from '../components/modals/UserRoleModal';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';

interface UserManagementScreenProps {
  onMenuClick: () => void;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const { profile } = useAuth();
  const { users, loading } = useUsers();
  const { showToast } = useToast();

  const roleOptions = ['all', 'student', 'warden', 'admin'];

  // Filter users based on current user's role
  const getFilteredUsers = () => {
    let filteredUsers = users;

    // Role-based filtering
    if (profile?.role === 'warden') {
      // Wardens can only see students
      filteredUsers = users.filter(user => user.role === 'student');
    } else if (profile?.role === 'admin') {
      // Admins can see everyone
      filteredUsers = users;
    } else {
      // Students can't access this screen, but just in case
      filteredUsers = [];
    }

    // Search filtering
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filtering
    if (selectedRole !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
    }

    return filteredUsers;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'warden':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'warden':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageUser = (user: any) => {
    if (profile?.role === 'admin') {
      return true; // Admins can manage everyone
    }
    if (profile?.role === 'warden') {
      return user.role === 'student'; // Wardens can only manage students
    }
    return false;
  };

  const handleEditUser = (user: any) => {
    if (!canManageUser(user)) {
      showToast('You do not have permission to manage this user', 'error');
      return;
    }
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="User Management" showMenu onMenuClick={onMenuClick} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Check if user has permission to access this screen
  if (profile?.role === 'student') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="User Management" showMenu onMenuClick={onMenuClick} />
        <div className="flex flex-col items-center justify-center py-20">
          <Shield className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center">
            You don't have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="User Management" showMenu onMenuClick={onMenuClick} />

      <div className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <UserIcon className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'student').length}
                </p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'warden').length}
                </p>
                <p className="text-sm text-gray-600">Wardens</p>
              </div>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {roleOptions.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-sm text-gray-600">{user.roll_number}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      {user.department && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {user.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {canManageUser(user) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* User Role Modal */}
      {showRoleModal && selectedUser && (
        <UserRoleModal
          user={selectedUser}
          currentUserRole={profile?.role || 'student'}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};