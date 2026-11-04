
import { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

const Signup = () => {
    const history = useHistory();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (event) => {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const response = await fetch(
                'http://localhost:3000/api/auth/signup',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(responseText || 'Signup failed. Please try again.');
            }

            alert('Account created successfully!');
            history.push('/login');

        } catch (err) {
            setError(err.message || 'Unable to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-card">

                <h2 className="signup-heading">
                    Create Account
                </h2>

                <p className="signup-subtitle">
                    Sign up to book your campus resources.
                </p>

                <form onSubmit={handleSignup}>

                    <label htmlFor="name">
                        Full Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        required
                    />

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
                        placeholder="Create a password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <p
                            className="signup-error"
                            role="alert"
                            aria-live="polite"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="signup-submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                </form>

                <p className="signup-login-link">
                    Already have an account?{' '}
                    <Link to="/login">Login</Link>
                </p>

            </div>
        </div>
    );
};

export default Signup;
