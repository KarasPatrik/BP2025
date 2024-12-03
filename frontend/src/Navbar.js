import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Nav
                </Typography>
                <Button color="inherit" onClick={() => navigate('/')}>
                    Balance.csv
                </Button>
                <Button color="inherit" onClick={() => navigate('/page2')}>
                    Trade_progress.csv
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
