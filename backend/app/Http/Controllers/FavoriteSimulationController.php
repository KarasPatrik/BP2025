<?php

namespace App\Http\Controllers;

use App\Models\FavoriteSimulation;
use Illuminate\Http\Request;

class FavoriteSimulationController extends Controller
{
    public function index()
    {
        return auth()->user()->favoriteSimulations()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'experiment' => 'required|string',
            'stocks' => 'required|array',
            'models' => 'required|array',
            'advice_limits' => 'required|array',
            'advice_limits_max' => 'required|array',
            'stoplosses' => 'required|array',
        ]);

        $favorite = auth()->user()->favoriteSimulations()->create($data);
        return response()->json($favorite);
    }

    public function destroy(FavoriteSimulation $favorite)
    {
        if ($favorite->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $favorite->delete();
        return response()->json(['success' => true]);
    }

}
