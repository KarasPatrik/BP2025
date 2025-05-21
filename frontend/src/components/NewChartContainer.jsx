import React, {useEffect, useState} from "react";
import SelectField from "./SelectField.jsx";
import {API_BASE_URL} from "../config.js";
import NewCombinedHighchart from "./NewCombinedHighChart.jsx";
import axios from "axios";
import { TextField, Button } from '@mui/material';
import { useLocation } from 'react-router-dom';



const NewChartContainer = () => {
    const [experiment, setExperiment] = useState('');
    const [stocks, setStocks] = useState([]);
    const [models, setModels] = useState([]);
    const [adviceLimits, setAdviceLimits] = useState([]);
    const [adviceLimitsMax, setAdviceLimitsMax] = useState([]);
    const [stoplosses, setStoplosses] = useState([]);
    const [favoriteName, setFavoriteName] = useState('');
    const [error, setError] = useState('');
    const [existingFavorites, setExistingFavorites] = useState([]);
    const [success, setSuccess] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.state?.favorite) {
            const fav = location.state.favorite;
            setExperiment(fav.experiment);
            setStocks(fav.stocks);
            setModels(fav.models);
            setAdviceLimits(fav.advice_limits);
            setAdviceLimitsMax(fav.advice_limits_max);
            setStoplosses(fav.stoplosses);
        }
    }, [location.state]);


    useEffect(() => {
        axios.get(`${API_BASE_URL}/favorites`)
            .then(res => setExistingFavorites(res.data))
            .catch(err => console.error('Failed to load favorites', err));
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const doesFavoriteExist = () => {
        return existingFavorites.some(fav =>
            fav.name === favoriteName ||
            (
                fav.experiment === experiment &&
                arraysEqual(fav.stocks, stocks) &&
                arraysEqual(fav.models, models) &&
                arraysEqual(fav.advice_limits, adviceLimits) &&
                arraysEqual(fav.advice_limits_max, adviceLimitsMax) &&
                arraysEqual(fav.stoplosses, stoplosses)
            )
        );
    };

    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, i) => val === sortedB[i]);
    };

    const handleSaveFavorite = async () => {
        setError('');
        setSuccess('');

        if (doesFavoriteExist()) {
            setError('A favorite with this name or configuration already exists.');
            return;
        }

        try {
            const payload = {
                name: favoriteName,
                experiment,
                stocks,
                models,
                advice_limits: adviceLimits,
                advice_limits_max: adviceLimitsMax,
                stoplosses
            };

            await axios.post(`${API_BASE_URL}/favorites`, payload);
            setError('');
            setFavoriteName('');
            setExistingFavorites(prev => [...prev, payload]);
            setSuccess('Favorite saved successfully!');
        } catch (err) {
            console.error('Failed to save favorite:', err);
            setError('Something went wrong while saving.');
        }
    };

    const handleExperimentChange = (value) => {
        setExperiment(value);
        setStocks([]);
        setModels([]);
        setAdviceLimits([]);
        setAdviceLimitsMax([]);
        setStoplosses([]);
    };

    const handleStocksChange = (value) => {
        setStocks(value);
        setModels([]);
        setAdviceLimits([]);
        setAdviceLimitsMax([]);
        setStoplosses([]);
    };

    const handleModelsChange = (value) => {
        setModels(value);
        setAdviceLimits([]);
        setAdviceLimitsMax([]);
        setStoplosses([]);
    };

    const handleLimitsChange = (value) => {
        setAdviceLimits(value);
        setAdviceLimitsMax([]);
        setStoplosses([]);
    };

    const handleLimitsMaxChange = (value) => {
        setAdviceLimitsMax(value);
        setStoplosses([]);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
            {/* Combined Single Chart */}
            <div style={{ flex: "3", padding: '20px' }}>
                <NewCombinedHighchart
                    experiment={experiment}
                    stocks={stocks}
                    models={models}
                    adviceLimits={adviceLimits}
                    adviceLimitsMax={adviceLimitsMax}
                    stoplosses={stoplosses}
                />
            </div>

            {/* Sidebar with selects */}
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    minWidth: '200px',
                    gap: '30px',
                    padding: '60px 20px',
                }}
            >
                <SelectField
                    label="Experiment"
                    endpoint={`${API_BASE_URL}/realClickExperiments`}
                    value={experiment}
                    onChange={handleExperimentChange}
                    isMulti={false}
                />

                <SelectField
                    label="Stocks"
                    endpoint={`${API_BASE_URL}/realClickStocks`}
                    value={stocks}
                    onChange={handleStocksChange}
                    isMulti={true}
                    dependentData={{ experiment }}
                />

                <SelectField
                    label="Models"
                    endpoint={`${API_BASE_URL}/realClickModels`}
                    value={models}
                    onChange={handleModelsChange}
                    isMulti={true}
                    dependentData={{ experiment, stocks }}
                />

                <SelectField
                    label="AdviceLimits"
                    endpoint={`${API_BASE_URL}/realClickAdviceLimits`}
                    value={adviceLimits}
                    onChange={handleLimitsChange}
                    isMulti={true}
                    dependentData={{ experiment, stocks, models }}
                />

                <SelectField
                    label="AdviceLimitsMax"
                    endpoint={`${API_BASE_URL}/realClickAdviceLimitsMax`}
                    value={adviceLimitsMax}
                    onChange={handleLimitsMaxChange}
                    isMulti={true}
                    dependentData={{ experiment, stocks, models, adviceLimits }}
                />

                <SelectField
                    label="StopLosses"
                    endpoint={`${API_BASE_URL}/realClickStoplosses`}
                    value={stoplosses}
                    onChange={setStoplosses}
                    isMulti={true}
                    dependentData={{ experiment, stocks, models, adviceLimits, adviceLimitsMax }}
                />

                <TextField
                    label="Favorite Name"
                    variant="outlined"
                    value={favoriteName}
                    onChange={(e) => setFavoriteName(e.target.value)}
                    size="small"
                />

                <Button
                    variant="contained"
                    color="primary"
                    disabled={
                        !favoriteName || !experiment || !stocks.length || !models.length ||
                        !adviceLimits.length || !adviceLimitsMax.length || !stoplosses.length
                    }
                    onClick={handleSaveFavorite}
                >
                    Save Favorite
                </Button>

                {error && (
                    <p style={{ color: 'red', marginTop: '8px', fontSize: '0.9rem' }}>
                        {error}
                    </p>
                )}

                {success && (
                    <p style={{ color: 'green', marginTop: '8px', fontSize: '0.9rem' }}>
                        {success}
                    </p>
                )}


            </div>
        </div>
    );
};

export default NewChartContainer;