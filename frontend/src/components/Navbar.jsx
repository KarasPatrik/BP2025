import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    component={Button}
                    variant="h6"
                    sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                    onClick={() => navigate('/')}
                >
                    BP Trading
                </Typography>

                {loading ? null : user ? (
                    <>
                        {(
                            <>
                                <Button color="inherit" onClick={() => navigate('/profile')}>
                                    Profile
                                </Button>
                            </>
                        )}

                        {/* Everyone who’s logged in can log out */}
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    /* Guests see login & register */
                    <>
                        {/*<Button color="inherit" onClick={() => navigate('/login')}>*/}
                        {/*    Prihlásenie*/}
                        {/*</Button>*/}
                        {/*<Button color="inherit" onClick={() => navigate('/register')}>*/}
                        {/*    Registrácia*/}
                        {/*</Button>*/}
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;