<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function pendingUsers()
    {
        $users = User::where('is_approved', false)->get();
        return response()->json($users);
    }

    public function approvedUsers()
    {
        $users = User::where('is_approved', true)->get();
        return response()->json($users);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->is_approved = true;
        $user->save();

        return response()->json(['message' => 'User approved']);
    }

    public function delete($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}

