import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Link,
} from '@mui/material';
import http, {securePost} from '../../lib/http.js';
import {useAuth} from '../../contexts/AuthContext.jsx';
// http is your axios instance with baseURL=/api and withCredentials:true
// ensureCsrf() calls GET /sanctum/csrf-cookie for you

export default function Login() {
    const { setUser } = useAuth(); // ✅ pull setUser from context
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = 'Must be a valid email';
        if (!form.password) errs.password = 'Password is required';
        return errs;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fieldErrs = validate();
        if (Object.keys(fieldErrs).length) {
            setErrors(fieldErrs);
            return;
        }

        try {
            setLoading(true);

            // 2) post credentials
            await securePost('/api/auth/login', form);
            await new Promise((r) => setTimeout(r, 300));
            const { data } = await http.get('/api/user');
            setUser(data); // now it works ✅
            // 3) on success redirect
            navigate('/');
        } catch (err) {
            console.error('🔥 Login flow failed:', err); // <== SEE THIS
            if (err.response?.status === 422) {
                // Laravel validation errors
                setErrors(err.response.data.errors || {});
            } else {
                setServerError(
                    err.response?.data.message ||
                    'Login failed. Please check your credentials.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 , marginTop: "20vh"}}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Login
                </Typography>

                {serverError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {serverError}
                    </Alert>
                )}

                <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    onSubmit={handleSubmit}
                >
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        margin="normal"
                        value={form.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        margin="normal"
                        value={form.password}
                        onChange={handleChange}
                        error={!!errors.password}
                        helperText={errors.password}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </Button>
                </Box>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Don’t have an account?{' '}
                    <Link component={RouterLink} to="/register">
                        Register
                    </Link>
                </Typography>
                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Forgot password?{' '}
                    <Link component={RouterLink} to="/pass-rst">
                        Reset password
                    </Link>
                </Typography>
            </Paper>
        </Container>
    );
}
