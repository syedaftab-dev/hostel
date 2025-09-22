import React, { useState } from 'react';
import { Search, Filter, Users, Wifi, AirVent, Car } from 'lucide-react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { RoomBookingForm } from '../components/forms/RoomBookingForm';
import { useRooms, Room } from '../hooks/useRooms';

interface RoomBookingScreenProps {
  onMenuClick: () => void;
}

export const RoomBookingScreen: React.FC<RoomBookingScreenProps> = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { rooms, loading } = useRooms();

  const blocks = ['all', ...Array.from(new Set(rooms.map(room => room.block)))];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.block.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlock = selectedBlock === 'all' || room.block === selectedBlock;
    return matchesSearch && matchesBlock;
  });

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'ac':
        return <AirVent className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Room Booking" showMenu onMenuClick={onMenuClick} />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Room Booking" showMenu onMenuClick={onMenuClick} />

      <div className="px-4 py-6 space-y-6">
        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {blocks.map((block) => (
              <button
                key={block}
                onClick={() => setSelectedBlock(block)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedBlock === block
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {block === 'all' ? 'All Blocks' : block}
              </button>
            ))}
          </div>
        </div>

        {/* Room List */}
        <div className="space-y-4">
          {filteredRooms.map((room) => (
            <Card key={room.id} className={`${!room.available ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.number}</h3>
                  <p className="text-sm text-gray-600">{room.block}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{room.rent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">per semester</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {room.occupied}/{room.capacity} occupied
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  room.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {room.available ? 'Available' : 'Full'}
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-4">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-1 text-gray-600">
                    {getAmenityIcon(amenity)}
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedRoom(room)}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!room.available}
                  onClick={() => room.available && setSelectedRoom(room)}
                >
                  {room.available ? 'Book Room' : 'Not Available'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No rooms found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Room Booking Modal */}
      {selectedRoom && (
        <RoomBookingForm
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
};