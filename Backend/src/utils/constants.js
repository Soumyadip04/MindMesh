// Time slots for classroom booking
export const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00", 
  "11:00-12:00",
  "12:00-13:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00"
];

// Staff rooms that cannot be booked
export const STAFF_ROOMS = ['CSE-103', 'CSE-104', 'CSE-203'];

// Room status constants
export const ROOM_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied', 
  EXTRA: 'extra'
};

// Booking status constants
export const BOOKING_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student', 
  FACULTY: 'faculty'
};
