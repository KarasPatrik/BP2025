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
import VerifyEmailPage from "./components/VerifyEmailPage.jsx";
import VerifyComplete from "./components/VerifyComplete.jsx";
import VerifyPage from "./components/auth/VerifyPage.jsx";
import NewChartContainer from "./components/NewChartContainer.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/Blnc" element={<ChartContainer dataFile="balance.csv" />} />
                <Route path="/New" element={<NewChartContainer/>} />
                <Route path="/Progress" element={<ChartContainer dataFile="trade_progress.csv" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register/>} />
                <Route path="/registration-success" element={<RegistrationSuccess />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/verify-complete" element={<VerifyComplete />} />
                <Route path="/verify" element={<VerifyPage />} />
            </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);