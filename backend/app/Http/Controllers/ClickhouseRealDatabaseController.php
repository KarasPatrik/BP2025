<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ClickhouseRealDatabaseController extends  Controller
{
    public function getExperiments(Request $request)
    {
        try {
            $query = "SELECT experiment FROM simulation_stats GROUP BY experiment FORMAT JSON";
            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $experiments = collect($data['data'])->pluck('experiment');

            return response()->json($experiments->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to Remote ClickHouse',
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
            SELECT DISTINCT stock
            FROM simulation_stats
            WHERE experiment = '{$experimentName}'
            ORDER BY stock ASC
            FORMAT JSON
        ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $stocks = collect($data['data'])->pluck('stock');

            return response()->json($stocks->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to Remote ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getModels(Request $request)
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
                SELECT DISTINCT model
                FROM simulation_stats
                WHERE experiment = '{$experimentName}'
                  AND stock IN ('$stockList')
                ORDER BY model ASC
                FORMAT JSON
            ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $models = collect($data['data'])->pluck('model')->unique()->values();

            return response()->json($models->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getAdviceLimits(Request $request)
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

        // Prepare stock, model list for SQL
        $stockList = implode("','", array_map('addslashes', $stocks));
        $modelList = implode("','", array_map('addslashes', $models));

        try {
            $query = "
                SELECT DISTINCT advice_limit
                FROM simulation_stats
                WHERE experiment = '{$experimentName}'
                  AND stock IN ('$stockList')
                  AND model IN ('$modelList')

                ORDER BY advice_limit ASC
                FORMAT JSON
            ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $adviceLimits = collect($data['data'])->pluck('advice_limit')->unique()->values();

            return response()->json($adviceLimits->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getAdviceLimitsMax(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $adviceLimits = $request->input('adviceLimits', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }
        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }
        if (empty($models)) {
            return response()->json(['error' => 'At least one model is required'], 400);
        }
        if (empty($adviceLimits)) {
            return response()->json(['error' => 'At least one adviceLimit is required'], 400);
        }

        // Prepare stock, model list for SQL
        $stockList = implode("','", array_map('addslashes', $stocks));
        $modelList = implode("','", array_map('addslashes', $models));
        $adviceLimitList = "'" . implode("','", array_map('addslashes', $adviceLimits)) . "'";

        try {
            $query = "
                SELECT DISTINCT advice_limit_max
                FROM simulation_stats
                WHERE experiment = '{$experimentName}'
                  AND stock IN ('$stockList')
                  AND model IN ('$modelList')
                  AND advice_limit IN ($adviceLimitList)

                ORDER BY advice_limit_max ASC
                FORMAT JSON
            ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $adviceLimitsMax = collect($data['data'])->pluck('advice_limit_max')->unique()->values();

            return response()->json($adviceLimitsMax->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getStoplosses(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $adviceLimits = $request->input('adviceLimits', []);
        $adviceLimitsMax = $request->input('adviceLimitsMax', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }
        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }
        if (empty($models)) {
            return response()->json(['error' => 'At least one model is required'], 400);
        }
        if (empty($adviceLimits)) {
            return response()->json(['error' => 'At least one adviceLimit is required'], 400);
        }
        if (empty($adviceLimitsMax)) {
            return response()->json(['error' => 'At least one adviceLimitMax is required'], 400);
        }

        // Prepare stock, model list for SQL
        $stockList = implode("','", array_map('addslashes', $stocks));
        $modelList = implode("','", array_map('addslashes', $models));
        $adviceLimitList = implode("','", array_map('addslashes', $adviceLimits));
        $adviceLimitMaxList = implode("','", array_map('addslashes', $adviceLimitsMax));

        try {
            $query = "
                SELECT DISTINCT stop_loss
                FROM simulation_stats
                WHERE experiment = '{$experimentName}'
                  AND stock IN ('$stockList')
                  AND model IN ('$modelList')
                  AND advice_limit IN ('$adviceLimitList')
                  AND advice_limit_max IN ('$adviceLimitMaxList')

                ORDER BY stop_loss ASC
                FORMAT JSON
            ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $stoplosses = collect($data['data'])->pluck('stop_loss')->unique()->values();

            return response()->json($stoplosses->values());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to connect to ClickHouse',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getSimulationData(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $adviceLimits = $request->input('adviceLimits', []);
        $adviceLimitsMax = $request->input('adviceLimitsMax', []);
        $stoplosses = $request->input('stoplosses', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }
        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }
        if (empty($models)) {
            return response()->json(['error' => 'At least one model is required'], 400);
        }
        if (empty($adviceLimits)) {
            return response()->json(['error' => 'At least one adviceLimit is required'], 400);
        }
        if (empty($adviceLimitsMax)) {
            return response()->json(['error' => 'At least one adviceLimitMax is required'], 400);
        }
        if (empty($stoplosses)) {
            return response()->json(['error' => 'At least one stoploss is required'], 400);
        }

        $totalCombinations = count($stocks) * count($models) * count($adviceLimits) * count($adviceLimitsMax) * count($stoplosses);
        $interval = (int) ceil($totalCombinations / 150);
        $interval = max($interval, 1); // Ensure it's never less than 1

        // Prepare stock, model list for SQL
        $stockList = implode("','", array_map('addslashes', $stocks));
        $modelList = implode("','", array_map('addslashes', $models));
        $adviceLimitList = implode("','", array_map('addslashes', $adviceLimits));
        $adviceLimitMaxList = implode("','", array_map('addslashes', $adviceLimitsMax));
        $stoplossList = implode("','", array_map('addslashes', $stoplosses));

        try {
            $query = "
                SELECT *
        FROM (
            SELECT
                stock,
                model,
                limit,
                limit_max,
                stop_loss,
                close_date,
                gain,
                row_number() OVER (PARTITION BY stock, model, limit, limit_max, stop_loss ORDER BY close_date ASC) AS rn
            FROM simulation
            WHERE experiment = '{$experimentName}'
              AND stock IN ('$stockList')
              AND model IN ('$modelList')
              AND limit IN ('$adviceLimitList')
              AND limit_max IN ('$adviceLimitMaxList')
              AND stop_loss IN ('$stoplossList')

        )
        WHERE (rn - 1) % {$interval} = 0
        ORDER BY stock ASC, model ASC, limit ASC, limit_max ASC, stop_loss ASC, close_date ASC
        FORMAT JSON
            ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $rows = $data['data'] ?? [];

            $result = [];

            foreach ($rows as $row) {
                $key = "{$row['stock']} | {$row['model']}  | {$row['limit']} | {$row['limit_max']} | {$row['stop_loss']}";
                $result[$key][] = [
                    'date' => $row['close_date'],
                    'gain' => $row['gain'],
                ];
            }

            ksort($result); // Sort keys alphabetically

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'ClickHouse query failed',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getStockPrices(Request $request)
    {
        $stocks = $request->input('stocks', []);

        $dateFilter = "";
        if ($request->has('startDate') && $request->has('endDate')) {
            $start = addslashes($request->input('startDate'));
            $end   = addslashes($request->input('endDate'));
            $dateFilter = "AND date >= '$start' AND date <= '$end'";
        }

        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }

        $interval = (int) ceil(count($stocks)/5);
        $interval = max($interval, 1); // Safety check

        $stockList = implode("','", array_map('addslashes', $stocks));

        try {
            $query = "
                    SELECT *
                    FROM (
                        SELECT
                            stock,
                            date,
                            close,
                            row_number() OVER (PARTITION BY stock ORDER BY date ASC) AS rn,
                            count() OVER (PARTITION BY stock) AS total_rows
                        FROM ohlcv
                        WHERE stock IN ('$stockList')
                        $dateFilter
                    )
                    WHERE (rn - 1) % $interval = 0
                       OR rn = total_rows
                    ORDER BY stock ASC, date ASC
                    FORMAT JSON
                    ";

            $encodedQuery = urlencode($query);

            $url = 'https://' . env('CLICKHOUSE_REAL_HOST') . ':' . env('CLICKHOUSE_REAL_PORT') .
                '/?database=' . env('CLICKHOUSE_REAL_DATABASE') . '&query=' . $encodedQuery;

            $response = Http::withBasicAuth(
                env('CLICKHOUSE_REAL_USER'),
                env('CLICKHOUSE_REAL_PASSWORD')
            )->get($url);

            $data = json_decode($response->body(), true);
            $rows = $data['data'] ?? [];

            $result = [];

            foreach ($rows as $row) {
                $stock = $row['stock'];
                $result[$stock][] = [
                    'date' => substr($row['date'], 0, 19), // Trims to 'YYYY-MM-DD HH:MM:SS'
                    'price' => (float)$row['close'],
                ];
            }

            ksort($result); // Sort keys alphabetically

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
                'details' => $e->getMessage()
            ], 500);
        }
    }

}
