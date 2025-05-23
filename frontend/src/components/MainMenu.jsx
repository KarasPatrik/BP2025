import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Collapse, DialogActions, DialogContentText, DialogContent, DialogTitle, Dialog
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {API_BASE_URL} from "../config.js";

export default function MainMenu() {
    const [favorites, setFavorites] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [favoriteToDelete, setFavoriteToDelete] = useState(null);


    useEffect(() => {
        axios.get('/api/favorites')
            .then(res => setFavorites(res.data))
            .catch(err => console.error('Failed to fetch favorites', err));
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(prev => (prev === id ? null : id));
    };
    const confirmDeleteFavorite = (fav) => {
        setFavoriteToDelete(fav);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!favoriteToDelete) return;
        try {
            await axios.delete(`${API_BASE_URL}/favorites/${favoriteToDelete.id}`);
            setFavorites(prev => prev.filter(f => f.id !== favoriteToDelete.id));
        } catch (err) {
            console.error('Failed to delete favorite:', err);
        } finally {
            setDeleteDialogOpen(false);
            setFavoriteToDelete(null);
        }
    };
    const handleGoTo = (fav) => {
        navigate('/New', { state: { favorite: fav } });
    };


    return (
        <Container sx={{ mt: 6 }}>
            {/* Header Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h3">Trading Simulations</Typography>
                <Button variant="contained" size="large" onClick={() => navigate('/New')}>
                    Create New
                </Button>
            </Box>

            {/* Favorites List */}
            {favorites.map(fav => (
                <Paper
                    key={fav.id}
                    sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #ccc',
                        backgroundColor: '#fafafa',
                        cursor: 'pointer'
                    }}
                    onClick={() => toggleExpand(fav.id)}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <Box>
                            <Typography variant="h6">{fav.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Created: {new Date(fav.created_at).toLocaleString()}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleGoTo(fav);
                                }}
                            >
                                Go to
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDeleteFavorite(fav);
                                }}
                            >
                                Delete
                            </Button>
                        </Box>
                    </Box>

                    <Collapse in={expandedId === fav.id}>
                        <Box sx={{ mt: 2, pl: 2 }}>
                            <Typography><strong>Experiment:</strong> {fav.experiment}</Typography>
                            <Typography><strong>Stocks:</strong> {fav.stocks.join(', ')}</Typography>
                            <Typography><strong>Models:</strong> {fav.models.join(', ')}</Typography>
                            <Typography><strong>Advice Limits:</strong> {fav.advice_limits.join(', ')}</Typography>
                            <Typography><strong>Advice Limits Max:</strong> {fav.advice_limits_max.join(', ')}</Typography>
                            <Typography><strong>Stoplosses:</strong> {fav.stoplosses.join(', ')}</Typography>
                        </Box>
                    </Collapse>
                </Paper>
            ))}

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Favorite</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this favorite?
                        <br /><strong>{favoriteToDelete?.name}</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}
