import React, { useState, useEffect } from 'react';
import SelectField from './SelectField';
import Chart from 'react-apexcharts';
import axios from 'axios';

const ChartContainer = () => {
    const [folders, setFolders] = useState([]);
    const [models, setModels] = useState([]);
    const [stopLosses, setStopLosses] = useState([]);
    const [series, setSeries] = useState([]);

    useEffect(() => {
        if (folders.length === 0 || models.length === 0 || stopLosses.length === 0) {
            setSeries([]);
        } else {
            fetchData();
        }
    }, [folders, models, stopLosses]);

    // const fetchData = async () => {
    //     const newSeries = [];
    //
    //     for (let folder of folders) {
    //         for (let model of models) {
    //             for (let stopLoss of stopLosses) {
    //                 const subfolder = `${model}_stoploss_${stopLoss}`;
    //                 try {
    //                     const response = await axios.get(`http://localhost:8080/api/csv`, {
    //                         params: { folder, subfolder }
    //                     });
    //
    //                     const csvData = response.data;
    //                     console.log(`Data for ${folder}/${subfolder}:`, csvData);
    //
    //                     const data = csvData
    //                         .filter(row => row.date && row.gain)
    //                         .map(row => ({
    //                             x: row.date.replace(/-/g, '/'),
    //                             y: parseFloat(row.gain)
    //                         }));
    //
    //                     if (data.length > 0) {
    //                         newSeries.push({
    //                             name: `${folder} | ${model} | ${stopLoss}`,
    //                             data
    //                         });
    //                     }
    //                 } catch (error) {
    //                     console.error(`Failed to fetch data for ${folder}/${subfolder}`, error);
    //                 }
    //             }
    //         }
    //     }
    //
    //     setSeries(newSeries);
    // };

    const fetchData = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/combinedCsv', {
                folders,
                models,
                stopLosses
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
            text: 'Gain over Time by Folder, Model, and Stop-Loss',
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
            </div>

            {/* Select Fields */}
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: '200px', gap: '40px', padding: '120px 20px' }}>

                <SelectField
                    label="Folder"
                    endpoint="http://localhost:8080/api/mainFolders"
                    value={folders}
                    onChange={setFolders}
                />
                <SelectField
                    label="Model"
                    endpoint="http://localhost:8080/api/models"
                    value={models}
                    onChange={setModels}
                />
                <SelectField
                    label="Stop Loss"
                    endpoint="http://localhost:8080/api/stoploss"
                    value={stopLosses}
                    onChange={setStopLosses}
                />
            </div>
        </div>
    );
};

export default ChartContainer;
