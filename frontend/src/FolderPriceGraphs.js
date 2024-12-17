import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import API_BASE_URL from "./config";
import axios from 'axios';

const FolderPriceGraphs = ({ stocks, experiment }) => {
    const [stockGraphData, setStockGraphData] = useState([]);

    useEffect(() => {
        if (experiment && stocks.length > 0) {
            fetchStockPriceData();
        } else {
            setStockGraphData([]);
        }
    }, [stocks, experiment]);

    const fetchStockPriceData = async () => {
        try {
            const response = await axios.post(API_BASE_URL + '/stockPrices', {
                experiment,
                stocks,
            });

            const stockData = response.data;

            // Process and combine stock data for the chart
            const newGraphData = Object.keys(stockData).map((stockName) => {
                const stockPrices = stockData[stockName] || [];
                if (stockPrices.length > 0) {
                    const firstValue = parseFloat(stockPrices[0].price);
                    return {
                        name: stockName,
                        data: stockPrices.map((row) => ({
                            x: row.date.replace(/-/g, '/'),
                            y: ((parseFloat(row.price) - firstValue) / firstValue) * 100,
                        })),
                    };
                }
                return { name: stockName, data: [] };
            });

            setStockGraphData(newGraphData);
        } catch (error) {
            console.error('Failed to fetch stock price data', error);
        }
    };

    const chartOptions = {
        chart: {
            type: 'line',
            height: 500,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
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
        title: {
            text: 'Stock Price Change (%)',
            align: 'center',
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
        },
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {stockGraphData.length > 0 ? (
                <Chart
                    options={chartOptions}
                    series={stockGraphData}
                    type="line"
                    height={350}
                />
            ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Select stocks to show data</p>
                </div>
            )}
        </div>
    );
};

export default FolderPriceGraphs;
