
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Login = ({ setIsLoggedIn, setUserRole }) => {
    const history = useHistory();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data.message ||
                          'Login failed. Please check your credentials.'
                );
            }

            if (!data.jwtToken) {
                throw new Error(
                    'Login succeeded, but no JWT token was received.'
                );
            }

            // Store JWT token
            localStorage.setItem('jwtToken', data.jwtToken);

            // Get the user's role from the token
            const role = getUserRole(data.jwtToken);

            // Update application login state
            setIsLoggedIn(true);
            setUserRole(role);

            // Redirect based on user role
            if (role === 'admin') {
                history.push('/admin-dashboard');
            } else {
                history.push('/resources');
            }

        } catch (err) {
            setError(
                err.message || 'Unable to connect to the server.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <h2 className="login-heading">
                    Welcome Back
                </h2>

                <p className="login-subtitle">
                    Login to book your campus resources.
                </p>

                <form onSubmit={handleLogin}>

                    <label htmlFor="email">
                        Email Address
                    </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoComplete="email"
                        required
                    />

                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <p
                            className="login-error"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;
