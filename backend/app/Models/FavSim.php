<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class FavSim extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'experiment',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function stocks(): BelongsToMany
    {
        return $this->belongsToMany(Stock::class, 'fav_sim_stock');
    }

    public function simulationModels(): BelongsToMany
    {
        return $this->belongsToMany(SimulationModel::class, 'fav_sim_simulation_model');
    }

    public function adviceLimits(): BelongsToMany
    {
        return $this->belongsToMany(AdviceLimit::class, 'fav_sim_advice_limit');
    }

    public function adviceLimitsMax(): BelongsToMany
    {
        return $this->belongsToMany(AdviceLimitMax::class, 'fav_sim_advice_limit_max');
    }

    public function stoplosses(): BelongsToMany
    {
        return $this->belongsToMany(Stoploss::class, 'fav_sim_stoploss');
    }
}
