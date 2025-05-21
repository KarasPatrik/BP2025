import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import http from "../../lib/http.js";

export default function RegistrationSuccess() {
    const navigate = useNavigate();
    const handleCheckVerification = async () => {
        try {
            const { data } = await http.get('/api/user'); // get latest user data
            if (data.is_approved) {
                navigate('/main-menu'); // ✅ verified → home
            } else {
                navigate('/pending-approval'); // ❌ not verified → prompt
            }
        } catch (err) {
            console.error('Error checking verification status:', err);
            navigate('/'); // fallback just in case
        }
    };

    return (
        <Container
            maxWidth="xs"
            sx={{
                mt: '20vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Paper elevation={6} sx={{ p: 4, textAlign: 'center' }}>
                <Box mb={2}>
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" gutterBottom>
                    Registration Complete
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Almost there! Please check your email to verify your account.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleCheckVerification}
                >
                    OK
                </Button>
            </Paper>
        </Container>
    );
}