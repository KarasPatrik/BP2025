<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;


class DataController extends Controller
{
    private $priceDir = 'price';
    private $dataDir = 'metadata';
    private $expDir = '/home/data';

    public function getExperimentsFolders()
    {
        $folders = collect(File::directories($this->expDir))->map(function ($folder) {
            return basename($folder);
        });

        return response()->json($folders);
    }


    public function getMainFolders(Request $request)
    {
        $experiment = $request->input('experiment', "");
        if ($experiment==""){
            return response()->json([]);
        }

        $dir = $this->expDir."/".$experiment."/". $this->dataDir;

        $folders = collect(File::directories($dir))->map(function ($folder) {
            return basename($folder);
        });

        return response()->json($folders);
    }

    public function getFolders()
    {
        $folders = collect(File::directories($this->baseDir))->map(function ($folder) {
            $subfolders = collect(File::directories($folder))->map(function ($subfolder) {
                return basename($subfolder);
            });

            return [
                'folder' => basename($folder),
                'subfolders' => $subfolders,
            ];
        });

        return response()->json($folders);
    }

    public function getUniqueModels(Request $request)
    {
        $experiment = $request->input('experiment', "");
        if ($experiment==""){
            return response()->json([]);
        }

        $dir = $this->expDir."/".$experiment."/". $this->dataDir;

        $modelRegex = '/(model_[^_]+_[^_]+)/';
        $uniqueModels = collect(File::directories($dir))
            ->flatMap(function ($folder) use ($modelRegex) {
                return collect(File::directories($folder))->map(function ($subfolder) use ($modelRegex) {
                    if (preg_match($modelRegex, basename($subfolder), $matches)) {
                        return $matches[1];
                    }
                    return null;
                });
            })
            ->filter()
            ->unique()
            ->values();

        return response()->json($uniqueModels);
    }


    public function getUniqueStopLossValues(Request $request)
    {
        $experiment = $request->input('experiment', "");
        if ($experiment==""){
            return response()->json([]);
        }

        $dir = $this->expDir."/".$experiment."/". $this->dataDir;

        $stopLossRegex = '/sl_([\d.]+)/';

        // Recursive function for traversing directories
        $traverseDirectories = function ($path) use (&$traverseDirectories, $stopLossRegex) {
            $directories = File::directories($path); // Get immediate subdirectories
            $stopLossValues = collect();

            foreach ($directories as $directory) {
                $folderName = basename($directory);

                // Check if the folder name matches the stop-loss pattern
                if (preg_match($stopLossRegex, $folderName, $matches)) {
                    $stopLossValues->push($matches[1]); // Add matched value to the collection
                }

                // Recurse into the subdirectory to find deeper matches
                $stopLossValues = $stopLossValues->merge($traverseDirectories($directory));
            }

            return $stopLossValues;
        };

        // Start recursive traversal from the base directory
        $uniqueStopLossValues = $traverseDirectories($dir)
            ->unique() // Ensure values are unique
            ->values(); // Re-index collection

        return response()->json($uniqueStopLossValues);
    }

    public function getCombinedCsvData(Request $request)
    {
        $folders = $request->input('folders', []);
        $models = $request->input('models', []);
        $stopLosses = $request->input('stopLosses', []);
        $dataFile = $request->input('dataFile', "");

        $experiments = $request->input('experiments', []);
        $experiment = $experiments[0];
        $baseDir = $this->expDir."/".$experiment."/". $this->dataDir;

        $result = [];

        foreach ($folders as $folder) {
            $folderPath = "$baseDir/$folder";
            if (!File::isDirectory($folderPath)) {
                Log::warning("Folder not found: $folderPath");
                continue;
            }

            foreach ($models as $model) {
                foreach ($stopLosses as $stopLoss) {
                    $subfolder = "{$model}/sl_$stopLoss";
                    $csvPath = "$folderPath/$subfolder/$dataFile";

                    if (File::exists($csvPath)) {
                        $csvData = File::get($csvPath);
                        $csvData = preg_replace('/\r\n?/', "\n", $csvData);  // Convert Windows/Mac line endings to Unix
                        $csvData = preg_replace('/\xEF\xBB\xBF/', '', $csvData); // Remove BOM if present
                        $csvData = trim($csvData); // Ensure no leading/trailing whitespace
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

                        $key = "$folder | $model | $stopLoss";
                        $result[$key] = array_filter($filteredData, function ($row) {
                            return $row['date'] && $row['gain'];
                        });
                    }
                }
            }
        }

        return response()->json($result);
    }

    public function getFolderPriceData(Request $request)
    {
        $folders = $request->input('folders', []);

        $dataFile = $request->input('dataFile', "");
        $experiments = $request->input('experiments', []);
        $experiment = $experiments[0];
        $priceDir = $this->expDir."/".$experiment."/". $this->priceDir;

        $result = [];

        foreach ($folders as $folder) {


            $csvPath = "$priceDir/$folder.csv";

            if (File::exists($csvPath)) {
                $csvData = File::get($csvPath);
                $csvData = preg_replace('/\r\n?/', "\n", $csvData);  // Convert Windows/Mac line endings to Unix
                $csvData = preg_replace('/\xEF\xBB\xBF/', '', $csvData); // Remove BOM if present
                $csvData = trim($csvData); // Ensure no leading/trailing whitespace
                $rows = array_map('str_getcsv', explode("\n", $csvData));
                $header = array_shift($rows);

                if (!$header || !in_array('date', $header) || !in_array('price', $header)) {
                    Log::warning("CSV header is missing required columns: $csvPath");
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

                    // Calculate percentage change
                    $processedData = array_map(function ($row) use ($firstPrice) {
                        return [
                            'date' => $row['date'],
                            'price' => (float) $row['price'],
                            'price_change' => (($row['price'] - $firstPrice) / $firstPrice) * 100,
                        ];
                    }, $filteredData);

                    $result[$folder] = $processedData;
                }
            }
        }

        return response()->json($result);
    }


}
