import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { CircularProgress, Container } from "@mui/material";

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container sx={{ mt: '20vh', textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }
    if (!user.is_approved) {
        return <Navigate to="/pending-approval" replace />;
    }

    return children;
}

