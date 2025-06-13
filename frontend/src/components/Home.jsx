import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Button,
    Stack,
    Box,
} from '@mui/material';

import { useAuth } from '../contexts/AuthContext';
import graphsImage from '../assets/graphsImage.png';

export default function Home() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Redirect if logged in but not verified
    useEffect(() => {
        if (!loading && user && !user.is_approved) {
            navigate('/pending-approval');
        } else if (user && user.is_approved){
            navigate('/main-menu');
        }
    }, [loading, user, navigate]);

    // Show nothing while loading auth state
    if (loading) return null;

    return (
        <Container maxWidth="xs" sx={{ mt: '15vh', mb: '15vh' }}>
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                }}
            >
                <Box
                    component="img"
                    src={graphsImage}
                    alt="Analytics Illustration"
                    sx={{
                        width: '90%',
                        mx: 'auto',
                        mb: 3,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}
                />

                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to Trading Simulations
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Log in or register to see data from trading simulations done on FEI STU by .......
                </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={() => navigate('/register')}
                            sx={{ px: 3 }}
                        >
                            Create Account
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/login')}
                            sx={{ px: 3 }}
                        >
                            Login
                        </Button>
                    </Stack>
            </Paper>
        </Container>
    );
}