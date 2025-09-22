import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useRooms, Room } from '../../hooks/useRooms';
import { useToast } from '../ui/Toast';

interface RoomBookingFormProps {
  room: Room;
  onClose: () => void;
}

export const RoomBookingForm: React.FC<RoomBookingFormProps> = ({ room, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bookRoom } = useRooms();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate) {
      showToast('Please select a start date', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (startDate < today) {
      showToast('Start date cannot be in the past', 'error');
      return;
    }

    if (endDate && endDate < startDate) {
      showToast('End date cannot be before start date', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await bookRoom(room.id, startDate, endDate || undefined);

      if (error) {
        showToast(error.message || 'Failed to book room. Please try again.', 'error');
      } else {
        showToast('Room booking request submitted successfully!', 'success');
        onClose();
      }
    } catch (error) {
      showToast('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Book Room {room.number}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{room.number}</span>
            <span className="text-lg font-bold">₹{room.rent.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-600">{room.block}</p>
          <p className="text-sm text-gray-600">
            Capacity: {room.capacity} | Occupied: {room.occupied}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {room.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for indefinite booking
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your booking request will be reviewed by the hostel administration. 
              You will be notified once it's approved.
            </p>
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Room'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};