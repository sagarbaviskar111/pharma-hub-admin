import { useState } from 'react';
import axios from 'axios';
import BASE_API_URL from '../utils/apiConfig';
import validators from '../utils/validators';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        // Validate credentials
        const validation = validators.validateLogin({ email, password });
        if (!validation.isValid) {
            setErrors(validation.errors);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${BASE_API_URL}/api/auth/login`, {
                email,
                password,
            });

            if (response.status === 200) {
                // Extract token from the response and save it to localStorage
                const { token } = response.data;
                if (!token) {
                    setErrors(['No authentication token received. Please contact support.']);
                    setLoading(false);
                    return;
                }
                localStorage.setItem('token', token);
                localStorage.setItem('userEmail', email);
                onLogin(); // Call the onLogin handler to update the app state
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to login';
            setErrors([errorMessage]);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.formContainer}>
            <h1 style={styles.title}>Login</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        placeholder="Enter your email"
                        disabled={loading}
                    />
                </label>

                <label style={styles.label}>
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="Enter your password"
                        disabled={loading}
                    />
                </label>

                {errors.length > 0 && (
                    <div style={styles.errorContainer}>
                        {errors.map((error, index) => (
                            <p key={index} style={styles.error}>{error}</p>
                        ))}
                    </div>
                )}

                <button type="submit" style={styles.submitButton} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

// Inline CSS styles
const styles = {
    formContainer: {
        maxWidth: '400px',
        margin: 'auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '10px',
        fontSize: '16px',
        color: '#555',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginTop: '5px',
        marginBottom: '10px',
        width: '100%',
        boxSizing: 'border-box',
    },
    errorContainer: {
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        border: '1px solid #f5c6cb',
    },
    error: {
        color: '#721c24',
        margin: '5px 0',
        fontSize: '14px',
    },
    submitButton: {
        padding: '10px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Login;
