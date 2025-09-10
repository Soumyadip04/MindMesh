// Booking utility functions for frontend operations

export interface BookingData {
  roomNumber: string;
  date: string;
  timeSlot: string;
  batchName: string;
  teacherName?: string;
  courseName?: string;
}

// Create a new booking
export async function createBooking(bookingData: BookingData) {
  const response = await fetch('/api/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }

  return response.json();
}

// Delete a booking
export async function deleteBooking(roomNumber: string, date: string, timeSlot: string) {
  const params = new URLSearchParams({
    roomNumber,
    date,
    timeSlot,
  });

  const response = await fetch(`/api/schedule?${params.toString()}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete booking');
  }

  return response.json();
}

// Get schedule for a specific date
export async function getScheduleForDate(date: string) {
  const params = new URLSearchParams({ date });
  const response = await fetch(`/api/schedule?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }

  return response.json();
}

// Get today's schedule
export async function getTodaySchedule() {
  const response = await fetch('/api/schedule');

  if (!response.ok) {
    throw new Error('Failed to fetch today\'s schedule');
  }

  return response.json();
}
