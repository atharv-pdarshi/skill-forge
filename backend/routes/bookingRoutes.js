const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// All booking routes are protected
router.use(authMiddleware); 

// Create a new booking request
router.post('/', bookingController.createBooking);

// Get bookings made by the logged-in student
router.get('/student', bookingController.getStudentBookings);

// Get bookings received by the logged-in provider for their skills
router.get('/provider', bookingController.getProviderBookings);

// Update a booking's status
router.patch('/:bookingId/status', bookingController.updateBookingStatus);


module.exports = router;