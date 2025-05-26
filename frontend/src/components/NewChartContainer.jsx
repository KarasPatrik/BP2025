import React, {useEffect, useMemo, useState} from "react";
import SelectField from "./SelectField.jsx";
import {API_BASE_URL, CHART_LINES_LIMIT} from "../config.js";
import NewCombinedHighchart from "./NewCombinedHighChart.jsx";
import axios from "axios";
import {TextField, Button, Box} from '@mui/material';
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

    const stocksDependentData = useMemo(() => ({ experiment }), [experiment]);
    const modelsDependentData = useMemo(() => ({ experiment, stocks }), [experiment, stocks]);
    const limitsDependentData = useMemo(() => ({ experiment, stocks, models }), [experiment, stocks, models]);
    const limitsMaxDependentData = useMemo(() => ({ experiment, stocks, models, adviceLimits }), [experiment, stocks, models, adviceLimits]);
    const stoplossesDependentData = useMemo(() => ({ experiment, stocks, models, adviceLimits, adviceLimitsMax }), [experiment, stocks, models, adviceLimits, adviceLimitsMax]);

    const getLength = (arr) => Math.max(arr.length, 1);
    const COMBO_LIMIT = CHART_LINES_LIMIT;
    const comboCount = experiment && stocks.length ?
        getLength(stocks) *
        getLength(models) *
        getLength(adviceLimits) *
        getLength(adviceLimitsMax) *
        getLength(stoplosses)
        : 0;
    const isOverLimit = comboCount > COMBO_LIMIT;

    const comboPotential = {
        models: getLength(stocks),
        adviceLimits: getLength(stocks) * getLength(models),
        adviceLimitsMax: getLength(stocks) * getLength(models) * getLength(adviceLimits),
        stoplosses: getLength(stocks) * getLength(models) * getLength(adviceLimits) * getLength(adviceLimitsMax),
    };
    const block = {
        models: comboPotential.models >= COMBO_LIMIT,
        adviceLimits: comboPotential.adviceLimits >= COMBO_LIMIT,
        adviceLimitsMax: comboPotential.adviceLimitsMax >= COMBO_LIMIT,
        stoplosses: comboPotential.stoplosses >= COMBO_LIMIT,
    };
    const firstBlocked = Object.entries(block).find(([key, value]) => value)?.[0];

    useEffect(() => {
        if (location.state?.favorite) {
            const fav = location.state.favorite;
            setExperiment(fav.experiment);
            setStocks(fav.stocks?.map(s => s.name.toString()) || []);
            setModels(fav.simulation_models?.map(m => m.name.toString()) || []);
            setAdviceLimits(fav.advice_limits?.map(a => a.name.toString()) || []);
            setAdviceLimitsMax(fav.advice_limits_max?.map(a => a.name.toString()) || []);
            setStoplosses(fav.stoplosses?.map(s => s.name.toString()) || []);
            setFavoriteName(fav.name);
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
                arraysEqual(fav.simulation_models, models) &&
                arraysEqual(fav.advice_limits, adviceLimits) &&
                arraysEqual(fav.advice_limits_max, adviceLimitsMax) &&
                arraysEqual(fav.stoplosses, stoplosses)
            )
        );
    };

    const extractNames = (arr) => (arr || []).map(item => typeof item === 'string' ? item : item.name);

    const arraysEqual = (a, b) => {
        const sortedA = [...extractNames(a)].sort();
        const sortedB = [...extractNames(b)].sort();
        if (sortedA.length !== sortedB.length) return false;
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
            const { data: updatedFavorites } = await axios.get(`${API_BASE_URL}/favorites`);
            setExistingFavorites(updatedFavorites);
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
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: 'stretch',
            }}
        >
            {/* Combined Single Chart */}
            <Box sx={{ flex: 3, p: 2 }}>
                <NewCombinedHighchart
                    experiment={experiment}
                    stocks={stocks}
                    models={models}
                    adviceLimits={adviceLimits}
                    adviceLimitsMax={adviceLimitsMax}
                    stoplosses={stoplosses}
                />
            </Box>

            {/* Sidebar with selects */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '240px',
                    gap: 3,
                    p: 3,
                    pt: 10,
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
                    dependentData={stocksDependentData}
                />

                <SelectField
                    label="Models"
                    endpoint={`${API_BASE_URL}/realClickModels`}
                    value={models}
                    onChange={handleModelsChange}
                    isMulti={true}
                    dependentData={modelsDependentData}
                    comboLimitExceeded={block.models}
                    showComboWarning={firstBlocked === "models"}
                />

                <SelectField
                    label="AdviceLimits"
                    endpoint={`${API_BASE_URL}/realClickAdviceLimits`}
                    value={adviceLimits}
                    onChange={handleLimitsChange}
                    isMulti={true}
                    dependentData={limitsDependentData}
                    comboLimitExceeded={block.adviceLimits}
                    showComboWarning={firstBlocked === "adviceLimits"}
                />

                <SelectField
                    label="AdviceLimitsMax"
                    endpoint={`${API_BASE_URL}/realClickAdviceLimitsMax`}
                    value={adviceLimitsMax}
                    onChange={handleLimitsMaxChange}
                    isMulti={true}
                    dependentData={limitsMaxDependentData}
                    comboLimitExceeded={block.adviceLimitsMax}
                    showComboWarning={firstBlocked === "adviceLimitsMax"}
                />

                <SelectField
                    label="StopLosses"
                    endpoint={`${API_BASE_URL}/realClickStoplosses`}
                    value={stoplosses}
                    onChange={setStoplosses}
                    isMulti={true}
                    dependentData={stoplossesDependentData}
                    comboLimitExceeded={block.stoplosses}
                    showComboWarning={firstBlocked === "stoplosses"}
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

                {comboCount && (
                    <Box sx={{ mt: 1, fontSize: '0.9rem', color: isOverLimit ? 'red' : 'text.secondary' }}>
                        {isOverLimit ? (
                            <>⚠️ {comboCount.toLocaleString()} combinations selected (limit: {COMBO_LIMIT})</>
                        ) : (
                            <>{comboCount.toLocaleString()} combinations selected</>
                        )}
                    </Box>
                )}

                {error && (
                    <Box sx={{ color: 'red', fontSize: '0.9rem' }}>{error}</Box>
                )}
                {success && (
                    <Box sx={{ color: 'green', fontSize: '0.9rem' }}>{success}</Box>
                )}
            </Box>
        </Box>
    );
};

export default NewChartContainer;