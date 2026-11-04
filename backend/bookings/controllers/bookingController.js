
const initializeDb = require('../../database/database.js');


const getMyBookings = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const { email } = request.user;
        const { date, startDate, endDate } = request.query;

        // Validate date filter inputs
        const isValidDate = (value) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return false;
            }

            const parsedDate = new Date(`${value}T00:00:00Z`);

            return !Number.isNaN(parsedDate.getTime()) &&
                parsedDate.toISOString().slice(0, 10) === value;
        };

        if (date && (startDate || endDate)) {
            return response.status(400).send({
                message: 'Use either date or startDate/endDate, not both'
            });
        }

        if (date && !isValidDate(date)) {
            return response.status(400).send({
                message: 'Invalid date. Use YYYY-MM-DD'
            });
        }

        if ((startDate && !isValidDate(startDate)) ||
            (endDate && !isValidDate(endDate))) {
            return response.status(400).send({
                message: 'Invalid date range format. Use YYYY-MM-DD'
            });
        }

        if (startDate && endDate && startDate > endDate) {
            return response.status(400).send({
                message: 'startDate cannot be after endDate'
            });
        }

        const getUserQuery = `
            SELECT id FROM users
            WHERE email = ?
        `;

        const user = await db.get(getUserQuery, [email]);

        if (!user) {
            return response.status(404).send({
                message: 'User not found'
            });
        }

        let getBookingsQuery = `
            SELECT
                bookings.id,
                resources.name AS resource_name,
                resources.type AS resource_type,
                bookings.booking_date,
                bookings.start_time,
                bookings.end_time,
                bookings.status
            FROM bookings
            INNER JOIN resources
                ON bookings.resource_id = resources.id
            WHERE bookings.user_id = ?
        `;

        const params = [user.id];

        if (date) {
            getBookingsQuery += ` AND bookings.booking_date = ?`;
            params.push(date);
        } else {
            if (startDate) {
                getBookingsQuery += ` AND bookings.booking_date >= ?`;
                params.push(startDate);
            }

            if (endDate) {
                getBookingsQuery += ` AND bookings.booking_date <= ?`;
                params.push(endDate);
            }
        }

        getBookingsQuery += `
            ORDER BY bookings.booking_date DESC,
                     bookings.start_time DESC
        `;

        const bookings = await db.all(
            getBookingsQuery,
            params
        );

        return response.status(200).send(bookings);

    } catch (error) {
        console.log(`Get Bookings Error: ${error.message}`);

        return response.status(500).send({
            message: 'Internal Server Error'
        });
    }
};




const getAllResources = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const { type, sort } = request.query;

        // 1. Pagination values
        const page = Number(request.query.page) || 1;
        const limit = Number(request.query.limit) || 10;

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            return response.status(400).send({
                message: 'Page must be positive and limit must be between 1 and 100'
            });
        }

        const offset = (page - 1) * limit;

        // 2. Build the query
        let query = `
            SELECT id, name, type, location, capacity, status
            FROM resources
        `;

        const params = [];

        // Filter by resource type
        if (type && type.trim()) {
            query += ` WHERE LOWER(type) = LOWER(?)`;
            params.push(type.trim());
        }

        // Sort by capacity
        if (sort === 'asc') {
            query += ` ORDER BY capacity ASC`;
        } else if (sort === 'desc') {
            query += ` ORDER BY capacity DESC`;
        }

        // 3. Add pagination
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // 4. Execute query
        const resources = await db.all(query, params);

        return response.status(200).send({
            page,
            limit,
            resources
        });

    } catch (error) {
        console.log(`Get Resources Error: ${error.message}`);

        return response.status(500).send({
            message: 'Internal Server Error'
        });
    }
};





