import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-content">
          <span className="home-label">CAMPUS RESOURCE MANAGEMENT</span>

          <h2>
            Book Campus Resources
            <span> Easily and Efficiently</span>
          </h2>

          <p className="home-description">
            Find and book classrooms, laboratories, seminar halls, and
            sports facilities from one convenient platform.
          </p>

          <p className="home-subdescription">
            Simplify campus resource management with easy booking,
            scheduling, and booking tracking.
          </p>

          <div className="home-actions">
            <Link to="/resources" className="home-primary-button">
              Explore Resources
            </Link>

            <Link to="/my-bookings" className="home-secondary-button">
              My Bookings
            </Link>
          </div>
        </div>

        <div className="home-highlight">
          <div className="highlight-icon">🏫</div>
          <h3>One Platform. All Campus Resources.</h3>
          <p>
            Discover available facilities and manage your campus
            bookings in one place.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Home;