import React, { useState } from 'react';
import SelectField from './SelectField.jsx';
import { API_BASE_URL } from '../config.js';
import CombinedHighchart from "./CombinedHighchart.jsx";

const ChartContainer = ({ dataFile}) => {
    const [experiment, setExperiment] = useState('');
    const [stocks, setStocks] = useState([]);
    const [models, setModels] = useState([]);
    const [stopLosses, setStopLosses] = useState([]);

    const handleExperimentChange = (value) => {
        setExperiment(value);
        setStocks([]);
        setModels([]);
        setStopLosses([]);
    };

    const handleStocksChange = (value) => {
        setStocks(value);
        setModels([]);
        setStopLosses([]);
    };

    const handleModelsChange = (value) => {
        setModels(value);
        setStopLosses([]);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
            {/* Combined Single Chart */}
            <div style={{ flex: "3", padding: '20px' }}>
                <CombinedHighchart
                    experiment={experiment}
                    stocks={stocks}
                    models={models}
                    stopLosses={stopLosses}
                    dataFile={dataFile}
                />
            </div>

            {/* Sidebar with selects */}
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    minWidth: '200px',
                    gap: '40px',
                    padding: '120px 20px',
                }}
            >
                <SelectField
                    label="Experiment"
                    endpoint={`${API_BASE_URL}/experiments`}
                    value={experiment}
                    onChange={handleExperimentChange}
                    isMulti={false}
                />

                <SelectField
                    label="Stocks"
                    endpoint={`${API_BASE_URL}/stocks`}
                    value={stocks}
                    onChange={handleStocksChange}
                    isMulti={true}
                    dependentData={{ experiment }}
                />

                <SelectField
                    label="Models"
                    endpoint={`${API_BASE_URL}/models`}
                    value={models}
                    onChange={handleModelsChange}
                    isMulti={true}
                    dependentData={{ experiment, stocks }}
                />

                <SelectField
                    label="StopLosses"
                    endpoint={`${API_BASE_URL}/stoplosses`}
                    value={stopLosses}
                    onChange={setStopLosses}
                    isMulti={true}
                    dependentData={{ experiment, stocks, models }}
                />
            </div>
        </div>
    );
};

export default ChartContainer;
