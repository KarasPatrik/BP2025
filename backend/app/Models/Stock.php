<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Stock extends Model
{
    protected $fillable = ['name'];

    public function favSims(): BelongsToMany
    {
        return $this->belongsToMany(FavSim::class);
    }
}
