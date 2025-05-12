import React, {useState} from "react";
import SelectField from "./SelectField.jsx";
import {API_BASE_URL} from "../config.js";
import NewCombinedHighchart from "./NewCombinedHighChart.jsx";

const NewChartContainer = () => {
    const [experiment, setExperiment] = useState('');
    const [stocks, setStocks] = useState([]);
    const [models, setModels] = useState([]);
    const [adviceLimits, setAdviceLimits] = useState([]);
    const [adviceLimitsMax, setAdviceLimitsMax] = useState([]);
    const [stoplosses, setStoplosses] = useState([]);

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
                    gap: '40px',
                    padding: '120px 20px',
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
            </div>
        </div>
    );
};

export default NewChartContainer;