<?php

namespace App\Http\Controllers;

use App\Models\FavSim;
use App\Models\Stock;
use App\Models\SimulationModel;
use App\Models\AdviceLimit;
use App\Models\AdviceLimitMax;
use App\Models\Stoploss;
use Illuminate\Http\Request;

class FavoriteSimulationController extends Controller
{
    public function index()
    {
        return auth()->user()
            ->favSims()
            ->with(['stocks', 'simulationModels', 'adviceLimits', 'adviceLimitsMax', 'stoplosses'])
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'experiment'       => 'required|string',
            'stocks'           => 'required|array',
            'models'           => 'required|array',
            'advice_limits'    => 'required|array',
            'advice_limits_max'=> 'required|array',
            'stoplosses'       => 'required|array',
        ]);

        $user = auth()->user();

        $favorite = $user->favSims()->create([
            'name'       => $data['name'],
            'experiment' => $data['experiment'],
        ]);

        $favorite->stocks()->sync($this->getOrCreateIds(Stock::class, $data['stocks']));
        $favorite->simulationModels()->sync($this->getOrCreateIds(SimulationModel::class, $data['models']));
        $favorite->adviceLimits()->sync($this->getOrCreateIds(AdviceLimit::class, $data['advice_limits']));
        $favorite->adviceLimitsMax()->sync($this->getOrCreateIds(AdviceLimitMax::class, $data['advice_limits_max']));
        $favorite->stoplosses()->sync($this->getOrCreateIds(Stoploss::class, $data['stoplosses']));

        return response()->json($favorite->load(['stocks', 'simulationModels', 'adviceLimits', 'adviceLimitsMax', 'stoplosses']));
    }

    public function destroy(FavSim $favorite)
    {
        if ($favorite->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $favorite->delete();
        return response()->json(['success' => true]);
    }

    protected function getOrCreateIds($modelClass, array $values)
    {
        return collect($values)->map(function ($value) use ($modelClass) {
            return $modelClass::firstOrCreate(['name' => $value])->id;
        });
    }
}
