<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;


class DataController extends Controller
{
    private $baseDir = '/home/data/balance';

    public function getExperiments()
    {
        $folders = collect(File::directories($this->baseDir))->map(function ($folder) {
            return basename($folder);
        });

        return response()->json($folders);
    }

    public function getStocks(Request $request)
    {
        $experimentName = $request->input('experiment');

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }

        $experimentPath = $this->baseDir . '/' . $experimentName . '/data';

        if (!File::isDirectory($experimentPath)) {
            return response()->json(['error' => "Experiment folder not found: $experimentName"], 404);
        }

        $stocks = collect(File::directories($experimentPath))->map(function ($stock) {
            return basename($stock);
        });

        return response()->json($stocks);
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

        $experimentPath = $this->baseDir . '/' . $experimentName;

        if (!File::isDirectory($experimentPath)) {
            return response()->json(['error' => "Experiment folder not found: $experimentName"], 404);
        }

        $models = collect();

        foreach ($stocks as $stock) {
            $stockPath = $experimentPath . '/data/' . $stock;

            if (!File::isDirectory($stockPath)) {
                return response()->json(['error' => "Stock folder not found: $stock"], 404);
            }

            $stockModels = collect(File::directories($stockPath))->map(function ($model) {
                return basename($model);
            });

            $models = $models->merge($stockModels);
        }

        $uniqueModels = $models->unique()->values();

        return response()->json($uniqueModels);
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

        $experimentPath = $this->baseDir . '/' . $experimentName;

        if (!File::isDirectory($experimentPath)) {
            return response()->json(['error' => "Experiment folder not found: $experimentName"], 404);
        }

        $stopLosses = collect();

        foreach ($stocks as $stock) {
            $stockPath = $experimentPath . '/data/' . $stock;

            if (!File::isDirectory($stockPath)) {
                return response()->json(['error' => "Stock folder not found: $stock"], 404);
            }

            foreach ($models as $model) {
                $modelPath = $stockPath . '/' . $model;

                if (!File::isDirectory($modelPath)) {
                    continue;
                }

                $modelStopLosses = collect(File::directories($modelPath))->filter(function ($folder) {
                    return preg_match('/^sl_([0-9]*\.?[0-9]+)$/', basename($folder));
                })->map(function ($folder) {
                    return str_replace('sl_', '', basename($folder)); // Extract the number part
                });

                $stopLosses = $stopLosses->merge($modelStopLosses);
            }
        }

        $uniqueStopLosses = $stopLosses->unique()->sort()->values();

