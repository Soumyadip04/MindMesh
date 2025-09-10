// Simple test script for booking API functionality
// Run this with Node.js after starting your Next.js dev server

const API_BASE = 'http://localhost:3000/api/schedule';

async function testBookingAPI() {
  console.log('🧪 Testing Booking API...\n');

  try {
    // Test 1: Get today's schedule
    console.log('1. Testing GET /api/schedule (today)');
    const getTodayResponse = await fetch(API_BASE);
    const todayData = await getTodayResponse.json();
    console.log('✅ Today schedule:', Object.keys(todayData).length, 'rooms found\n');

    // Test 2: Get schedule for a specific date
    const testDate = '2025-09-12'; // Future weekday
    console.log('2. Testing GET /api/schedule with date:', testDate);
    const getDateResponse = await fetch(`${API_BASE}?date=${testDate}`);
    const dateData = await getDateResponse.json();
    console.log('✅ Date schedule:', Object.keys(dateData).length, 'rooms found\n');

    // Test 3: Create a booking
    console.log('3. Testing POST /api/schedule (create booking)');
    const bookingData = {
      roomNumber: 'CSE-101',
      date: testDate,
      timeSlot: '09:00-10:00',
      batchName: 'TEST-BATCH',
      teacherName: 'Test Teacher',
      courseName: 'Test Course'
    };

    const createResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Booking created successfully:', createResult.data?.bookingId);
      console.log('   Room:', createResult.data?.roomNumber);
      console.log('   Time:', createResult.data?.timeSlot);
      console.log('   Batch:', createResult.data?.batchName, '\n');

      // Test 4: Verify booking exists
      console.log('4. Testing booking verification');
      const verifyResponse = await fetch(`${API_BASE}?date=${testDate}`);
      const verifyData = await verifyResponse.json();
      const roomSchedule = verifyData[bookingData.roomNumber];
      const booking = roomSchedule?.[bookingData.timeSlot];

      if (booking && booking.batchName === bookingData.batchName) {
        console.log('✅ Booking verified in schedule\n');
      } else {
        console.log('❌ Booking not found in schedule\n');
      }

      // Test 5: Delete the booking
      console.log('5. Testing DELETE /api/schedule (cancel booking)');
      const deleteParams = new URLSearchParams({
        date: testDate,
        roomNumber: bookingData.roomNumber,
        timeSlot: bookingData.timeSlot
      });

      const deleteResponse = await fetch(`${API_BASE}?${deleteParams.toString()}`, {
        method: 'DELETE'
      });

      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.json();
        console.log('✅ Booking deleted successfully:', deleteResult.success);

        // Test 6: Verify booking is gone
        console.log('6. Testing booking deletion verification');
        const verifyDeleteResponse = await fetch(`${API_BASE}?date=${testDate}`);
        const verifyDeleteData = await verifyDeleteResponse.json();
        const updatedRoomSchedule = verifyDeleteData[bookingData.roomNumber];
        const deletedBooking = updatedRoomSchedule?.[bookingData.timeSlot];

        if (!deletedBooking) {
          console.log('✅ Booking successfully removed from schedule\n');
        } else {
          console.log('❌ Booking still exists after deletion\n');
        }
      } else {
        const deleteError = await deleteResponse.json();
        console.log('❌ Delete failed:', deleteError.error, '\n');
      }

    } else {
      const createError = await createResponse.json();
      console.log('❌ Create failed:', createError.error, '\n');
    }

    // Test 7: Error cases
    console.log('7. Testing error cases');
    
    // Test invalid date
    const invalidDateResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomNumber: 'CSE-101',
        date: '2020-01-01', // Past date
        timeSlot: '09:00-10:00',
        batchName: 'ERROR-TEST'
      })
    });
    
    if (!invalidDateResponse.ok) {
      const errorData = await invalidDateResponse.json();
      console.log('✅ Past date correctly rejected:', errorData.error);
    }

    // Test staff room
    const staffRoomResponse = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomNumber: 'CSE-103', // Staff room
        date: testDate,
        timeSlot: '10:00-11:00',
        batchName: 'STAFF-TEST'
      })
    });

    if (!staffRoomResponse.ok) {
      const errorData = await staffRoomResponse.json();
      console.log('✅ Staff room correctly rejected:', errorData.error);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBookingAPI();
}

export { testBookingAPI };
