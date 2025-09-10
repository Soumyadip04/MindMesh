import { Router } from "express";
import { Booking } from "../models/booking.model.js";
import { TIME_SLOTS } from "../utils/constants.js"; // We'll need to create this

const router = Router();

// Helper function to validate weekday (Monday-Friday only)
const isValidWeekday = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
};

// Helper function to check if date is not in the past
const isValidFutureDate = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(dateString);
  return bookingDate >= today;
};

// Helper function to check if room is staff room
const isStaffRoom = (roomNumber) => {
  const staffRooms = ['CSE-103', 'CSE-104', 'CSE-203'];
  return staffRooms.includes(roomNumber);
};

// GET /api/bookings - Get all bookings or filter by date/room
router.get("/", async (req, res) => {
  try {
    const { date, roomNumber, status = 'active' } = req.query;
    
    const filter = { status };
    if (date) filter.date = date;
    if (roomNumber) filter.roomNumber = roomNumber;

    const bookings = await Booking.find(filter)
      .populate('teacher', 'name')
      .populate('createdBy', 'name email')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// POST /api/bookings - Create a new booking
router.post("/", async (req, res) => {
  try {
    const { 
      roomNumber, 
      date, 
      timeSlot, 
      batchName, 
      teacherName, 
      courseName, 
      teacher, 
      createdBy 
    } = req.body;

    // Validate required fields
    if (!roomNumber || !date || !timeSlot || !batchName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: roomNumber, date, timeSlot, batchName"
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // Validate future weekday
    if (!isValidFutureDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Booking date must be today or in the future"
      });
    }

    if (!isValidWeekday(date)) {
      return res.status(400).json({
        success: false,
        message: "Bookings are only allowed on weekdays (Monday-Friday)"
      });
    }

    // Check if time slot is valid
    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot"
      });
    }

    // Check if room is staff room
    if (isStaffRoom(roomNumber)) {
      return res.status(409).json({
        success: false,
        message: "This room is reserved for Teachers Department CSE-AI"
      });
    }

    // Check for existing booking (handled by unique index, but we can provide better error)
    const existingBooking = await Booking.findOne({
      roomNumber,
      date,
      timeSlot,
      status: 'active'
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Room is already booked for this time slot"
      });
    }

    // Create new booking
    const booking = new Booking({
      roomNumber,
      date,
      timeSlot,
      batchName,
      teacherName,
      courseName,
      teacher,
      createdBy
    });

    const savedBooking = await booking.save();
    await savedBooking.populate('teacher', 'name');
    await savedBooking.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: savedBooking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    
    // Handle unique constraint violation
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Room is already booked for this time slot"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// PUT /api/bookings/:id - Update a booking
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow changing core booking identifiers
    delete updateData.roomNumber;
    delete updateData.date;
    delete updateData.timeSlot;

    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacher', 'name').populate('createdBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// DELETE /api/bookings/:id - Cancel a booking
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// GET /api/bookings/schedule/:date - Get schedule for a specific date
router.get("/schedule/:date", async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    const bookings = await Booking.find({
      date,
      status: 'active'
    }).populate('teacher', 'name');

    // Transform to the format expected by frontend
    const schedule = {};
    bookings.forEach(booking => {
      if (!schedule[booking.roomNumber]) {
        schedule[booking.roomNumber] = {};
      }
      schedule[booking.roomNumber][booking.timeSlot] = {
        batchName: booking.batchName,
        teacherName: booking.teacherName,
        courseName: booking.courseName,
        id: booking._id
      };
    });

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;
