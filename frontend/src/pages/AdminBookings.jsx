
import { useEffect, useState } from 'react';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const getBookings = async () => {
            try {
                const token = localStorage.getItem('jwtToken');

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/admin/bookings`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                setBookings(data.bookings);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getBookings();
    }, []);

    if (loading) return <h2>Loading Bookings...</h2>;
    if (error) return <p>{error}</p>;

    return (
        <div className="admin-bookings-page">
            <h2>Manage Bookings</h2>

            <p>Total Bookings: {bookings.length}</p>

            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div className="booking-card" key={booking.bookingId}>
                            <h3>{booking.resourceName}</h3>

                            <p><strong>User:</strong> {booking.userName}</p>
                            <p><strong>Email:</strong> {booking.userEmail}</p>
                            <p><strong>Resource Type:</strong> {booking.resourceType}</p>
                            <p><strong>Date:</strong> {booking.bookingDate}</p>
                            <p><strong>Start Time:</strong> {booking.startTime}</p>
                            <p><strong>End Time:</strong> {booking.endTime}</p>
                            <p><strong>Status:</strong> {booking.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
