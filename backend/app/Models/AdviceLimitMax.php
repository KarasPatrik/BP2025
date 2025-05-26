<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AdviceLimitMax extends Model
{
    protected $table = 'advice_limits_max';
    protected $fillable = ['name'];

    public function favSims(): BelongsToMany
    {
        return $this->belongsToMany(FavSim::class);
    }
}
