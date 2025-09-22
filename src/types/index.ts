export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  roomNumber?: string;
  hostelBlock: string;
  phoneNumber: string;
  avatar?: string;
}

export interface Room {
  id: string;
  number: string;
  block: string;
  capacity: number;
  occupied: number;
  amenities: string[];
  rent: number;
  available: boolean;
}

export interface MessMenu {
  id: string;
  day: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'mess' | 'security' | 'other';
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt?: string;
}