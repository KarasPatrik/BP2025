import React, { useEffect, useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';
import { API_BASE_URL, CHART_LINES_LIMIT } from '../config.js';

export default function CombinedHighchart({
                                              experiment, stocks, models, stopLosses, dataFile
                                          }) {
    const [mainSeries, setMainSeries]   = useState([]);
    const [stockSeries, setStockSeries] = useState([]);
    const [loading, setLoading]         = useState(false);

    const mainChartRef  = useRef(null);
    const stockChartRef = useRef(null);

    useEffect(() => {
        if (!experiment || !stocks.length || !models.length || !stopLosses.length) {
            setMainSeries([]);
            setStockSeries([]);
            return;
        }
        if (stocks.length * models.length * stopLosses.length > CHART_LINES_LIMIT) {
            setMainSeries('too-many');
            setStockSeries([]);
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const { data: md } = await axios.post(`${API_BASE_URL}/sampledData`, {
                    experiment, stocks, models, stopLosses, dataFile
                });
                setMainSeries(Object.entries(md).map(([name, rows]) => ({
                    name,
                    data: rows.map(r => [ new Date(r.date).getTime(), parseFloat(r.gain)*100 ])
                })));

                const { data: sd } = await axios.post(`${API_BASE_URL}/stockPrices`, { experiment, stocks });
                setStockSeries(Object.entries(sd).map(([name, rows]) => {
                    if (!rows.length) return { name, data: [] };
                    const base = parseFloat(rows[0].price);
                    return {
                        name,
                        data: rows.map(r => [
                            new Date(r.date).getTime(),
                            ((parseFloat(r.price) - base)/base)*100
                        ])
                    };
                }));
            } catch (err) {
                console.error(err);
                setMainSeries([]);
                setStockSeries([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [experiment, stocks, models, stopLosses, dataFile]);


    useEffect(() => {
        if (!Array.isArray(mainSeries)) return; // only log if it's an array
        const mainCount      = mainSeries.length;
        const mainPoints     = mainSeries.reduce((sum, s) => sum + s.data.length, 0);
        const stockCount     = stockSeries.length;
        const stockPoints    = stockSeries.reduce((sum, s) => sum + s.data.length, 0);
        console.log(`Main series: ${mainCount} series, ${mainPoints} total points`);
        console.log(`Stock series: ${stockCount} series, ${stockPoints} total points`);
        }, [mainSeries, stockSeries]);



    function syncExtremes(e) {
        if (e.trigger === 'sync') return;
        const thisChart = this.chart;
        const otherChart =
            thisChart === mainChartRef.current.chart
                ? stockChartRef.current.chart
                : mainChartRef.current.chart;

        otherChart.xAxis[0].setExtremes(
            e.min, e.max,
            true, false,
            { trigger: 'sync' }
        );
    }


    const many = mainSeries.length > 10;


    const tooltip = many
        ? { enabled: false }
        : {
            shared: true,
            headerFormat: '<b>{point.key:%e %b %Y}</b><br/>',
            pointFormat: '{series.name}: <b>{point.y:.2f}%</b><br/>'
        };


    const plotOptions = {
        series: {
            marker: { enabled: false },
            ...(many && {
                enableMouseTracking: false,
                states: { hover: { enabled: false } }
            })
        }
    };


    const sharedLegend = {
        layout: 'horizontal', align: 'center', verticalAlign: 'bottom',
        itemStyle: { fontSize: '10px' }, itemDistance: 10,
        maxHeight: 60, navigation: { enabled: true, animation: true }
    };

    const xAxisWithSync = {
        type: 'datetime',
        title: { text: 'Date' },
        crosshair: {
            width: 1,
            color: 'rgba(0,0,0,0.2)',
            dashStyle: 'ShortDash'
        },
        events: { afterSetExtremes: syncExtremes }
    };


    const mainOpts = {
        chart:   { type: 'line', height: 500, zoomType: 'x', panKey: 'shift', panning: { enabled: true } },
        title:   { text: 'Gain Over Time' },
        xAxis:   xAxisWithSync,
        yAxis:   {
            title: { text: 'Gain (%)' },
            labels: { formatter() { return `${this.value.toFixed(2)}%`; } }
        },
        tooltip,
        legend:    sharedLegend,
        plotOptions,
        series:    mainSeries
    };

    const stockOpts = {
        chart:   { type: 'line', height: 300, zoomType: 'x', panKey: 'shift', panning: { enabled: true } },
        title:   { text: 'Stock Price Change (%)' },
        xAxis:   xAxisWithSync,
        yAxis:   {
            title: { text: 'Price Change (%)' },
            labels: { formatter() { return `${this.value.toFixed(2)}%`; } }
        },
        tooltip,
        legend:    sharedLegend,
        plotOptions,
        series:    stockSeries
    };


    if (loading) return <p>Loading…</p>;

    if (mainSeries === 'too-many') {
        return <p style={{ textAlign: 'center', color: 'red' }}>
            Too many combinations selected (max allowed is {CHART_LINES_LIMIT}).<br />
            Please reduce the number of stocks, models, or stop losses.
        </p>;
    }

    if (!mainSeries.length) {
        return <p style={{ textAlign: 'center' }}>No data to show.</p>;
    }

    return (
        <div style={{ padding:20 }}>
            <div style={{ border:'1px solid #f00', marginBottom:20 }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={mainOpts}
                    ref={mainChartRef}
                />
            </div>
            <div style={{ border:'1px solid #00f' }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={stockOpts}
                    ref={stockChartRef}
                />
            </div>
        </div>
    );
}
