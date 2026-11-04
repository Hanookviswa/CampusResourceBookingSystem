
import { useState } from 'react';

import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  NavLink
} from 'react-router-dom';

import { getUserRole } from './utils/auth';

import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminResources from './pages/AdminResources.jsx';
import AdminBookings from './pages/AdminBookings.jsx';

import Home from './pages/Home';
import Resources from './pages/Resources.jsx';
import Login from './pages/Login';
import Signup from './pages/Signup.jsx';
import MyBookings from './pages/MyBookings';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import LogoutButton from './components/LogoutButton.jsx';

import './App.css';

const App = () => {
  const [userRole, setUserRole] = useState(
    getUserRole(localStorage.getItem('jwtToken'))
  );

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('jwtToken')
  );

  return (
    <BrowserRouter>
      <div className="app-container">

        <header className="app-header">

          <Link to="/" className="brand-link">
            <h1>Campus Resource Booking System</h1>
          </Link>

          <nav className="main-navigation">

            <NavLink
              exact
              to="/"
              activeClassName="active-nav-link"
            >
              Home
            </NavLink>

            {isLoggedIn && userRole === 'admin' && (
              <>
                <NavLink
                  to="/admin-dashboard"
                  activeClassName="active-nav-link"
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/admin-resources"
                  activeClassName="active-nav-link"
                >
                  Manage Resources
                </NavLink>

                <NavLink
                  to="/admin-bookings"
                  activeClassName="active-nav-link"
                >
                  Manage Bookings
                </NavLink>
              </>
            )}

            {isLoggedIn && userRole !== 'admin' && (
              <>
                <NavLink
                  to="/resources"
                  activeClassName="active-nav-link"
                >
                  Resources
                </NavLink>

                <NavLink
                  to="/my-bookings"
                  activeClassName="active-nav-link"
                >
                  My Bookings
                </NavLink>
              </>
            )}

            {isLoggedIn ? (
              <LogoutButton
                setIsLoggedIn={setIsLoggedIn}
              />
            ) : (
              <div className="auth-navigation">
                <NavLink
                  to="/login"
                  activeClassName="active-nav-link"
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  activeClassName="active-nav-link"
                >
                  Signup
                </NavLink>
              </div>
            )}

          </nav>

        </header>

        <main className="app-main">
          <Switch>

            <Route exact path="/" component={Home} />

            <AdminRoute
              path="/admin-dashboard"
              component={AdminDashboard}
            />

            <AdminRoute
              path="/admin-resources"
              component={AdminResources}
            />

            <AdminRoute
              path="/admin-bookings"
              component={AdminBookings}
            />

            <ProtectedRoute
              path="/resources"
              component={Resources}
            />

            <ProtectedRoute
              path="/my-bookings"
              component={MyBookings}
            />

            <PublicRoute
              path="/login"
              render={(props) => (
                <Login
                  {...props}
                  setIsLoggedIn={setIsLoggedIn}
                  setUserRole={setUserRole}
                />
              )}
            />

            <PublicRoute
              path="/signup"
              component={Signup}
            />

          </Switch>
        </main>

      </div>
    </BrowserRouter>
  );
};

export default App;
