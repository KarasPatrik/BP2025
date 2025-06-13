import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Typography,
    Container,
    Grid,
    TextField,
    Button,
    Divider,
    Paper,
    Box,
    DialogContentText,
    DialogContent,
    DialogTitle,
    Dialog, DialogActions
} from '@mui/material';
import axios from 'axios';

export default function ProfilePage() {
    const { user } = useAuth();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [targetUser, setTargetUser] = useState(null);
    const [newUserPassword, setNewUserPassword] = useState('');
    const [confirmUserPassword, setConfirmUserPassword] = useState('');

    const [pendingUsers, setPendingUsers] = useState([]);
    const [approvedUsers, setApprovedUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user?.is_admin) {
            fetchUsers();
        }
    }, [user]);

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchUsers = async () => {
        try {
            const [pendingRes, approvedRes] = await Promise.all([
                axios.get('/api/admin/pending-users'),
                axios.get('/api/admin/approved-users')
            ]);
            setPendingUsers(pendingRes.data);
            setApprovedUsers(approvedRes.data);
        } catch (err) {
            console.error('Failed to load users', err);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            setError('New passwords do not match.');
            return;
        }
        try {
            await axios.post('/api/user/change-password', {
                current_password: passwords.current,
                new_password: passwords.new,
                new_password_confirmation: passwords.confirm
            });
            setMsg('Password updated successfully.');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            const serverMessage = err.response?.data?.message || 'Unknown error.';
            setError(`Failed to update password.\n${serverMessage}`);
        }
    };

    const handleApprove = async (id) => {
        await axios.post(`/api/admin/approve-user/${id}`);
        fetchUsers();
    };

    const handleReject = async (id) => {
        await axios.delete(`/api/admin/delete-user/${id}`);
        fetchUsers();
    };

    const handleChangeUserPassword = async (userId, newPassword) => {
        try {
            await axios.post(`/api/admin/change-user-password/${userId}`, {
                password: newPassword
            });
            setMsg('Password changed successfully for selected user.');
        } catch (err) {
            console.error('Failed to change user password', err);
            const serverMsg = err.response?.data?.message || 'Error occurred.';
            setError(`Failed to change password.\n${serverMsg}`);
        }
    };

    const handleDelete = async (id) => {
        await axios.delete(`/api/admin/delete-user/${id}`);
        fetchUsers();
    };

    const filteredApproved = approvedUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container maxWidth="false" sx={{ mt: 4 }}>
            <Box sx={{ display:'flex', justifyContent: 'center' }}>
                <Grid container spacing={14} justifyContent="center">

                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Box sx={{ width: '100%', maxWidth: 500 }}>
                                <Typography variant="h4" gutterBottom align="center">Profile</Typography>
                                <Paper
                                    sx={{
                                        p: 4,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 3,
                                        backgroundColor: '#fafafa',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>Profile Information</Typography>

                                    <Typography><strong>Name:</strong> {user?.name}</Typography>
                                    <Typography><strong>Surname:</strong> {user?.surname}</Typography>
                                    <Typography><strong>Email:</strong> {user?.email}</Typography>

                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6">Change Your Password</Typography>

                                    <TextField
                                        label="Current Password"
                                        type="password"
                                        fullWidth
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    />
                                    <TextField
                                        label="New Password"
                                        type="password"
                                        fullWidth
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                    <TextField
                                        label="Confirm New Password"
                                        type="password"
                                        fullWidth
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handlePasswordChange}
                                        sx={{ mt: 2 }}
                                    >
                                        Update Password
                                    </Button>

                                    {msg && <Typography sx={{ color: 'green' }}>{msg}</Typography>}
                                    {error && <Typography sx={{ color: 'red', whiteSpace: 'pre-line' }}>{error}</Typography>}
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                    {user?.is_admin && (
                        <Grid item xs={12} md={7}>
                            <Typography variant="h4" gutterBottom align="center">Admin Controls</Typography>
                                <Paper sx={{ p: 2, mb: 4, backgroundColor: '#f5f5f5' }}>
                                    <Typography variant="h6" gutterBottom>Pending Users</Typography>
                                    <Box sx={{ maxHeight: 228, overflowY: 'auto' }}>
                                    {pendingUsers.map((u) => (
                                    <Box
                                        key={u.id}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', md: 'row' },
                                            alignItems: { md: 'center' },
                                            justifyContent: 'space-between',
                                            gap: 8,
                                            p: 1,
                                            mb: 1,
                                            backgroundColor: '#ffffff',
                                            borderRadius: 1,
                                            border: '1px solid #ddd'
                                        }}
                                    >
                                        <Box>
                                            <Typography>
                                                <strong>{u.name} {u.surname}</strong> {'  '}
                                                <span style={{ color: '#666', fontSize: '0.9em' }}>({u.email})</span>
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Button variant="contained" size="small" onClick={() => handleApprove(u.id)}>Approve</Button>
                                            <Button variant="outlined" size="small" color="error" onClick={() => {
                                                setTargetUser(u);
                                                setRejectDialogOpen(true);
                                            }}>Reject</Button>
                                        </Box>
                                    </Box>
                                    ))}
                                    </Box>
                                </Paper>
                            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="h6" gutterBottom>Approved Users</Typography>
                                <TextField
                                    label="Search"
                                    fullWidth
                                    size="small"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    sx={{ mb: 1 }}
                                />
                                <Box sx={{ maxHeight: 228, overflowY: 'auto' }}>
                                    {filteredApproved.map((u) => (
                                        <Box
                                            key={u.id}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', md: 'row' },
                                                alignItems: { md: 'center' },
                                                justifyContent: 'space-between',
                                                gap: 5,
                                                p: 1,
                                                mb: 1,
                                                backgroundColor: u.is_admin ? '#eaf3f8' : '#ffffff',
                                                borderRadius: 1,
                                                border: '1px solid #ddd'
                                            }}
                                        >
                                            <Box>
                                                <Typography>
                                                    {u.is_admin && <strong style={{ color: '#1976d2' }}>ADMIN – </strong>}
                                                    <strong>{u.name} {u.surname}</strong> {'  '}
                                                    <span style={{ color: '#666', fontSize: '0.9em' }}>({u.email})</span>
                                                </Typography>
                                            </Box>
                                            <Button variant="outlined" size="small" color="warning" onClick={() => {
                                                setTargetUser(u);
                                                setNewUserPassword('');
                                                setConfirmUserPassword('');
                                                setEditDialogOpen(true);
                                            }}>Edit</Button>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>



            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
                <DialogTitle>Reject Registration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to reject this user?
                    </DialogContentText>
                    <Typography sx={{ mt: 2 }}>
                        <strong>Name:</strong> {targetUser?.name} {targetUser?.surname}<br />
                        <strong>Email:</strong> {targetUser?.email}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            handleReject(targetUser.id);
                            setRejectDialogOpen(false);
                        }}
                    >
                        Confirm Reject
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <DialogActions sx={{ justifyContent: 'space-between' }}>
                        <Typography sx={{ mb: 2 }}>
                            <strong>{targetUser?.name} {targetUser?.surname}</strong><br />
                            <span style={{ fontSize: '0.9em', color: '#666' }}>{targetUser?.email}</span>
                        </Typography>
                        <Button color="error" variant="contained" onClick={() => {
                            handleDelete(targetUser.id);
                            setEditDialogOpen(false);
                        }}>
                            Delete User
                        </Button>
                    </DialogActions>


                    <TextField
                        label="New Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                    />

                    <TextField
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={confirmUserPassword}
                        onChange={(e) => setConfirmUserPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (newUserPassword === confirmUserPassword) {
                                handleChangeUserPassword(targetUser.id, newUserPassword);
                                setEditDialogOpen(false);
                            } else {
                                setError("Passwords don't match");
                            }
                        }}
                    >
                        Save Password
                    </Button>
                </DialogActions>
            </Dialog>


        </Container>


    );

}
