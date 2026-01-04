<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class VideoController extends Controller
{
    /**
     * Get video information including available formats
     */
    public function getVideoInfo(Request $request)
    {
        // Log the incoming request for debugging
        \Log::info('Video info request received', [
            'all_data' => $request->all(),
            'url' => $request->input('url'),
        ]);

        $validator = Validator::make($request->all(), [
            'url' => 'required|string'
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid URL provided',
                'errors' => $validator->errors()
            ], 400);
        }

        $url = $request->input('url');

        // Use full path to yt-dlp - check multiple common locations
        $ytDlpPaths = [
            '/usr/local/bin/yt-dlp',      // Linux (common)
            '/usr/bin/yt-dlp',             // Linux (apt install)
            '/opt/homebrew/bin/yt-dlp',    // Mac (Homebrew ARM)
            '/usr/local/bin/yt-dlp',       // Mac (Homebrew Intel)
        ];

        $ytDlpPath = null;
        foreach ($ytDlpPaths as $path) {
            if (file_exists($path)) {
                $ytDlpPath = $path;
                break;
            }
        }

        // If not found in common locations, try using 'which' command
        if (!$ytDlpPath) {
            $process = new Process(['which', 'yt-dlp']);
            $process->run();
            if ($process->isSuccessful()) {
                $ytDlpPath = trim($process->getOutput());
            }
        }

        if (!$ytDlpPath || !file_exists($ytDlpPath)) {
            \Log::error('yt-dlp not found in any common location');
            return response()->json([
                'success' => false,
                'message' => 'yt-dlp is not installed on the server. Please install it first.'
            ], 500);
        }

        \Log::info('Using yt-dlp at: ' . $ytDlpPath);

        // Get video info using yt-dlp with bot detection bypass
        // Using android client which has better success rate
        $process = new Process([
            $ytDlpPath,
            '--dump-json',
            '--no-playlist',
            '--extractor-args',
            'youtube:player_client=android',
            $url
        ]);

        $process->setTimeout(30);
        $process->run();

        if (!$process->isSuccessful()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch video information. Please check the URL.'
            ], 400);
        }

        $output = $process->getOutput();
        $videoData = json_decode($output, true);

        if (!$videoData) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse video information'
            ], 500);
        }

        // Extract relevant formats and organize by quality
        $formatsByQuality = [];

        foreach ($videoData['formats'] ?? [] as $format) {
            // Only include formats with video (has height)
            if (isset($format['height']) && $format['height'] > 0) {
                $height = $format['height'];
                $quality = $height . 'p';

                // Store format info
                if (!isset($formatsByQuality[$height])) {
                    $formatsByQuality[$height] = [
                        'quality' => $quality,
                        'height' => $height,
                        'ext' => $format['ext'] ?? 'mp4',
                        'filesize' => $format['filesize'] ?? $format['filesize_approx'] ?? null,
                        'has_audio' => isset($format['acodec']) && $format['acodec'] !== 'none',
                    ];
                }
            }
        }

        // Sort by quality (descending) and convert to array
        krsort($formatsByQuality);
        $formats = array_values($formatsByQuality);

        // If no formats found, provide common quality options
        if (empty($formats)) {
            $formats = [
                ['quality' => '1080p', 'height' => 1080, 'ext' => 'mp4', 'filesize' => null, 'has_audio' => true],
                ['quality' => '720p', 'height' => 720, 'ext' => 'mp4', 'filesize' => null, 'has_audio' => true],
                ['quality' => '480p', 'height' => 480, 'ext' => 'mp4', 'filesize' => null, 'has_audio' => true],
                ['quality' => '360p', 'height' => 360, 'ext' => 'mp4', 'filesize' => null, 'has_audio' => true],
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'title' => $videoData['title'] ?? 'Unknown',
                'thumbnail' => $videoData['thumbnail'] ?? null,
                'duration' => $videoData['duration'] ?? 0,
                'formats' => $formats
            ]
        ]);
    }

    /**
     * Download video with specified quality and format
     */
    public function downloadVideo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
            'format' => 'required|in:mp3,mp4'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid parameters provided'
            ], 400);
        }

        $url = $request->input('url');
        $format = $request->input('format');

        // Use full path to yt-dlp
        $ytDlpPath = '/opt/homebrew/bin/yt-dlp';

        // Check alternative paths if not found
        if (!file_exists($ytDlpPath)) {
            $alternativePaths = [
                '/usr/local/bin/yt-dlp',
                '/usr/bin/yt-dlp',
            ];

            foreach ($alternativePaths as $path) {
                if (file_exists($path)) {
                    $ytDlpPath = $path;
                    break;
                }
            }

            if (!file_exists($ytDlpPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'yt-dlp is not installed on the server. Please install it first.'
                ], 500);
            }
        }

        // Create temporary directory for downloads
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        // Clean up old files in temp directory (older than 1 hour)
        $files = glob($tempDir . '/*');
        foreach ($files as $file) {
            if (is_file($file) && time() - filemtime($file) > 3600) {
                @unlink($file);
            }
        }

        $outputTemplate = $tempDir . '/%(title)s.%(ext)s';

        // Build yt-dlp command based on format
        if ($format === 'mp3') {
            // Download audio only and convert to MP3
            $process = new Process([
                $ytDlpPath,
                '-x', // Extract audio
                '--audio-format',
                'mp3',
                '--audio-quality',
                '0', // Best quality
                '-o',
                $outputTemplate,
                '--no-playlist',
                '--no-warnings',
                $url
            ]);
        } else {
            // Download video in best MP4 format (no re-encoding)
            $process = new Process([
                $ytDlpPath,
                '-f',
                'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv*+ba/b',
                '--merge-output-format',
                'mp4',
                '-o',
                $outputTemplate,
                '--no-playlist',
                $url
            ]);
        }

        $process->setTimeout(300); // 5 minutes timeout
        $process->run();

        if (!$process->isSuccessful()) {
            $errorOutput = $process->getErrorOutput();
            return response()->json([
                'success' => false,
                'message' => 'Failed to download ' . strtoupper($format) . '. ' . ($errorOutput ? substr($errorOutput, 0, 200) : 'Please try again.')
            ], 500);
        }

        // Find the downloaded file
        $files = glob($tempDir . '/*');

        // Filter out files older than 10 seconds (to get only the newly downloaded file)
        $recentFiles = array_filter($files, function ($file) {
            return is_file($file) && (time() - filemtime($file)) < 10;
        });

        if (empty($recentFiles)) {
            return response()->json([
                'success' => false,
                'message' => 'Downloaded file not found'
            ], 500);
        }

        // Get the most recent file
        usort($recentFiles, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        $filePath = $recentFiles[0];
        $fileName = basename($filePath);

        // Stream the file to the user
        return response()->download($filePath, $fileName)->deleteFileAfterSend(true);
    }
}
