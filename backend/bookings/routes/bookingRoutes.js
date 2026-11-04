
const express = require('express');
const router = express.Router();

// Controllers
const {
    getMyBookings,
    getAllResources,
    createBooking,
    cancelBooking,
    updateBooking,
    getResourceById,
    checkResourceAvailability,
    searchResources,
    getBookingAnalytics,
    getBookingAnalyticsByDateRange,
    getResourceUsageAnalytics,
    createResource,
    updateResource,
    deleteResource,
    getAllBookings
} = require('../controllers/bookingController.js');

// Middlewares

const authenticateToken = require('../../authentication/middlewares/authMiddleware.js');
const { authorizeAdmin } = require('../../authentication/middlewares/authMiddleware.js');


// ========================================
// USER BOOKING ROUTES
// ========================================

// Get logged-in user's bookings
router.get('/my-bookings', authenticateToken, getMyBookings);

// Create a booking
router.post('/resources/book', authenticateToken, createBooking);

// Cancel a booking
router.patch('/bookings/:id/cancel', authenticateToken, cancelBooking);

// Update a booking
router.put('/bookings/:id', authenticateToken, updateBooking);


// ========================================
// RESOURCE ROUTES
// ========================================

// Get all resources
router.get('/resources', getAllResources);

// Check resource availability
router.get('/resources/availability', checkResourceAvailability);

// Search resources
router.get('/resources/search', searchResources);

// Get resource by ID
router.get('/resources/:id', getResourceById);


// ========================================
// ADMIN ANALYTICS ROUTES
// ========================================

// Get overall booking analytics
router.get(
    '/analytics/bookings',
    authenticateToken,
    authorizeAdmin,
    getBookingAnalytics
);

// Get booking analytics by date range
router.get(
    '/analytics/bookings/date-range',
    authenticateToken,
    authorizeAdmin,
    getBookingAnalyticsByDateRange
);

// Get resource usage analytics
router.get(
    '/analytics/resources',
    authenticateToken,
    authorizeAdmin,
    getResourceUsageAnalytics
);


// ========================================
// ADMIN RESOURCE MANAGEMENT ROUTES
// ========================================

// Create a resource
router.post(
    '/admin/resources',
    authenticateToken,
    authorizeAdmin,
    createResource
);

// Update a resource
router.put(
    '/admin/resources/:id',
    authenticateToken,
    authorizeAdmin,
    updateResource
);

// Delete a resource
router.delete(
    '/admin/resources/:id',
    authenticateToken,
    authorizeAdmin,
    deleteResource
);


// ========================================
// ADMIN BOOKING MANAGEMENT ROUTES
// ========================================

// Get all bookings
router.get(
    '/admin/bookings',
    authenticateToken,
    authorizeAdmin,
    getAllBookings
);


module.exports = router;
