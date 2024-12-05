import React, { useState, useEffect, useCallback } from 'react';
import SelectField from './SelectField';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import FolderPriceGraphs from './FolderPriceGraphs';
import API_BASE_URL from './config';

const ChartContainer = ({ dataFile }) => {
    const [experiments, setExperiments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [models, setModels] = useState([]);
    const [stopLosses, setStopLosses] = useState([]);
    const [series, setSeries] = useState([]);
    const location = useLocation(); // Get the current location

    const fetchData = useCallback(async () => {
        if (
            folders.length === 0 ||
            models.length === 0 ||
            stopLosses.length === 0 ||
            experiments.length === 0
        ) {

            setSeries([]);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/combinedCsv`, {
                folders,
                models,
                stopLosses,
                experiments,
                dataFile,
            });

            const combinedData = response.data;

            const newSeries = Object.keys(combinedData).map((key) => ({
                name: key,
                data: combinedData[key].map((row) => ({
                    x: row.date.replace(/-/g, '/'),
                    y: parseFloat(row.gain),
                })),
            }));

            setSeries(newSeries);
        } catch (error) {
            console.error('Failed to fetch combined data', error);
        }
    }, [folders, models, stopLosses, experiments, dataFile]);

    useEffect(() => {
        if (experiments.length === 0) {
            setFolders([]);
            setModels([]);
            setStopLosses([]);
        }
        fetchData();
    }, [folders, models, stopLosses, experiments, fetchData]);


    const getStockEndpoint = () => {
        // Use only the first experiment in the array
        const firstExperiment = experiments[0] ? `experiment=${encodeURIComponent(experiments[0])}` : '';
        return `${API_BASE_URL}/mainFolders${firstExperiment ? `?${firstExperiment}` : ''}`;
    };

    const getModelEndpoint = () => {
        // Use only the first experiment in the array
        const firstExperiment = experiments[0] ? `experiment=${encodeURIComponent(experiments[0])}` : '';
        return `${API_BASE_URL}/models${firstExperiment ? `?${firstExperiment}` : ''}`;
    };

    const getStoplossEndpoint = () => {
        // Use only the first experiment in the array
        const firstExperiment = experiments[0] ? `experiment=${encodeURIComponent(experiments[0])}` : '';
        return `${API_BASE_URL}/stoploss${firstExperiment ? `?${firstExperiment}` : ''}`;
    };


    const chartOptions = {
        chart: {
            type: 'line',
            height: 600,
            minHeight: 500,
        },
        stroke: {
            curve: 'smooth',
            width: 1.5,
        },
        xaxis: {
            type: 'datetime',
            title: { text: 'Date' },
        },
        yaxis: {
            title: { text: 'Gain' },
            labels: {
                formatter: (val) => `${(val * 100).toFixed(2)}%`,
            },
        },
        tooltip: {
            shared: true,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => `${(val * 100).toFixed(2)}%`,
            },
        },
        title: {
            text: dataFile,
            align: 'center',
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            floating: false,
            height: 100,
        },
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'stretch',
                height: '100vh',
            }}
        >
            {/* Line Chart */}
            <div style={{ flex: 3, padding: '20px' }}>
                <Chart
                    options={chartOptions}
                    series={series}
                    type="line"
                    height={600}
                />

                <FolderPriceGraphs experiments={experiments} folders={folders} dataFile={dataFile} /> <br /> <br />
            </div>
            <br /> <br />

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
                <SelectField
                    label="Experiment"
                    endpoint={API_BASE_URL + "/experiments"}
                    value={experiments}
                    onChange={setExperiments}
                />
                <SelectField
                    label="Stock"
                    endpoint={getStockEndpoint()}
                    value={folders}
                    onChange={setFolders}
                />
                <SelectField
                    label="Model"
                    endpoint={getModelEndpoint()}
                    value={models}
                    onChange={setModels}
                />
                <SelectField
                    label="Stop Loss"
                    endpoint={getStoplossEndpoint()}
                    value={stopLosses}
                    onChange={setStopLosses}
                />
            </div>
        </div>
    );
};

export default ChartContainer;
