<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FavoriteSimulation extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'experiment',
        'stocks',
        'models',
        'advice_limits',
        'advice_limits_max',
        'stoplosses',
    ];

    protected $casts = [
        'stocks' => 'array',
        'models' => 'array',
        'advice_limits' => 'array',
        'advice_limits_max' => 'array',
        'stoplosses' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
