
import { useState, useEffect } from 'react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update booking states
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [updatedDate, setUpdatedDate] = useState('');
  const [updatedStartTime, setUpdatedStartTime] = useState('');
  const [updatedEndTime, setUpdatedEndTime] = useState('');

  // Action loading states
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [updatingBooking, setUpdatingBooking] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toLocaleDateString('en-CA');

  // Fetch user's bookings
  const getMyBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('jwtToken');

      if (!token) {
        throw new Error('Please login to view your bookings.');
      }

      const response = await fetch(
        'http://localhost:3000/api/my-bookings',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch your bookings.');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking?'
    );

    if (!confirmCancel) return;

    try {
      setCancellingBookingId(bookingId);
      setError('');

      const token = localStorage.getItem('jwtToken');

      if (!token) {
        throw new Error('Please login again.');
      }

      const response = await fetch(
        `http://localhost:3000/api/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        throw new Error(data.message || 'Failed to cancel booking.');
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );

      alert('Booking cancelled successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Update booking
  const handleUpdateBooking = async (bookingId) => {
    if (!updatedDate || !updatedStartTime || !updatedEndTime) {
      setError('Please fill in all booking details.');
      return;
    }

    if (updatedDate < today) {
      setError('Please select today or a future date.');
      return;
    }

    if (updatedStartTime >= updatedEndTime) {
      setError('End time must be later than start time.');
      return;
    }

    try {
      setUpdatingBooking(true);
      setError('');

      const token = localStorage.getItem('jwtToken');

      if (!token) {
        throw new Error('Please login again.');
      }

      const response = await fetch(
        `http://localhost:3000/api/bookings/${bookingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingDate: updatedDate,
            startTime: updatedStartTime,
            endTime: updatedEndTime,
          }),
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
        throw new Error(data.message || 'Failed to update booking.');
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                booking_date: updatedDate,
                start_time: updatedStartTime,
                end_time: updatedEndTime,
              }
            : booking
        )
      );

      setEditingBookingId(null);
      setUpdatedDate('');
      setUpdatedStartTime('');
      setUpdatedEndTime('');
      setError('');

      alert('Booking updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingBooking(false);
    }
  };

  // Close update form
  const closeUpdateForm = () => {
    if (updatingBooking) return;

    setEditingBookingId(null);
    setUpdatedDate('');
    setUpdatedStartTime('');
    setUpdatedEndTime('');
    setError('');
  };

  // Loading screen
  if (loading) {
    return (
      <div className="my-bookings-page">
        <p className="loading-message">Loading your bookings...</p>
      </div>
    );
  }

  // Error screen when bookings cannot be fetched
  if (error && bookings.length === 0) {
    return (
      <div className="my-bookings-page">
        <h2>My Bookings</h2>
        <p className="booking-error">{error}</p>
        <button type="button" onClick={getMyBookings}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <h2>My Bookings</h2>

      {error && <p className="booking-error">{error}</p>}

      {bookings.length === 0 ? (
        <div className="empty-bookings">
          <h3>No Bookings Yet</h3>
          <p>You have not made any bookings yet.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-card-header">
                <h3>{booking.resource_name}</h3>

                <span
                  className={`booking-status ${
                    booking.status === 'booked'
                      ? 'status-booked'
                      : 'status-cancelled'
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <p>
                <strong>Resource Type:</strong> {booking.resource_type}
              </p>

              <p>
                <strong>Booking Date:</strong> {booking.booking_date}
              </p>

              <p>
                <strong>Start Time:</strong> {booking.start_time}
              </p>

              <p>
                <strong>End Time:</strong> {booking.end_time}
              </p>

              {booking.status === 'booked' && (
                <div className="booking-actions">
                  <button
                    type="button"
                    className="cancel-booking-button"
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={
                      cancellingBookingId === booking.id ||
                      updatingBooking
                    }
                  >
                    {cancellingBookingId === booking.id
                      ? 'Cancelling...'
                      : 'Cancel Booking'}
                  </button>

                  <button
                    type="button"
                    className="update-booking-button"
                    onClick={() => {
                      setEditingBookingId(booking.id);
                      setUpdatedDate(booking.booking_date);
                      setUpdatedStartTime(booking.start_time);
                      setUpdatedEndTime(booking.end_time);
                      setError('');
                    }}
                    disabled={
                      cancellingBookingId === booking.id ||
                      updatingBooking
                    }
                  >
                    Update Booking
                  </button>
                </div>
              )}

              {editingBookingId === booking.id && (
                <div className="update-booking-form">
                  <h3>Reschedule Booking</h3>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleUpdateBooking(booking.id);
                    }}
                  >
                    <label htmlFor={`date-${booking.id}`}>
                      Booking Date
                    </label>

                    <input
                      id={`date-${booking.id}`}
                      type="date"
                      value={updatedDate}
                      min={today}
                      onChange={(event) =>
                        setUpdatedDate(event.target.value)
                      }
                      disabled={updatingBooking}
                      required
                    />

                    <label htmlFor={`start-${booking.id}`}>
                      Start Time
                    </label>

                    <input
                      id={`start-${booking.id}`}
                      type="time"
                      value={updatedStartTime}
                      onChange={(event) =>
                        setUpdatedStartTime(event.target.value)
                      }
                      disabled={updatingBooking}
                      required
                    />

                    <label htmlFor={`end-${booking.id}`}>
                      End Time
                    </label>

                    <input
                      id={`end-${booking.id}`}
                      type="time"
                      value={updatedEndTime}
                      onChange={(event) =>
                        setUpdatedEndTime(event.target.value)
                      }
                      disabled={updatingBooking}
                      required
                    />

                    <div className="update-form-actions">
                      <button
                        type="submit"
                        disabled={updatingBooking}
                      >
                        {updatingBooking
                          ? 'Saving...'
                          : 'Save Changes'}
                      </button>

                      <button
                        type="button"
                        onClick={closeUpdateForm}
                        disabled={updatingBooking}
                      >
                        Close
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
