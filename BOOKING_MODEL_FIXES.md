# Booking Model Fixes

## Overview
The booking system has been completely overhauled to use a proper database-backed model instead of the previous in-memory storage approach.

## Changes Made

### 1. Backend Changes

#### New Booking Model (`Backend/src/models/booking.model.js`)
- Created a comprehensive Mongoose schema for bookings
- Added unique constraint for room/date/timeSlot combination
- Included proper validation and indexing
- Added status field ('active' or 'cancelled')
- Added timestamps for auditing

#### New Booking Routes (`Backend/src/routes/booking.route.js`)
- Full CRUD operations for bookings
- GET `/api/v1/bookings` - List all bookings with filters
- POST `/api/v1/bookings` - Create new booking
- PUT `/api/v1/bookings/:id` - Update booking
- DELETE `/api/v1/bookings/:id` - Cancel booking (soft delete)
- GET `/api/v1/bookings/schedule/:date` - Get schedule for specific date

#### Constants File (`Backend/src/utils/constants.js`)
- Centralized time slots definition
- Staff rooms configuration
- Status constants

#### Updated App Configuration (`Backend/src/app.js`)
- Added booking routes to Express app

### 2. Frontend Changes

#### Updated Types (`src/types/index.ts`)
- Enhanced Booking interface to match backend model
- Added proper status types
- Added optional audit fields

#### Updated API Routes (`src/app/api/schedule/route.ts`)
- Modified to use new backend booking API
- Hybrid approach: combines database bookings with recurring schedule
- Proper error handling and fallbacks

#### Environment Configuration (`.env.local`)
- Added BACKEND_URL configuration
- Prepared for production deployment

## Key Features

### Data Persistence
- All bookings are now stored in MongoDB database
- No more data loss on server restart
- Proper data validation and constraints

### Conflict Prevention
- Unique database constraint prevents double bookings
- Staff room protection
- Recurring class conflict detection
- Future date validation

### Audit Trail
- Created/updated timestamps
- Optional user tracking (createdBy field)
- Soft delete (cancellation) instead of hard delete

### API Consistency
- RESTful API design
- Consistent error responses
- Proper HTTP status codes
- JSON response format

## Database Schema

```javascript
{
  roomNumber: String,        // e.g., "CSE-101"
  date: String,             // ISO date "YYYY-MM-DD"
  timeSlot: String,         // e.g., "09:00-10:00"
  batchName: String,        // Required
  teacherName: String,      // Optional
  courseName: String,       // Optional
  teacher: ObjectId,        // Optional Faculty reference
  createdBy: ObjectId,      // Optional User reference
  status: String,           // "active" | "cancelled"
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Create a Booking
```bash
# Frontend API (Next.js)
curl -X POST http://localhost:3000/api/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "CSE-101",
    "date": "2025-09-12",
    "timeSlot": "09:00-10:00",
    "batchName": "CS2024A",
    "teacherName": "Dr. Smith",
    "courseName": "Computer Science 101"
  }'
```

### Get Schedule for a Date
```bash
curl "http://localhost:3000/api/schedule?date=2025-09-12"
```

### Cancel a Booking
```bash
curl -X DELETE "http://localhost:3000/api/schedule?date=2025-09-12&roomNumber=CSE-101&timeSlot=09:00-10:00"
```

## UI Features

### Delete Booking Functionality
- **Admin Dashboard**: Full delete capability with confirmation dialogs
- **Room Bookings Modal**: Shows delete buttons for each booking
- **Booking Details Card**: Individual delete buttons with loading states
- **Visual Feedback**: Loading spinners, success/error toasts
- **Confirmation**: "Are you sure?" prompts before deletion

### Components Enhanced
1. **BookingDetailsCard**: Added delete button and confirmation
2. **RoomBookingsModal**: Added delete functionality per booking
3. **Admin Page**: Full CRUD operations with mutations
4. **Booking Utils**: Utility functions for all operations

## Migration Notes

The system maintains backward compatibility by:
1. Still supporting the existing frontend components
2. Hybrid schedule fetching (database + recurring classes)
3. Graceful fallback to in-memory data if backend is unavailable

## Testing

To test the system:
1. Start the backend server: `cd Backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Use the booking forms in the application
4. Verify bookings persist across server restarts
5. Test conflict detection by attempting duplicate bookings

## Future Enhancements

- User authentication integration
- Booking approval workflows
- Email notifications
- Recurring booking patterns
- Room capacity management
- Report generation