        return response()->json($uniqueStopLosses);
    }


    public function getCombinedCsvData(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $stopLosses = $request->input('stopLosses', []);
        $dataFile = $request->input('dataFile', "");

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

        $experimentPath = $this->baseDir . '/' . $experimentName;
        $result = [];

        foreach ($stocks as $stock) {
            $stockPath = "$experimentPath/data/$stock";

            if (!File::isDirectory($stockPath)) {
                Log::warning("Stock folder not found: $stockPath");
                continue;
            }

            foreach ($models as $model) {
                $modelPath = "$stockPath/$model";

                if (!File::isDirectory($modelPath)) {
                    Log::info("Model folder not found: $modelPath");
                    continue;
                }

                foreach ($stopLosses as $stopLoss) {
                    $stopLossFolder = "sl_$stopLoss";
                    $stopLossPath = "$modelPath/$stopLossFolder";

                    if (!File::isDirectory($stopLossPath)) {
                        Log::info("Stop loss folder not found: $stopLossPath");
                        continue;
                    }

                    $csvPath = "$stopLossPath/$dataFile";

                    if (!File::exists($csvPath)) {
                        Log::info("CSV file not found: $csvPath");
                        continue;
                    }

                    $csvData = File::get($csvPath);
                    $csvData = preg_replace('/\r\n?/', "\n", $csvData);  // Normalize line endings
                    $csvData = preg_replace('/\xEF\xBB\xBF/', '', $csvData); // Remove BOM if present
                    $csvData = trim($csvData);

                    $rows = array_map('str_getcsv', explode("\n", $csvData));
                    $header = array_shift($rows);

                    if (!$header || !in_array('date', $header) || !in_array('gain', $header)) {
                        Log::warning("CSV header is missing required columns: $csvPath");
                        continue;
                    }

                    $filteredData = array_map(function ($row) use ($header) {
                        $row = array_combine($header, $row);
                        return [
                            'date' => $row['date'] ?? null,
                            'gain' => $row['gain'] ?? null,
                        ];
                    }, $rows);

                    $key = "$stock | $model | $stopLoss";
                    $result[$key] = array_filter($filteredData, function ($row) {
                        return $row['date'] && $row['gain'];
                    });
                }
            }
        }

        return response()->json($result);
    }


    public function getFolderPriceData(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);

        if (!$experimentName) {
            return response()->json(['error' => 'Experiment name is required'], 400);
        }
        if (empty($stocks)) {
            return response()->json(['error' => 'At least one stock is required'], 400);
        }

        $experimentPath = $this->baseDir . '/' . $experimentName;
        $priceFolderPath = $experimentPath . '/price';
        $result = [];

        if (!File::isDirectory($priceFolderPath)) {
            return response()->json(['error' => "Price folder not found for experiment: $experimentName"], 404);
        }

        foreach ($stocks as $stock) {
            $stockPriceFile = "$priceFolderPath/$stock.csv";

            if (!File::exists($stockPriceFile)) {
                Log::info("Price file not found for stock: $stock");
                continue;
            }

            $csvData = File::get($stockPriceFile);
            $csvData = preg_replace('/\r\n?/', "\n", $csvData);  // Normalize line endings
            $csvData = preg_replace('/\xEF\xBB\xBF/', '', $csvData); // Remove BOM if present
            $csvData = trim($csvData);

            $rows = array_map('str_getcsv', explode("\n", $csvData));
            $header = array_shift($rows);

            if (!$header || !in_array('date', $header) || !in_array('price', $header)) {
                Log::warning("CSV header is missing required columns for stock: $stock");
                continue;
            }

            $filteredData = array_map(function ($row) use ($header) {
                $row = array_combine($header, $row);
                return [
                    'date' => $row['date'] ?? null,
                    'price' => $row['price'] ?? null,
                ];
            }, $rows);

            $filteredData = array_filter($filteredData, function ($row) {
                return $row['date'] && $row['price'];
            });

            if (count($filteredData) > 0) {
                $firstPrice = (float) $filteredData[array_key_first($filteredData)]['price'];

                $processedData = array_map(function ($row) use ($firstPrice) {
                    return [
                        'date' => $row['date'],
                        'price' => (float) $row['price'],
                        'price_change' => (($row['price'] - $firstPrice) / $firstPrice) * 100,
                    ];
                }, $filteredData);

                $result[$stock] = $processedData;
            }
        }

        return response()->json($result);
    }


    public function getSampledCsvData(Request $request)
    {
        $experimentName = $request->input('experiment');
        $stocks = $request->input('stocks', []);
        $models = $request->input('models', []);
        $stopLosses = $request->input('stopLosses', []);
        $dataFile = $request->input('dataFile', "");

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

        $lineInterval = 1;
        if ($dataFile === 'trade_progress.csv') {
            $lineInterval = 50;
        } elseif ($dataFile === 'balance.csv') {
            $lineInterval = 25;
        }

        $experimentPath = $this->baseDir . '/' . $experimentName;
        $result = [];

        foreach ($stocks as $stock) {
            $stockPath = "$experimentPath/data/$stock";

            if (!File::isDirectory($stockPath)) {
                Log::warning("Stock folder not found: $stockPath");
                continue;
            }

            foreach ($models as $model) {
                $modelPath = "$stockPath/$model";

                if (!File::isDirectory($modelPath)) {
                    Log::info("Model folder not found: $modelPath");
                    continue;
                }

                foreach ($stopLosses as $stopLoss) {
                    $stopLossFolder = "sl_$stopLoss";
                    $stopLossPath = "$modelPath/$stopLossFolder";

                    if (!File::isDirectory($stopLossPath)) {
                        Log::info("Stop loss folder not found: $stopLossPath");
                        continue;
                    }

                    $csvPath = "$stopLossPath/$dataFile";

                    if (!File::exists($csvPath)) {
                        Log::info("CSV file not found: $csvPath");
                        continue;
                    }

                    $csvData = File::get($csvPath);
                    $csvData = preg_replace('/\r\n?/', "\n", $csvData);  // Normalize line endings
                    $csvData = preg_replace('/\xEF\xBB\xBF/', '', $csvData); // Remove BOM if present
                    $csvData = trim($csvData);

                    $rows = array_map('str_getcsv', explode("\n", $csvData));
                    $header = array_shift($rows);

                    if (!$header || !in_array('date', $header) || !in_array('gain', $header)) {
                        Log::warning("CSV header is missing required columns: $csvPath");
                        continue;
                    }

                    $filteredRows = [];
                    foreach ($rows as $index => $row) {
                        if ($index % $lineInterval === 0) {
                            $filteredRows[] = $row;
                        }
                    }

                    $filteredData = array_map(function ($row) use ($header) {
                        $row = array_combine($header, $row);
                        return [
                            'date' => $row['date'] ?? null,
                            'gain' => $row['gain'] ?? null,
                        ];
                    }, $filteredRows);

                    $key = "$stock | $model | $stopLoss";
                    $result[$key] = array_filter($filteredData, function ($row) {
                        return $row['date'] && $row['gain'];
                    });
                }
            }
        }

        return response()->json($result);
    }



}
