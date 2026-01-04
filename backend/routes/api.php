<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VideoController;

Route::post('/video-info', [VideoController::class, 'getVideoInfo']);
Route::post('/download', [VideoController::class, 'downloadVideo']);
