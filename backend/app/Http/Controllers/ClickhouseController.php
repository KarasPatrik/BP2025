<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class ClickhouseController extends Controller
{
    public function getExperiments(Request $request)
    {
        try {
            $query = "SELECT DISTINCT experiment FROM trades WHERE experiment IS NOT NULL FORMAT JSON";

            $response = Http::withBody(
                $query,
                'text/plain'
            )->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );

            $data = json_decode($response->body(), true);

            $experiments = collect($data['data'])->pluck('experiment');

            return response()->json($experiments->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getStocks(Request $request)
    {
        $experimentName = $request->input('experiment');

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }

        try {
            $query = "
                SELECT DISTINCT stock_file
                FROM trades
                WHERE experiment = '{$experimentName}'
                ORDER BY stock_file ASC
                FORMAT JSON
            ";

            $response = Http::withBody(
                $query,
                'text/plain'
            )->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );

            $data = json_decode($response->body(), true);

            $stocks = collect($data['data'])->pluck('stock_file');

            return response()->json($stocks->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getUniqueModels(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }

        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }

        // Prepare stock list for SQL
        $stockList = implode("','", array_map('addslashes', $stocks));

        try {
            $query = "
                SELECT DISTINCT model_name
                FROM trades
                WHERE experiment = '{$experimentName}'
                  AND stock_file IN ('$stockList')
                FORMAT JSON
            ";

            $response = Http::withBody(
                $query,
                'text/plain'
            )->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );

            $data = json_decode($response->body(), true);

            $models = collect($data['data'])->pluck('model_name')->unique()->values();

            return response()->json($models);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    public function getUniqueStopLosses(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }

        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }

        if (empty($models)) {
            return response()->json(['error' => 'At least one model is required'], 400);
        }

        // Prepare lists for SQL
        $stockList = implode("','", array_map('addslashes', $stocks));
        $modelList = implode("','", array_map('addslashes', $models));

        try {
            $query = "
                SELECT DISTINCT stop_loss
                FROM trades
                WHERE experiment = '{$experimentName}'
                  AND stock_file IN ('$stockList')
                  AND model_name IN ('$modelList')
                FORMAT JSON
            ";

            $response = Http::withBody(
                $query,
                'text/plain'
            )->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );

            $data = json_decode($response->body(), true);

            $stopLosses = collect($data['data'])->pluck('stop_loss')->unique()->sort()->values();

            return response()->json($stopLosses);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }


    public function getCombinedCsvData(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $stopLosses = $request->input('stopLosses', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }
        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }
        if (empty($models)) {
            return response()->json(['error' => 'At least one model is required'], 400);
        }
        if (empty($stopLosses)) {
            return response()->json(['error' => 'At least one stop loss is required'], 400);
        }
        // Prepare SQL IN lists
        $stockList = implode("','", array_map('addslashes', $stocks));
        $modelList = implode("','", array_map('addslashes', $models));
        $stopLossList = "'" . implode("','", array_map('addslashes', $stopLosses)) . "'";

        try {
            $query = "
                SELECT stock_file, model_name, stop_loss, date, gain
                FROM trades
                WHERE experiment = '{$experimentName}'
                  AND stock_file IN ('$stockList')
                  AND model_name IN ('$modelList')
                  AND stop_loss IN ($stopLossList)
                ORDER BY stock_file ASC, model_name ASC, stop_loss ASC, date ASC
                FORMAT JSON
            ";

            $response = Http::withBody(
                $query,
                'text/plain'
            )->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );


            $data = json_decode($response->body(), true);

            $rows = $data['data'] ?? [];

            // Group data exactly like before: by "stock | model | stoploss"
            $result = [];

            foreach ($rows as $row) {
                $key = "{$row['stock_file']} | {$row['model_name']} | {$row['stop_loss']}";
                $result[$key][] = [
                    'date' => $row['date'],
                    'gain' => $row['gain'],
                ];
            }

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getSampledClickData(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $stopLosses = $request->input('stopLosses', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }
        if (empty($stocks) || empty($models) || empty($stopLosses)) {
            return response()->json(['error' => 'Stocks, models and stop losses are required'], 400);
        }

        $totalCombinations = count($stocks) * count($models) * count($stopLosses);
        $interval = (int) ceil($totalCombinations / 300);
        $interval = max($interval, 1); // Ensure it's never less than 1

        // Prepare values
        $stockList = "'" . implode("','", array_map('addslashes', $stocks)) . "'";
        $modelList = "'" . implode("','", array_map('addslashes', $models)) . "'";
        $stopLossList = "'" . implode("','", array_map('addslashes', $stopLosses)) . "'";

        // Build query using ClickHouse row_number() over window
        $query = "
        SELECT *
        FROM (
            SELECT
                stock_file,
                model_name,
                stop_loss,
                date,
                gain,
                row_number() OVER (PARTITION BY stock_file, model_name, stop_loss ORDER BY date ASC) AS rn
            FROM trades
            WHERE experiment = '{$experimentName}'
              AND stock_file IN ($stockList)
              AND model_name IN ($modelList)
              AND stop_loss IN ($stopLossList)
        )
        WHERE (rn - 1) % {$interval} = 0
        ORDER BY stock_file ASC, model_name ASC, stop_loss ASC, date ASC
        FORMAT JSON
    ";

        try {
            $response = Http::withBody($query, 'text/plain')->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );

            $data = json_decode($response->body(), true);
            $rows = $data['data'] ?? [];

            $result = [];

            foreach ($rows as $row) {
                $key = "{$row['stock_file']} | {$row['model_name']} | {$row['stop_loss']}";
                $result[$key][] = [
                    'date' => $row['date'],
                    'gain' => $row['gain'],
                ];
            }

            ksort($result); // Sort keys alphabetically

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'ClickHouse query failed',
                'details' => $e->getMessage(),
            ], 500);
        }
    }


    public function getSampledClickStockPrices(Request $request)
    {
        $stocks = $request->input('stocks', []);

        $interval = (int) ceil(count($stocks) / 300);
        $interval = max($interval, 1); // Safety check

        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }

        // Escape stock names safely
        $stockList = "'" . implode("','", array_map('addslashes', $stocks)) . "'";

        // Query with window function to sample every 25th row per stock
        $query = "
        SELECT *
        FROM (
            SELECT
                stock,
                date,
                price,
                row_number() OVER (PARTITION BY stock ORDER BY date ASC) AS rn
            FROM stock_prices
            WHERE stock IN ($stockList)
        )
        WHERE (rn - 1) % $interval = 0
        ORDER BY stock ASC, date ASC
        FORMAT JSON
    ";

        try {
            $response = Http::withBody($query, 'text/plain')->post(
                'http://' . env('CLICKHOUSE_HOST') . ':' . env('CLICKHOUSE_PORT') . '/?database=default'
            );

            $data = json_decode($response->body(), true);
            $rows = $data['data'] ?? [];

            $result = [];

            foreach ($rows as $row) {
                $stock = $row['stock'];
                $result[$stock][] = [
                    'date' => $row['date'],
                    'price' => (float)$row['price'],
                ];
            }

            // Add price_change field (relative to first price per stock)
            foreach ($result as $stock => &$points) {
                if (empty($points)) continue;

                $firstPrice = $points[0]['price'];
                foreach ($points as &$point) {
                    $point['price_change'] = $firstPrice != 0
                        ? (($point['price'] - $firstPrice) / $firstPrice) * 100
                        : 0.0;
                }
            }

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'ClickHouse query failed',
                'details' => $e->getMessage(),
            ], 500);
        }
    }



}





