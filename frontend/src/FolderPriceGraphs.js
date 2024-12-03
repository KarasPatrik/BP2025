import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import {yellow} from "@mui/material/colors";
import API_BASE_URL from "./config";

const FolderPriceGraphs = ({ folders, dataFile }) => {
    const [folderGraphs, setFolderGraphs] = useState([]);

    useEffect(() => {
        if (folders.length > 0) {
            fetchFolderPriceData();
        } else {
            setFolderGraphs([]); // Reset if no folders are selected
        }
    }, [folders]);

    const fetchFolderPriceData = async () => {
        try {
            const response = await axios.post(API_BASE_URL + '/folderPriceData', {
                folders,
                dataFile,
            });

            const folderData = response.data;

            // Process folder-specific price graphs
            const newFolderGraphs = Object.keys(folderData).map((folder) => {
                const folderPrices = folderData[folder] || [];
                if (folderPrices.length > 0) {
                    const firstValue = parseFloat(folderPrices[0].price);
                    return {
                        name: folder,
                        data: folderPrices.map((row) => ({
                            x: row.date.replace(/-/g, '/'),
                            y: ((parseFloat(row.price) - firstValue) / firstValue) * 100, // Percentage change
                        })),
                    };
                }
                return { name: folder, data: [] };
            });

            setFolderGraphs(newFolderGraphs);
        } catch (error) {
            console.error('Failed to fetch folder price data', error);
        }
    };

    const folderChartOptions = {
        chart: {
            type: 'line',
            height: 250,
        },
        stroke: {
            curve: 'smooth',
            width: 1.5,
            strokeColor: yellow,
        },
        xaxis: {
            type: 'datetime',
            title: { text: 'Date' },
        },
        yaxis: {
            title: { text: 'Price Change (%)' },
            labels: {
                formatter: (val) => `${val.toFixed(2)}%`,
            },
        },
        tooltip: {
            shared: true,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => `${val.toFixed(2)}%`,
            },
        },
    };

    return (
        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}>
            {folderGraphs.map((folderGraph, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                    <Chart
                        options={{ ...folderChartOptions, title: { text: `Folder: ${folderGraph.name}` } }}
                        series={[folderGraph]}
                        type="line"
                        height={250}
                    />
                </div>
            ))}
        </div>
    );
};

export default FolderPriceGraphs;
