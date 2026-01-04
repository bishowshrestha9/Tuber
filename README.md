# YouTube Video Downloader

A professional YouTube video downloader with a stunning black and red glassmorphism design. Built with Laravel backend and React frontend.

![YouTube Downloader](https://img.shields.io/badge/Status-Ready-success)
![Laravel](https://img.shields.io/badge/Laravel-12-red)
![React](https://img.shields.io/badge/React-18-blue)

## ✨ Features

- 🎨 **Beautiful Glassmorphism UI** - Modern black and red theme with glass effects
- 📹 **Multiple Quality Options** - Download videos in various resolutions (360p, 720p, 1080p, etc.)
- ⚡ **Fast & Responsive** - Built with React and Vite for optimal performance
- 🔒 **Secure** - Laravel backend with proper validation
- 📱 **Mobile Friendly** - Fully responsive design
- 🎯 **User Friendly** - Simple and intuitive interface

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** - PHP dependency manager
- **Node.js** >= 18.x
- **npm** or **yarn**
- **Python** >= 3.7
- **yt-dlp** - YouTube downloader tool

### Installing yt-dlp

**macOS:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**Windows:**
```bash
pip install yt-dlp
```

Or download from: https://github.com/yt-dlp/yt-dlp/releases

## 📦 Installation

### 1. Clone the repository (if applicable)

```bash
cd /Users/bishowshrestha/Documents/YoutubeDownloader
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file (already created)
# The .env file is already configured

# Generate application key (already done)
# php artisan key:generate

# Create storage directory for downloads
mkdir -p storage/app/temp

# Set permissions
chmod -R 775 storage bootstrap/cache
```

### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies (already done)
# npm install

# Dependencies installed:
# - react & react-dom
# - axios
# - react-toastify
# - vite
```

## 🎯 Running the Application

### Start the Backend Server

Open a terminal and run:

```bash
cd backend
php artisan serve
```

The Laravel backend will start at: `http://localhost:8000`

### Start the Frontend Development Server

Open another terminal and run:

```bash
cd frontend
npm run dev
```

The React frontend will start at: `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 💻 Usage

1. **Paste YouTube URL** - Enter the YouTube video URL in the input field
2. **Fetch Video Info** - Click the search button to load video information
3. **Select Quality** - Choose your preferred video quality from the available options
4. **Download** - Click the "Download Video" button to start downloading

## 🏗️ Project Structure

```
YoutubeDownloader/
├── backend/                 # Laravel backend
│   ├── app/
│   │   └── Http/
│   │       └── Controllers/
│   │           └── VideoController.php
│   ├── routes/
│   │   └── api.php
│   ├── config/
│   │   └── cors.php
│   └── storage/
│       └── app/
│           └── temp/        # Temporary download directory
│
└── frontend/                # React frontend
    ├── src/
    │   ├── App.jsx          # Main application component
    │   ├── App.css          # Glassmorphism styles
    │   ├── index.css        # Global styles
    │   └── services/
    │       └── api.js       # API service layer
    └── package.json
```

## 🎨 Design Features

- **Glassmorphism Effects** - Frosted glass appearance with backdrop blur
- **Gradient Animations** - Smooth rotating background gradients
- **Hover Effects** - Interactive button and card animations
- **Custom Scrollbar** - Themed scrollbar matching the color scheme
- **Toast Notifications** - Beautiful notifications for user feedback
- **Responsive Grid** - Adaptive quality selector grid

## ⚙️ Configuration

### Backend Configuration

The backend API runs on port `8000` by default. To change this, modify the `php artisan serve` command:

```bash
php artisan serve --port=9000
```

### Frontend Configuration

If you change the backend port, update the API base URL in `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT/api';
```

### CORS Configuration

CORS is configured in `backend/config/cors.php` to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative port)

Add more origins as needed for production deployment.

## 🚀 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Backend Deployment

For production deployment:

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Configure your web server (Apache/Nginx)
4. Run `php artisan config:cache`
5. Run `php artisan route:cache`

## ⚠️ Important Notes

- **Legal Disclaimer**: This tool is for educational purposes only. Please respect copyright laws and YouTube's Terms of Service.
- **Rate Limiting**: YouTube may rate limit or block IP addresses that download too many videos.
- **Video Rights**: Only download videos you have the right to download.
- **Server Requirements**: Ensure your server has enough disk space for temporary video storage.

## 🐛 Troubleshooting

### yt-dlp not found

If you get an error about yt-dlp not being installed:
```bash
# Verify installation
which yt-dlp

# If not found, install it using the instructions above
```

### CORS Errors

If you encounter CORS errors:
1. Ensure the backend is running on port 8000
2. Check that `config/cors.php` includes your frontend URL
3. Clear Laravel cache: `php artisan config:clear`

### Download Fails

If downloads fail:
1. Check that `storage/app/temp` directory exists and is writable
2. Verify yt-dlp is working: `yt-dlp --version`
3. Try the YouTube URL directly with yt-dlp to test

## 📝 License

This project is for educational purposes only.

## 🙏 Acknowledgments

- **Laravel** - PHP framework
- **React** - JavaScript library
- **Vite** - Build tool
- **yt-dlp** - YouTube downloader
- **react-toastify** - Toast notifications

---

**Made with ❤️ using Laravel & React**