const createBooking = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        // 1. Get booking details from request body
        const { resourceId, bookingDate, startTime, endTime } = request.body;

        // 2. Validate required fields
        if (!resourceId || !bookingDate || !startTime || !endTime) {
            return response.status(400).send({
                message: 'All booking fields are required'
            });
        }

        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return response.status(400).send({
                message: 'Invalid resource ID'
            });
        }

        // Validate date format and real calendar date (YYYY-MM-DD)
        const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bookingDate);

        if (!dateMatch) {
            return response.status(400).send({
                message: 'Booking date must use YYYY-MM-DD format'
            });
        }

        const year = Number(dateMatch[1]);
        const month = Number(dateMatch[2]);
        const day = Number(dateMatch[3]);
        const dateCheck = new Date(Date.UTC(year, month - 1, day));

        if (
            dateCheck.getUTCFullYear() !== year ||
            dateCheck.getUTCMonth() !== month - 1 ||
            dateCheck.getUTCDate() !== day
        ) {
            return response.status(400).send({
                message: 'Invalid booking date'
            });
        }

        const isValidTime = (time) =>
            typeof time === 'string' &&
            /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

        if (!isValidTime(startTime) || !isValidTime(endTime)) {
            return response.status(400).send({
                message: 'Times must use HH:MM format'
            });
        }

        if (startTime >= endTime) {
            return response.status(400).send({
                message: 'End time must be after start time'
            });
        }

        // 3. Find the logged-in user using the verified JWT email
        const user = await db.get(
            'SELECT id FROM users WHERE email = ?',
            [request.user.email]
        );

        if (!user) {
            return response.status(404).send({
                message: 'User not found'
            });
        }

        // 4. Check whether the resource exists and is available
        const resource = await db.get(
            'SELECT id, name, status FROM resources WHERE id = ?',
            [resourceId]
        );

        if (!resource) {
            return response.status(404).send({
                message: 'Resource not found'
            });
        }

        if (resource.status !== 'available') {
            return response.status(400).send({
                message: 'Resource is currently unavailable'
            });
        }

        // 5. Reject overlapping active bookings
        const conflict = await db.get(
            `SELECT id FROM bookings
             WHERE resource_id = ?
               AND booking_date = ?
               AND status = 'booked'
               AND start_time < ?
               AND end_time > ?`,
            [resourceId, bookingDate, endTime, startTime]
        );

        if (conflict) {
            return response.status(409).send({
                message: 'Resource is already booked for this time slot'
            });
        }

        // 6. Create the booking
        const result = await db.run(
            `INSERT INTO bookings
                (user_id, resource_id, booking_date, start_time, end_time)
             VALUES (?, ?, ?, ?, ?)`,
            [user.id, resourceId, bookingDate, startTime, endTime]
        );

        return response.status(201).send({
            message: 'Booking created successfully',
            bookingId: result.lastID,
            resourceId,
            bookingDate,
            startTime,
            endTime,
            status: 'booked'
        });

    } catch (error) {
        console.log(`Create Booking Error: ${error.message}`);

        return response.status(500).send({
            message: 'Internal Server Error'
        });
    }
};


const cancelBooking = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const bookingId = Number(request.params.id);
        const email = request.user.email;

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return response.status(400).send({
                message: 'Invalid booking ID'
            });
        }

        // Find the logged-in user's ID
        const user = await db.get(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return response.status(404).send({
                message: 'User not found'
            });
        }

        // Find a booking that belongs to this user
        const booking = await db.get(
            `SELECT id, status FROM bookings
             WHERE id = ? AND user_id = ?`,
            [bookingId, user.id]
        );

        if (!booking) {
            return response.status(404).send({
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'booked') {
            return response.status(400).send({
                message: 'Booking is already cancelled'
            });
        }

        // Cancel the booking
        await db.run(
            `UPDATE bookings
             SET status = 'cancelled'
             WHERE id = ? AND user_id = ? AND status = 'booked'`,
            [bookingId, user.id]
        );

        return response.status(200).send({
            message: 'Booking cancelled successfully',
            bookingId,
            status: 'cancelled'
        });

    } catch (error) {
        console.log(`Cancel Booking Error: ${error.message}`);

        return response.status(500).send({
            message: 'Internal Server Error'
        });
    }
};



