# IIITDM Hostel Management System

A comprehensive hostel management web application built with React.js and Supabase (PostgreSQL database).

## Features

### Student Features
- **Authentication**: Secure login and registration with JWT
- **Dashboard**: View notices, quick stats, and recent activities
- **Room Booking**: Browse available rooms and submit booking requests
- **Attendance**: Check-in/out daily and view attendance history
- **Mess Menu**: View weekly mess menu
- **Complaints**: Submit and track complaints (maintenance, mess, security, cleanliness)
- **Hostel Fees**: View fee records, make online payments, download receipts
- **Profile Management**: Update personal information

### Admin/Warden Features
- **User Management**: Add, view, edit, and assign roles to users
- **Attendance Management**: Mark attendance for all students, view reports
- **Complaint Management**: View all complaints, update status, resolve issues
- **Room Management**: Approve/reject room bookings, manage allocations
- **Fee Management**: View all fee records, mark payments as received
- **Email Notifications**: Automatic emails for status changes

## Tech Stack

- **Frontend**: React.js with Vite, TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT-based)
- **Email Notifications**: Supabase Edge Functions
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env` file

3. Run development server:
```bash
npm run dev
```

The app will be available at [http://localhost:5173/](http://localhost:5173/)

### Build for Production

```bash
npm run build
```

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles with role-based access (student, warden, admin)
- `rooms` - Hostel room information
- `room_bookings` - Room allocation requests
- `attendance_records` - Daily attendance tracking
- `complaints` - Student complaints and issues
- `fees` - Hostel fee records and payments
- `mess_menus` - Weekly mess menu
- `notices` - Announcements and notices
- `notifications` - Email notification queue

## User Roles

1. **Student**: Can view and manage their own data, submit requests
2. **Warden**: Can view and manage student data, approve requests
3. **Admin**: Full access to all features and user management

## Default Login Credentials

Create your first user by registering through the signup page. The first admin can be created by updating the role in the database.

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- JWT authentication
- Secure password hashing

## Email Notifications

The system automatically sends email notifications for:
- Complaint status changes
- Room allocation updates
- Fee payment confirmations

Notifications are handled via Supabase Edge Functions.

## License

MIT
