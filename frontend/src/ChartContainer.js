import React, { useState, useEffect } from 'react';
import SelectField from './SelectField';
import Chart from 'react-apexcharts';
import axios from 'axios';
import {useLocation} from "react-router-dom";
import FolderPriceGraphs from "./FolderPriceGraphs";
import API_BASE_URL from "./config";

const ChartContainer = ({ dataFile}) => {
    const [experiment, setExperiment] = useState('');
    const [stocks, setStocks] = useState([]);
    const [models, setModels] = useState([]);
    const [stopLosses, setStopLosses] = useState([]);
    const [series, setSeries] = useState([]);
    const location = useLocation(); // Get the current location

    const handleExperimentChange = (value) => {
        setExperiment(value);
        setStocks([]); // Clear stocks
        setModels([]); // Clear models
        setStopLosses([]); // Clear stop losses
    };

    const handleStocksChange = (value) => {
        setStocks(value);
        setModels([]); // Clear models
        setStopLosses([]); // Clear stop losses
    };

    const handleModelsChange = (value) => {
        setModels(value);
        setStopLosses([]); // Clear stop losses
    };

    useEffect(() => {
        if (stocks.length === 0 || models.length === 0 || stopLosses.length === 0) {
            setSeries([]);
        } else {
            fetchData();
        }
    }, [experiment, stocks, models, stopLosses, location]);


    const fetchData = async () => {
        try {
            const response = await axios.post(API_BASE_URL + '/data', {
                experiment,
                stocks,
                models,
                stopLosses,
                dataFile
            });

            const combinedData = response.data;

            const newSeries = Object.keys(combinedData).map(key => ({
                name: key,
                data: combinedData[key].map(row => ({
                    x: row.date.replace(/-/g, '/'),
                    y: parseFloat(row.gain)
                }))
            }));

            setSeries(newSeries);
        } catch (error) {
            console.error('Failed to fetch combined data', error);
        }
    };


    const chartOptions = {
        chart: {
            type: 'line',
            height: 600,
            minHeight: 500
        },
        stroke: {
            curve: 'smooth',
            width: 1.5
        },
        xaxis: {
            type: 'datetime',
            title: { text: 'Date' }
        },
        yaxis: {
            title: { text: 'Gain' },
            labels: {
                formatter: (val) => `${(val * 100).toFixed(2)}%`
            }
        },
        tooltip: {
            shared: true,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => `${(val * 100).toFixed(2)}%`
            }
        },
        title: {
            text: dataFile,
            align: 'center'
        },
        legend: {
            position: 'bottom', // Legend at the bottom
            horizontalAlign: 'center',
            floating: false,
            height: 100,
        }
    };


    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', height: '100vh' }}>

            {/* Line Chart */}
            <div style={{ flex: 3, padding: '20px' }}>
                <Chart
                    options={chartOptions}
                    series={series}
                    type="line"
                    height={600}
                />

                <FolderPriceGraphs experiment={experiment} stocks={stocks} /> <br/> <br/>
            </div> <br/> <br/>

            {/* Select Fields */}
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
                {/* Experiment Select */}
                <SelectField
                    label="Experiment"
                    endpoint={`${API_BASE_URL}/experiments`}
                    value={experiment}
                    onChange={handleExperimentChange}
                    isMulti={false} // Single select
                />

                {/* Stocks Select */}
                <SelectField
                    label="Stocks"
                    endpoint={`${API_BASE_URL}/stocks`}
                    value={stocks}
                    onChange={handleStocksChange}
                    isMulti={true} // Multi-select
                    dependentData={{ experiment }} // Pass experiment as dependency
                />

                {/* Models Select */}
                <SelectField
                    label="Models"
                    endpoint={`${API_BASE_URL}/models`}
                    value={models}
                    onChange={handleModelsChange}
                    isMulti={true} // Multi-select
                    dependentData={{ experiment, stocks }} // Pass experiment and stocks as dependencies
                />

                {/* Stop Losses Select */}
                <SelectField
                    label="StopLosses"
                    endpoint={`${API_BASE_URL}/stoplosses`}
                    value={stopLosses}
                    onChange={setStopLosses}
                    isMulti={true} // Multi-select
                    dependentData={{ experiment, stocks, models }} // Pass experiment, stocks, and models as dependencies
                />
            </div>
        </div>
    );
};

export default ChartContainer;