const updateBooking = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const bookingId = Number(request.params.id);
        const { bookingDate, startTime, endTime } = request.body;
        const email = request.user.email;

        // 1. Validate booking ID
        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return response.status(400).send({
                message: "Invalid booking ID"
            });
        }

        // 2. Validate request body
        if (!bookingDate || !startTime || !endTime) {
            return response.status(400).send({
                message: "Booking date, start time and end time are required"
            });
        }

        // 3. Validate date format and actual date
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const date = new Date(`${bookingDate}T00:00:00Z`);

        if (
            !datePattern.test(bookingDate) ||
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== bookingDate
        ) {
            return response.status(400).send({
                message: "Invalid booking date. Use YYYY-MM-DD"
            });
        }

        // 4. Validate time format
        const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

        if (
            !timePattern.test(startTime) ||
            !timePattern.test(endTime) ||
            startTime >= endTime
        ) {
            return response.status(400).send({
                message: "Invalid time. Use HH:MM and ensure start time is before end time"
            });
        }

        // 5. Find logged-in user
        const user = await db.get(
            `SELECT id FROM users WHERE email = ?`,
            [email]
        );

        if (!user) {
            return response.status(404).send({
                message: "User not found"
            });
        }

        // 6. Find booking belonging to this user
        const booking = await db.get(
            `SELECT id, resource_id, status
             FROM bookings
             WHERE id = ? AND user_id = ?`,
            [bookingId, user.id]
        );

        if (!booking) {
            return response.status(404).send({
                message: "Booking not found"
            });
        }

        if (booking.status !== "booked") {
            return response.status(400).send({
                message: "Cancelled bookings cannot be updated"
            });
        }

        // 7. Check resource availability
        const resource = await db.get(
            `SELECT id, status FROM resources WHERE id = ?`,
            [booking.resource_id]
        );

        if (!resource || resource.status !== "available") {
            return response.status(409).send({
                message: "Resource is not available"
            });
        }

        // 8. Check overlapping bookings, excluding current booking
        const conflictingBooking = await db.get(
            `SELECT id FROM bookings
             WHERE resource_id = ?
               AND booking_date = ?
               AND status = 'booked'
               AND id != ?
               AND start_time < ?
               AND end_time > ?`,
            [
                booking.resource_id,
                bookingDate,
                bookingId,
                endTime,
                startTime
            ]
        );

        if (conflictingBooking) {
            return response.status(409).send({
                message: "Resource is already booked for this time"
            });
        }

        // 9. Update booking
        await db.run(
            `UPDATE bookings
             SET booking_date = ?, start_time = ?, end_time = ?
             WHERE id = ? AND user_id = ? AND status = 'booked'`,
            [bookingDate, startTime, endTime, bookingId, user.id]
        );

        return response.status(200).send({
            message: "Booking updated successfully",
            bookingId,
            bookingDate,
            startTime,
            endTime,
            status: "booked"
        });

    } catch (error) {
        console.log(`Update Booking Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};


const getResourceById = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const resourceId = Number(request.params.id);

        // Validate resource ID
        if (!Number.isInteger(resourceId) || resourceId <= 0) {
            return response.status(400).send({
                message: "Invalid resource ID"
            });
        }

        // Get resource from database
        const resource = await db.get(
            `SELECT * FROM resources WHERE id = ?`,
            [resourceId]
        );

        // Check whether resource exists
        if (!resource) {
            return response.status(404).send({
                message: "Resource not found"
            });
        }

        return response.status(200).send(resource);

    } catch (error) {
        console.log(`Get Resource Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};



const checkResourceAvailability = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const { resourceId, bookingDate, startTime, endTime } = request.query;

        // 1. Validate required parameters
        if (!resourceId || !bookingDate || !startTime || !endTime) {
            return response.status(400).send({
                message: "resourceId, bookingDate, startTime and endTime are required"
            });
        }

        // 2. Validate resource ID
        const id = Number(resourceId);

        if (!Number.isInteger(id) || id <= 0) {
            return response.status(400).send({
                message: "Invalid resource ID"
            });
        }

        // 3. Validate date
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const date = new Date(`${bookingDate}T00:00:00Z`);

        if (
            !datePattern.test(bookingDate) ||
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== bookingDate
        ) {
            return response.status(400).send({
                message: "Invalid booking date. Use YYYY-MM-DD"
            });
        }

        // 4. Validate times
        const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

        if (
            !timePattern.test(startTime) ||
            !timePattern.test(endTime) ||
            startTime >= endTime
        ) {
            return response.status(400).send({
                message: "Invalid time. Use HH:MM and ensure startTime is before endTime"
            });
        }

        // 5. Check whether the resource exists
        const resource = await db.get(
            `SELECT id, name, status FROM resources WHERE id = ?`,
            [id]
        );

        if (!resource) {
            return response.status(404).send({
                message: "Resource not found"
            });
        }

        if (resource.status !== "available") {
            return response.status(200).send({
                resourceId: id,
                resourceName: resource.name,
                bookingDate,
                startTime,
                endTime,
                available: false,
                message: "Resource is unavailable"
            });
        }

        // 6. Check for overlapping bookings
        const conflictingBooking = await db.get(
            `SELECT id FROM bookings
             WHERE resource_id = ?
               AND booking_date = ?
               AND status = 'booked'
               AND start_time < ?
               AND end_time > ?`,
            [id, bookingDate, endTime, startTime]
        );

        // 7. Return availability
        if (conflictingBooking) {
            return response.status(200).send({
                resourceId: id,
                resourceName: resource.name,
                bookingDate,
                startTime,
                endTime,
                available: false,
                message: "Resource is already booked for this time"
            });
        }

        return response.status(200).send({
            resourceId: id,
            resourceName: resource.name,
            bookingDate,
            startTime,
            endTime,
            available: true,
            message: "Resource is available for this time"
        });

    } catch (error) {
        console.log(`Check Availability Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};


const searchResources = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const { name } = request.query;

        // 1. Validate search input
        if (!name || !name.trim()) {
            return response.status(400).send({
                message: "Resource name is required"
            });
        }

        // 2. Search resources by name
        const searchQuery = `
            SELECT *
            FROM resources
            WHERE name LIKE ?
        `;

        const resources = await db.all(searchQuery, [
            `%${name.trim()}%`
        ]);

        // 3. Handle no matching resources
        if (resources.length === 0) {
            return response.status(404).send({
                message: "No resources found"
            });
        }

        // 4. Return matching resources
        return response.status(200).send(resources);

    } catch (error) {
        console.log(`Search Resources Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};


const getBookingAnalytics = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const analyticsQuery = `
            SELECT
                COUNT(*) AS totalBookings,
                SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) AS activeBookings,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelledBookings
            FROM bookings
        `;

        const analytics = await db.get(analyticsQuery);

        return response.status(200).send(analytics);

    } catch (error) {
        console.log(`Booking Analytics Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};



const getBookingAnalyticsByDateRange = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const { startDate, endDate } = request.query;

        const isValidDate = (value) => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
                return false;
            }

            const parsedDate = new Date(`${value}T00:00:00Z`);

            return !Number.isNaN(parsedDate.getTime()) &&
                parsedDate.toISOString().slice(0, 10) === value;
        };

        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return response.status(400).send({
                message: "Provide valid startDate and endDate in YYYY-MM-DD format"
            });
        }

        if (startDate > endDate) {
            return response.status(400).send({
                message: "startDate cannot be after endDate"
            });
        }

        const analyticsQuery = `
            SELECT
                COUNT(*) AS totalBookings,
                COALESCE(SUM(
                    CASE WHEN status = 'booked' THEN 1 ELSE 0 END
                ), 0) AS activeBookings,
                COALESCE(SUM(
                    CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END
                ), 0) AS cancelledBookings
            FROM bookings
            WHERE booking_date >= ?
              AND booking_date <= ?
        `;

        const analytics = await db.get(analyticsQuery, [
            startDate,
            endDate
        ]);

        return response.status(200).send(analytics);

    } catch (error) {
        console.log(`Date Range Analytics Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};



const getResourceUsageAnalytics = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const usageQuery = `
            SELECT
                resources.id AS resourceId,
                resources.name AS resourceName,
                COUNT(bookings.id) AS totalBookings
            FROM resources
            LEFT JOIN bookings
                ON resources.id = bookings.resource_id
                AND bookings.status = 'booked'
            GROUP BY resources.id, resources.name
            ORDER BY totalBookings DESC
        `;

        const usage = await db.all(usageQuery);

        return response.status(200).send(usage);

    } catch (error) {
        console.log(`Resource Usage Analytics Error: ${error.message}`);

        return response.status(500).send({
            message: "Internal Server Error"
        });
    }
};


