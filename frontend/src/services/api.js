import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8000/api';
const API_BASE_URL='https://kirsten-vaulted-margarita.ngrok-free.dev/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Fetch video information from YouTube URL
 * @param {string} url - YouTube video URL
 * @returns {Promise} Video data including title, thumbnail, and available formats
 */
export const getVideoInfo = async (url) => {
    try {
        const response = await api.post('/video-info', { url });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch video info');
        }
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Server error occurred');
        } else if (error.request) {
            throw new Error('Unable to connect to server. Please make sure the backend is running.');
        } else {
            throw new Error(error.message);
        }
    }
};

/**
 * Download video with specified format (best quality automatically selected)
 * @param {string} url - YouTube video URL
 * @param {string} format - Download format ('mp3' or 'mp4')
 * @returns {Promise} Download response
 */
export const downloadVideo = async (url, format = 'mp4') => {
    try {
        const response = await api.post('/download',
            { url, format },
            {
                responseType: 'blob',
            }
        );

        // Create a blob URL and trigger download
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Extract filename from Content-Disposition header or use default
        const contentDisposition = response.headers['content-disposition'];
        let filename = format === 'mp3' ? 'audio.mp3' : 'video.mp4';

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true };
    } catch (error) {
        if (error.response) {
            // Try to read error message from blob
            const text = await error.response.data.text();
            try {
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Download failed');
            } catch {
                throw new Error('Download failed');
            }
        } else if (error.request) {
            throw new Error('Unable to connect to server. Please make sure the backend is running.');
        } else {
            throw new Error(error.message);
        }
    }
};

export default api;
