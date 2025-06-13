import React, {useEffect, useRef, useState} from "react";
import {API_BASE_URL, CHART_LINES_LIMIT} from "../config.js";
import axios from "axios";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

function NewCombinedHighchart({
                                              experiment, stocks, models, adviceLimits, adviceLimitsMax, stoplosses
                                          }) {
    const [mainSeries, setMainSeries]   = useState([]);
    const [stockSeries, setStockSeries] = useState([]);
    const [loading, setLoading]         = useState(false);

    const mainChartRef  = useRef(null);
    const stockChartRef = useRef(null);

    useEffect(() => {
        if (!experiment || !stocks.length || !models.length || !adviceLimits.length || !adviceLimitsMax.length ||!stoplosses.length) {
            setMainSeries([]);
            setStockSeries([]);
            return;
        }
        if (stocks.length * models.length * stoplosses.length * adviceLimits.length * adviceLimitsMax.length > CHART_LINES_LIMIT) {
            setMainSeries('too-many');
            setStockSeries([]);
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const { data: md } = await axios.post(`${API_BASE_URL}/realClickSimulationData`, {
                    experiment, stocks, models, adviceLimits, adviceLimitsMax, stoplosses
                });
                setMainSeries(Object.entries(md).map(([name, rows]) => ({
                    name,
                    data: rows.map(r => [ new Date(r.date).getTime(), (parseFloat(r.gain)-1)*100 ])
                })));

                const allDates = Object.values(md)
                    .flat()
                    .map(r => new Date(r.date).getTime())
                    .filter(Boolean);

                const minDate = new Date(Math.min(...allDates));
                const maxDate = new Date(Math.max(...allDates));
                console.log("minDate: " + minDate)
                console.log("maxDate: " + maxDate)

                const startDate = minDate.toISOString().slice(0, 19).replace('T', ' ');
                const endDate = maxDate.toISOString().slice(0, 19).replace('T', ' ');
                console.log("startDate: " + startDate)
                console.log("endDate: " + endDate)

                const { data: sd } = await axios.post(`${API_BASE_URL}/realClickStockPrices`, { stocks, startDate, endDate });
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
    }, [experiment, stocks, models, adviceLimits, adviceLimitsMax, stoplosses]);

    useEffect(() => {
        if (!Array.isArray(mainSeries)) return;
        const mainCount      = mainSeries.length;
        const mainPoints     = mainSeries.reduce((sum, s) => sum + s.data.length, 0);
        const stockCount     = stockSeries.length;
        const stockPoints    = stockSeries.reduce((sum, s) => sum + s.data.length, 0);
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
            <div style={{marginBottom:20 }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={mainOpts}
                    ref={mainChartRef}
                />
            </div>
            <div>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={stockOpts}
                    ref={stockChartRef}
                />
            </div>
        </div>
    );
}

export default React.memo(NewCombinedHighchart);
