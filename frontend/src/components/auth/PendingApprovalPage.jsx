import { useEffect } from 'react';
import {Navigate, useNavigate} from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Container,
    Paper,
    Typography,
    CircularProgress
} from '@mui/material';

export default function PendingApprovalPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user?.is_approved) {
            navigate('/main-menu');
        }
    }, [user, loading, navigate]);

    console.log({ loading, user });

    if (loading) {
        return (
            <Container sx={{ mt: '20vh', textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!user) return <Navigate to="/" replace />;

    return (
        <Container maxWidth="sm" sx={{ mt: '20vh' }}>
            <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Account Pending Approval
                </Typography>
                <Typography variant="body1">
                    Your account has been created and is waiting for admin approval.
                    You’ll be automatically redirected once approved.
                </Typography>
            </Paper>
        </Container>
    );
}
