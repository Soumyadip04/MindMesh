import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    // ISO date string in YYYY-MM-DD representing the day of the booking
    date: {
      type: String,
      required: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    // Constrained to known timeslots like "09:00-10:00"
    timeSlot: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    batchName: {
      type: String,
      required: true,
      trim: true,
    },
    teacherName: {
      type: String,
      required: false,
      trim: true,
    },
    courseName: {
      type: String,
      required: false,
      trim: true,
    },
    // Optional linkage to a teacher/faculty user if available
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: false,
    },
    // Created by user (admin/faculty/student) if you need auditing
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness per room/date/timeslot
bookingSchema.index(
  { roomNumber: 1, date: 1, timeSlot: 1 },
  { unique: true, name: "unique_room_date_slot" }
);

export const Booking = mongoose.model("Booking", bookingSchema);

