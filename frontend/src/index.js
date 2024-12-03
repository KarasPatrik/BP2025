import React from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChartContainer from './ChartContainer';
import Navbar from './Navbar';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<ChartContainer dataFile="balance.csv" />} />
                <Route path="/page2" element={<ChartContainer dataFile="trade_progress.csv" />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
