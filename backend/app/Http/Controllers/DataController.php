<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;


class DataController extends Controller
{
    private $baseDir = '/home/data/balance/yahoo/data';

    public function getMainFolders()
    {
        $folders = collect(File::directories($this->baseDir))->map(function ($folder) {
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

    public function getUniqueModels()
    {
        $modelRegex = '/(model_[^_]+_[^_]+)/';
        $uniqueModels = collect(File::directories($this->baseDir))
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

    public function getUniqueStopLossValues()
    {
        $stopLossRegex = '/stoploss_([\d.]+)/';
        $uniqueStopLossValues = collect(File::directories($this->baseDir))
            ->flatMap(function ($folder) use ($stopLossRegex) {
                return collect(File::directories($folder))->map(function ($subfolder) use ($stopLossRegex) {
                    if (preg_match($stopLossRegex, basename($subfolder), $matches)) {
                        return $matches[1];
                    }
                    return null;
                });
            })
            ->filter()
            ->unique()
            ->values();

        return response()->json($uniqueStopLossValues);
    }

    public function getCombinedCsvData(Request $request)
    {
        $folders = $request->input('folders', []);
        $models = $request->input('models', []);
        $stopLosses = $request->input('stopLosses', []);

        $baseDir = $this->baseDir;
        $result = [];

        foreach ($folders as $folder) {
            $folderPath = "$baseDir/$folder";
            if (!File::isDirectory($folderPath)) {
                Log::warning("Folder not found: $folderPath");
                continue;
            }

            foreach ($models as $model) {
                foreach ($stopLosses as $stopLoss) {
                    $subfolder = "{$model}_stoploss_$stopLoss";
                    $csvPath = "$folderPath/$subfolder/balance.csv";

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
}
