import React from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChartContainer from './components/ChartContainer.jsx';
import Navbar from './components/Navbar.jsx';
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import Home from "./components/Home.jsx";
import RegistrationSuccess from "./components/auth/RegistrationSucess.jsx";
import {AuthProvider} from "./contexts/AuthContext.jsx";
import NewChartContainer from "./components/NewChartContainer.jsx";
import PendingApprovalPage from "./components/auth/PendingApprovalPage.jsx";
import PrivateRoute from "./components/auth/PrivateRoute.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import MainMenu from "./components/MainMenu.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/Blnc" element={<ChartContainer dataFile="balance.csv" />} />
                <Route path="/New" element={<PrivateRoute> <NewChartContainer /> </PrivateRoute>} />
                <Route path="/Progress" element={<ChartContainer dataFile="trade_progress.csv" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register/>} />
                <Route path="/registration-success" element={<RegistrationSuccess />} />
                <Route path="/pending-approval" element={ <PendingApprovalPage /> } />
                <Route path="/profile" element={<PrivateRoute> <ProfilePage /> </PrivateRoute>} />
                <Route path="/main-menu" element={<PrivateRoute> <MainMenu /> </PrivateRoute>} />
            </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);