import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import http from '../lib/http';

import {
    Container,
    Paper,
    Typography,
    Button,
    Alert,
} from '@mui/material';

export default function VerifyEmailPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const checkVerification = async () => {
            try {
                const res = await http.get('/api/user');

                if (!res.data) {
                    navigate('/'); // not logged in
                    return;
                }

                if (res.data.email_verified_at) {
                    navigate('/'); // already verified
                }
            } catch (err) {
                navigate('/'); // fallback in case of error
            }
        };

        checkVerification();
    }, [navigate]);

    const handleResend = async () => {
        try {
            await http.post('/api/auth/email/verification-notification');
            setMessage('Verification email sent!');
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to resend verification email. Please try again.');
            setMessage('');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: '20vh', textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Verify Your Email
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Please check your email for a verification link. You must verify your email before continuing.
                </Typography>

                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Button variant="contained" onClick={handleResend}>
                    Resend Verification Email
                </Button>
            </Paper>
        </Container>
    );
}