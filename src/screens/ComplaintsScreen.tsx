import React, { useState } from 'react';
import { Plus, Search, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { NewComplaintForm } from '../components/forms/NewComplaintForm';
import { useComplaints } from '../hooks/useComplaints';
import { useAuth } from '../hooks/useAuth';

interface ComplaintsScreenProps {
  onMenuClick: () => void;
}

export const ComplaintsScreen: React.FC<ComplaintsScreenProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showNewComplaint, setShowNewComplaint] = useState(false);

  const { profile } = useAuth();
  const { complaints, loading } = useComplaints();

  const statusOptions = ['all', 'pending', 'in-progress', 'resolved'];

  // Filter complaints to show only user's own complaints
  const userComplaints = complaints.filter(complaint => complaint.user_id === profile?.id);
  
  const filteredComplaints = userComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || complaint.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'maintenance':
        return 'bg-purple-100 text-purple-800';
      case 'mess':
        return 'bg-yellow-100 text-yellow-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Complaints & Issues" showMenu onMenuClick={onMenuClick} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Complaints & Issues" showMenu onMenuClick={onMenuClick} />

      <div className="px-4 py-6 space-y-6">
        {/* Add New Complaint Button */}
        <Button
          onClick={() => setShowNewComplaint(true)}
          className="w-full flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Complaint</span>
        </Button>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {statusOptions.map((status) => (
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
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card key={complaint.id} className="border-l-4 border-l-blue-500">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 flex-1 pr-2">{complaint.title}</h3>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(complaint.status)}
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                      {complaint.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </div>

                {complaint.status === 'resolved' && complaint.resolved_at && (
                  <div className="bg-green-50 p-2 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Resolved on {new Date(complaint.resolved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {userComplaints.length === 0 
                ? "You haven't submitted any complaints yet." 
                : "No complaints found matching your criteria."
              }
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-1">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <p className="text-lg font-bold text-gray-900">
                {userComplaints.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-1">
              <Clock className="w-6 h-6 text-blue-500" />
              <p className="text-lg font-bold text-gray-900">
                {userComplaints.filter(c => c.status === 'in-progress').length}
              </p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
          </Card>
          
          <Card className="text-center">
            <div className="flex flex-col items-center space-y-1">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <p className="text-lg font-bold text-gray-900">
                {userComplaints.filter(c => c.status === 'resolved').length}
              </p>
              <p className="text-xs text-gray-600">Resolved</p>
            </div>
          </Card>
        </div>
      </div>

      {/* New Complaint Modal */}
      {showNewComplaint && (
        <NewComplaintForm onClose={() => setShowNewComplaint(false)} />
      )}
    </div>
  );
};