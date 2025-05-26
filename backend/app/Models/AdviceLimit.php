<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AdviceLimit extends Model
{
    protected $table = 'advice_limits';
    protected $fillable = ['name'];

    public function favSims(): BelongsToMany
    {
        return $this->belongsToMany(FavSim::class);
    }
}
