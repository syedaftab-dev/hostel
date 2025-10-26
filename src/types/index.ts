export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  roomNumber?: string;
  hostelBlock: string;
  phoneNumber: string;
  avatar?: string;
  role: 'student' | 'warden' | 'admin';
  department?: string;
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

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  marked_by?: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    roll_number: string;
    room_number?: string;
    hostel_block?: string;
  };
}

export interface AttendanceSettings {
  id: string;
  check_in_start: string;
  check_in_end: string;
  check_out_start: string;
  check_out_end: string;
  late_threshold_minutes: number;
  auto_mark_absent_after: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  attendance_percentage: number;
}