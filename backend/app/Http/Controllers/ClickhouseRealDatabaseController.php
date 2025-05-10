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


}
