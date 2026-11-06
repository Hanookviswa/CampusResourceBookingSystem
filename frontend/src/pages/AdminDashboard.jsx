
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
    const [bookingStats, setBookingStats] = useState({
        totalBookings: 0,
        activeBookings: 0,
        cancelledBookings: 0
    });

    const [totalResources, setTotalResources] = useState(0);
    const [resourceUsage, setResourceUsage] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('jwtToken');

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const API_URL = import.meta.env.VITE_API_URL;

                const [
                    bookingResponse,
                    resourceResponse,
                    usageResponse,
                    adminBookingResponse
                ] = await Promise.all([
                    fetch(
                        `${API_URL}/api/analytics/bookings`,
                        { headers }
                    ),
                    fetch(
                        `${API_URL}/api/resources?limit=100`,
                        { headers }
                    ),
                    fetch(
                        `${API_URL}/api/analytics/resources`,
                        { headers }
                    ),
                    fetch(
                        `${API_URL}/api/admin/bookings`,
                        { headers }
                    )
                ]);

                if (
                    !bookingResponse.ok ||
                    !resourceResponse.ok ||
                    !usageResponse.ok ||
                    !adminBookingResponse.ok
                ) {
                    throw new Error('Unable to fetch dashboard data.');
                }

                const bookingData = await bookingResponse.json();
                const resourceData = await resourceResponse.json();
                const usageData = await usageResponse.json();
                const adminBookingData = await adminBookingResponse.json();

                setBookingStats(bookingData);
                setTotalResources(resourceData.resources.length);
                setResourceUsage(usageData);

                // Sort bookings by creation date and show latest five
                const sortedBookings = [...adminBookingData.bookings].sort(
                    (a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                );

                setRecentBookings(sortedBookings.slice(0, 5));

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <h2>Loading Dashboard...</h2>;
    }

    if (error) {
        return <p className="dashboard-error">{error}</p>;
    }

    const maxBookings = Math.max(
        1,
        ...resourceUsage.map(resource => resource.totalBookings)
    );

    const dashboardCards = [
        { title: 'Total Resources', value: totalResources },
        { title: 'Total Bookings', value: bookingStats.totalBookings },
        { title: 'Active Bookings', value: bookingStats.activeBookings },
        { title: 'Cancelled Bookings', value: bookingStats.cancelledBookings }
    ];

    return (
        <div className="admin-dashboard">

            <h2>Admin Dashboard</h2>

            <p className="dashboard-subtitle">
                Welcome to the Campus Resource Booking System.
            </p>

            {/* Dashboard Statistics */}
            <div className="dashboard-cards">
                {dashboardCards.map((card) => (
                    <div
                        className={`dashboard-card ${
                            card.title === 'Total Resources' ? 'card-blue' :
                            card.title === 'Total Bookings' ? 'card-purple' :
                            card.title === 'Active Bookings' ? 'card-green' :
                            'card-red'
                        }`}
                        key={card.title}
                    >
                        <h3>{card.title}</h3>
                        <p>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Resource Usage Analytics */}
            <div className="analytics-section">

                <h3>Bookings by Resource</h3>

                {resourceUsage.length === 0 ? (
                    <p>No resource analytics available.</p>
                ) : (
                    <div className="resource-chart">
                        {resourceUsage.map((resource) => {
                            const percentage =
                                (resource.totalBookings / maxBookings) * 100;

                            return (
                                <div
                                    className="chart-item"
                                    key={resource.resourceId}
                                >
                                    <div className="chart-label">
                                        <span>{resource.resourceName}</span>
                                        <strong>{resource.totalBookings}</strong>
                                    </div>

                                    <div className="chart-bar-background">
                                        <div
                                            className="chart-bar"
                                            style={{
                                                width: `${percentage}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Bookings */}
            <div className="recent-bookings-section">

                <h3>Recent Bookings</h3>

                {recentBookings.length === 0 ? (
                    <p>No bookings available.</p>
                ) : (
                    <div className="recent-bookings-list">

                        {recentBookings.map((booking) => (
                            <div
                                className="recent-booking-card"
                                key={booking.bookingId}
                            >
                                <div className="recent-booking-header">
                                    <h4>{booking.resourceName}</h4>

                                    <span
                                        className={`booking-status ${
                                            booking.status === 'booked'
                                                ? 'status-active'
                                                : 'status-cancelled'
                                        }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>

                                <p>
                                    <strong>User:</strong> {booking.userName}
                                </p>

                                <p>
                                    <strong>Email:</strong> {booking.userEmail}
                                </p>

                                <p>
                                    <strong>Date:</strong> {booking.bookingDate}
                                </p>

                                <p>
                                    <strong>Time:</strong>{' '}
                                    {booking.startTime} - {booking.endTime}
                                </p>
                            </div>
                        ))}

                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminDashboard;
