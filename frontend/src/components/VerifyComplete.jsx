import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Paper,
    Typography,
    Button
} from '@mui/material';

export default function VerifyComplete() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // if not logged in or not verified → redirect
        if (!user || !user.email_verified_at) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <Container maxWidth="xs" sx={{ mt: '20vh', textAlign: 'center' }}>
            <Paper elevation={4} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                    ✅ Email Verified!
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Your email has been successfully verified. You can now access all features.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Paper>
        </Container>
    );
}