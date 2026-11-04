
import { useState, useEffect } from 'react';

// Get today's date in YYYY-MM-DD format using local date values
const getTodayDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const Resources = () => {
    // Resource states
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Search and filter states
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Booking states
    const [selectedResource, setSelectedResource] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);

    // Fetch resources from backend
    useEffect(() => {
        const getResources = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/resources'
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch resources.');
                }

                const data = await response.json();

                setResources(data.resources || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getResources();
    }, []);

    // Get available resource types dynamically
    const resourceTypes = [
        'All',
        ...new Set(resources.map((resource) => resource.type))
    ];

    // Search and filter resources
    const filteredResources = resources.filter((resource) => {
        const matchesSearch = resource.name
            .toLowerCase()
            .includes(searchText.toLowerCase());

        const matchesType =
            selectedType === 'All' ||
            resource.type === selectedType;

        const matchesStatus =
            selectedStatus === 'All' ||
            resource.status.toLowerCase() ===
                selectedStatus.toLowerCase();

        return matchesSearch && matchesType && matchesStatus;
    });

    // Open booking modal
    const openBookingForm = (resource) => {
        setSelectedResource(resource);
        setBookingDate('');
        setStartTime('');
        setEndTime('');
        setBookingError('');
        setBookingSuccess('');
    };

    // Close booking modal
    const closeBookingForm = () => {
        if (bookingLoading) return;

        setSelectedResource(null);
        setBookingError('');
        setBookingSuccess('');
    };

    // Submit booking
    const handleBookingSubmit = async (event) => {
        event.preventDefault();

        if (bookingLoading) return;

        // Validate booking details
        if (!bookingDate || !startTime || !endTime) {
            setBookingError('Please fill in all booking details.');
            return;
        }

        const today = getTodayDate();

        if (bookingDate < today) {
            setBookingError('Please select today or a future date.');
            return;
        }

        if (startTime >= endTime) {
            setBookingError(
                'End time must be later than start time.'
            );
            return;
        }

        // Check authentication
        const token = localStorage.getItem('jwtToken');

        if (!token) {
            setBookingError(
                'Please login before booking a resource.'
            );
            return;
        }

        setBookingError('');
        setBookingSuccess('');
        setBookingLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3000/api/resources/book',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        resourceId: selectedResource.id,
                        bookingDate,
                        startTime,
                        endTime
                    })
                }
            );

            const responseText = await response.text();

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                data = { message: responseText };
            }

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to create booking.'
                );
            }

            // Show success message
            setBookingSuccess(
                'Booking created successfully!'
            );

            // Clear booking form fields
            setBookingDate('');
            setStartTime('');
            setEndTime('');
            setBookingError('');

        } catch (err) {
            setBookingError(err.message);
        } finally {
            setBookingLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="resources-page">
                <p>Loading resources...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="resources-page">
                <p role="alert">{error}</p>
                <p>Please check whether the backend server is running.</p>
            </div>
        );
    }

    return (
        <div className="resources-page">

            <h2>Available Campus Resources</h2>

            {/* Search and Filters */}
            <div className="resource-filters">

                <input
                    type="text"
                    placeholder="Search resources by name..."
                    value={searchText}
                    onChange={(event) =>
                        setSearchText(event.target.value)
                    }
                    className="resource-search"
                    aria-label="Search resources by name"
                />

                <select
                    value={selectedType}
                    onChange={(event) =>
                        setSelectedType(event.target.value)
                    }
                    className="resource-filter"
                    aria-label="Filter by resource type"
                >
                    {resourceTypes.map((type) => (
                        <option key={type} value={type}>
                            {type === 'All'
                                ? 'All Resource Types'
                                : type}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedStatus}
                    onChange={(event) =>
                        setSelectedStatus(event.target.value)
                    }
                    className="resource-filter"
                    aria-label="Filter by availability"
                >
                    <option value="All">All Availability</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                </select>

            </div>

            {/* Resource Count */}
            <p className="resource-count">
                Showing {filteredResources.length} of {resources.length} resources
            </p>

            {/* Resource Cards */}
            {filteredResources.length === 0 ? (
                <p>No resources match your search or filters.</p>
            ) : (
                <div className="resource-list">

                    {filteredResources.map((resource) => (
                        <div
                            key={resource.id}
                            className="resource-card"
                        >

                            <div className="resource-card-header">

                                <h3>{resource.name}</h3>

                                <span
                                    className={`status-badge ${
                                        resource.status.toLowerCase() === 'available'
                                            ? 'status-available'
                                            : 'status-unavailable'
                                    }`}
                                >
                                    {resource.status}
                                </span>

                            </div>

                            <p>
                                <strong>Type:</strong> {resource.type}
                            </p>

                            <p>
                                <strong>Location:</strong> {resource.location}
                            </p>

                            <p>
                                <strong>Capacity:</strong> {resource.capacity}
                            </p>

                            <button
                                type="button"
                                className="book-resource-button"
                                disabled={
                                    resource.status.toLowerCase() !== 'available'
                                }
                                onClick={() => openBookingForm(resource)}
                            >
                                Book Resource
                            </button>

                        </div>
                    ))}

                </div>
            )}

            {/* Booking Modal */}
            {selectedResource && (
                <div className="booking-overlay">

                    <div
                        className="booking-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="booking-modal-title"
                    >

                        <div className="booking-modal-header">

                            <h2 id="booking-modal-title">
                                Book Resource
                            </h2>

                            <button
                                type="button"
                                className="close-booking-button"
                                onClick={closeBookingForm}
                                disabled={bookingLoading}
                                aria-label="Close booking form"
                            >
                                ×
                            </button>

                        </div>

                        <p className="selected-resource-name">
                            <strong>Resource:</strong> {selectedResource.name}
                        </p>

                        <form onSubmit={handleBookingSubmit}>

                            <label htmlFor="booking-date">
                                Booking Date
                            </label>

                            <input
                                id="booking-date"
                                type="date"
                                value={bookingDate}
                                min={getTodayDate()}
                                onChange={(event) =>
                                    setBookingDate(event.target.value)
                                }
                                required
                                disabled={bookingLoading}
                            />

                            <label htmlFor="start-time">
                                Start Time
                            </label>

                            <input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(event) =>
                                    setStartTime(event.target.value)
                                }
                                required
                                disabled={bookingLoading}
                            />

                            <label htmlFor="end-time">
                                End Time
                            </label>

                            <input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(event) =>
                                    setEndTime(event.target.value)
                                }
                                required
                                disabled={bookingLoading}
                            />

                            {/* Booking Error */}
                            {bookingError && (
                                <p
                                    className="booking-error"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {bookingError}
                                </p>
                            )}

                            {/* Booking Success */}
                            {bookingSuccess && (
                                <p
                                    className="booking-success"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {bookingSuccess}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="confirm-booking-button"
                                disabled={bookingLoading}
                            >
                                {bookingLoading
                                    ? 'Booking...'
                                    : 'Confirm Booking'}
                            </button>

                            <p className="booking-note">
                                Your booking will be confirmed after successful
                                availability validation.
                            </p>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Resources;