const createResource = async (request, response) => {
    try {
        const db = initializeDb.getDb();
        const { name, type, location, capacity } = request.body;

        if (!name || !type || capacity === undefined ||
            !Number.isInteger(capacity) || capacity <= 0) {
            return response.status(400).send(
                "Valid name, type and positive integer capacity are required"
            );
        }

        const insertResourceQuery = `
            INSERT INTO resources (name, type, location, capacity)
            VALUES (?, ?, ?, ?)
        `;

        const result = await db.run(insertResourceQuery, [
            name,
            type,
            location || null,
            capacity
        ]);

        return response.status(201).send({
            message: "Resource Created Successfully",
            resourceId: result.lastID
        });
    } catch (error) {
        console.log(`Create Resource Error: ${error.message}`);
        return response.status(500).send("Internal Server Error");
    }
};



const updateResource = async (request, response) => {
    try {
        const db = initializeDb.getDb();
        const { id } = request.params;
        const { name, type, location, capacity, status } = request.body;

        if (!name || !type || capacity === undefined ||
            !Number.isInteger(capacity) || capacity <= 0) {
            return response.status(400).send(
                "Valid name, type and positive integer capacity are required"
            );
        }

        if (status !== undefined &&
            !['available', 'unavailable'].includes(status)) {
            return response.status(400).send("Invalid resource status");
        }

        const existingResource = await db.get(
            "SELECT id FROM resources WHERE id = ?",
            [id]
        );

        if (!existingResource) {
            return response.status(404).send("Resource Not Found");
        }

        await db.run(
            `UPDATE resources
             SET name = ?, type = ?, location = ?, capacity = ?,
                 status = COALESCE(?, status)
             WHERE id = ?`,
            [name, type, location || null, capacity, status ?? null, id]
        );

        return response.status(200).send("Resource Updated Successfully");
    } catch (error) {
        console.log(`Update Resource Error: ${error.message}`);
        return response.status(500).send("Internal Server Error");
    }
};



