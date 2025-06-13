import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Link,
    Box,
} from '@mui/material';
import http, {securePost} from '../../lib/http.js';
import {useAuth} from "../../contexts/AuthContext.jsx";

export default function Register() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [form, setForm] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.surname.trim()) errs.name = 'Name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = 'Must be a valid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 8)
            errs.password = 'Password must be at least 8 characters';
        if (form.password !== form.password_confirmation)
            errs.password_confirmation = "Passwords don't match";
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((e) => ({ ...e, [name]: '' }));
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
            await securePost('/auth/register', form);
            await new Promise((r) => setTimeout(r, 300));
            const { data } = await http.get('/api/user');
            setUser(data);
            navigate('/registration-success');
        } catch (err) {
            console.log('Server response:', err.response);
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setServerError(
                    err.response?.data?.message ||
                    'Registration failed. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: '20vh' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Register
                </Typography>

                {serverError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {serverError}
                    </Alert>
                )}

                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        margin="normal"
                        value={form.name}
                        onChange={handleChange}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <TextField
                        fullWidth
                        label="Surname"
                        name="surname"
                        margin="normal"
                        value={form.surname}
                        onChange={handleChange}
                        error={!!errors.surname}
                        helperText={errors.surname}
                    />

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

                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="password_confirmation"
                        type="password"
                        margin="normal"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? 'Registering…' : 'Register'}
                    </Button>
                </Box>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login">
                        Sign in
                    </Link>
                </Typography>
            </Paper>
        </Container>
    );
}
