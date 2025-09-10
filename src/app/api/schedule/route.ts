import { NextResponse } from 'next/server';
import { TIME_SLOTS, type TimeSlot, getMergedScheduleForDate, addBooking, removeBooking } from '@/lib/schedule-store';

// GET /api/schedule
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (date) {
    // Return schedule for specific date merged with recurring regular classes
    const scheduleForDate = getMergedScheduleForDate(date);
    return NextResponse.json(scheduleForDate);
  }

  // Return today's schedule if no date specified
  const today = new Date().toISOString().split('T')[0];
  const scheduleForToday = getMergedScheduleForDate(today);
  return NextResponse.json(scheduleForToday);
}

// POST /api/schedule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomNumber, timeSlot, batchName, teacherName, courseName, date } = body;

    // Validate required fields
    if (!roomNumber || !timeSlot || !batchName || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if time slot is valid
    if (!TIME_SLOTS.includes(timeSlot as TimeSlot)) {
      return NextResponse.json(
        { error: 'Invalid time slot' },
        { status: 400 }
      );
    }

    const validTimeSlot = timeSlot as TimeSlot;

    // Attempt to add the booking using the centralized function
    const result = addBooking(roomNumber, date, validTimeSlot, {
      batchName,
      teacherName,
      courseName
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: result.bookingId,
        roomNumber,
        timeSlot: validTimeSlot,
        batchName,
        teacherName,
        courseName,
        date
      }
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedule
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const roomNumber = searchParams.get('roomNumber');
    const timeSlot = searchParams.get('timeSlot') as TimeSlot | null;

    if (!date || !roomNumber || !timeSlot) {
      return NextResponse.json(
        { error: 'Missing required query params: date, roomNumber, timeSlot' },
        { status: 400 }
      );
    }

    // Validate time slot
    if (!TIME_SLOTS.includes(timeSlot)) {
      return NextResponse.json(
        { error: 'Invalid time slot' },
        { status: 400 }
      );
    }

    const removed = removeBooking(date, roomNumber, timeSlot);
    if (!removed) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