const deleteResource = async (request, response) => {
    try {
        const db = initializeDb.getDb();
        const { id } = request.params;

        // Check whether the resource exists
        const existingResource = await db.get(
            "SELECT id FROM resources WHERE id = ?",
            [id]
        );

        if (!existingResource) {
            return response.status(404).send("Resource Not Found");
        }

        // Check whether bookings reference this resource
        const existingBooking = await db.get(
            "SELECT id FROM bookings WHERE resource_id = ? LIMIT 1",
            [id]
        );

        if (existingBooking) {
            return response.status(409).send(
                "Cannot delete this resource because bookings reference it"
            );
        }

        // Delete the resource
        await db.run(
            "DELETE FROM resources WHERE id = ?",
            [id]
        );

        return response.status(200).send(
            "Resource Deleted Successfully"
        );
    } catch (error) {
        console.log(`Delete Resource Error: ${error.message}`);
        return response.status(500).send("Internal Server Error");
    }
};


const getAllBookings = async (request, response) => {
    try {
        const db = initializeDb.getDb();

        const getAllBookingsQuery = `
            SELECT
                bookings.id AS bookingId,
                users.id AS userId,
                users.name AS userName,
                users.email AS userEmail,
                resources.id AS resourceId,
                resources.name AS resourceName,
                resources.type AS resourceType,
                bookings.booking_date AS bookingDate,
                bookings.start_time AS startTime,
                bookings.end_time AS endTime,
                bookings.status AS status,
                bookings.created_at AS createdAt
            FROM bookings
            INNER JOIN users
                ON bookings.user_id = users.id
            INNER JOIN resources
                ON bookings.resource_id = resources.id
            ORDER BY bookings.booking_date DESC,
                     bookings.start_time ASC;
        `;

        const bookings = await db.all(getAllBookingsQuery);

        return response.status(200).send({
            totalBookings: bookings.length,
            bookings: bookings
        });
    } catch (error) {
        console.log(`Get All Bookings Error: ${error.message}`);
        return response.status(500).send("Internal Server Error");
    }
};



module.exports = {
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
};
