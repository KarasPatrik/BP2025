import React, {useEffect, useState} from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';


const CombinedChart = ({ experiment, stocks, models, stopLosses, dataFile }) => {
    const [mainSeries, setMainSeries] = useState([]);
    const [stockDataSeries, setStockDataSeries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!experiment || stocks.length === 0 || models.length === 0 || stopLosses.length === 0) {
            setMainSeries([]);
            setStockDataSeries([]);
            return;
        }

        (async () => {
            try {
                setLoading(true);

                const mainChartResp = await axios.post(API_BASE_URL+ '/sampledData', {
                    experiment,
                    stocks,
                    models,
                    stopLosses,
                    dataFile
                });
                const mainData = mainChartResp.data;

                const newMainSeries = Object.keys(mainData).map(key => ({
                    name: key,
                    data: mainData[key].map(row => ({
                        x: row.date.replace(/-/g, '/'),
                        y: parseFloat(row.gain)
                    }))
                }));

                setMainSeries(newMainSeries)

                const stockPriceResp = await axios.post(API_BASE_URL + '/stockPrices', {
                    experiment,
                    stocks,
                });
                const stockData = stockPriceResp.data;

                const stockGraphData = Object.keys(stockData).map((stockName) => {
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

                setStockDataSeries(stockGraphData);
                setVersion(v => v + 1);
            } catch (err) {
                console.error('Error fetching combined chart data:', err);
                setMainSeries([]);
                setStockDataSeries([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [experiment, stocks, models, stopLosses, dataFile]);

    const animationOpts = {
        enabled: false,
    };
    const mainChartOptions = {
        chart: {
            id: `main-chart-${version}`,
            group: 'combined',
            type: 'line',
            height: 500,
            animations: animationOpts,
            toolbar: {
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
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
            intersect: false,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => `${(val * 100).toFixed(2)}%`
            }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
        },
    };

    const stocksChartOptions = {
        chart: {
            id: `stocks-chart-${version}`,
            group: 'combined',
            type: 'line',
            height: 300,
            animations: animationOpts,
            toolbar: {
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
            },
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
            intersect: false,
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
        <div style={{ padding: '20px' }}>
            {loading && <p>Loading...</p>}
            {!loading && mainSeries.length === 0 && (
                <p style={{ textAlign: 'center' }}>No data to show. Please select experiment/stocks.</p>
            )}
            {!loading && mainSeries.length > 0 && (
                <div key={version} id="wrapper">
                    <div style={{ height: '500px', border: '1px solid red' }}>
                        <Chart
                            key={`main-${version}`}
                            type="line"
                            options={mainChartOptions}
                            series={mainSeries}
                            height="100%"
                            redraw={true}
                        />
                    </div>
                    <div style={{ height: '300px', border: '1px solid blue' }}>
                        <Chart
                            key={`stocks-${version}`}
                            type="line"
                            options={stocksChartOptions}
                            series={stockDataSeries}
                            height="100%"
                            redraw={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CombinedChart;
