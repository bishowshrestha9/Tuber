import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getVideoInfo, downloadVideo } from './services/api';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [downloading, setDownloading] = useState(false);
  const [dominantColor, setDominantColor] = useState(null);

  // Extract dominant color from thumbnail
  useEffect(() => {
    if (videoData?.thumbnail) {
      extractDominantColor(videoData.thumbnail);
    }
  }, [videoData]);

  const extractDominantColor = (imageUrl) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let r = 0, g = 0, b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const pixelCount = data.length / 4;
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);

      setDominantColor(`rgb(${r}, ${g}, ${b})`);
    };
  };

  const handleFetchInfo = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setVideoData(null);
    setDominantColor(null);

    try {
      const data = await getVideoInfo(url);
      setVideoData(data);
      toast.success('Video loaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await downloadVideo(url, selectedFormat);
      toast.success(`${selectedFormat.toUpperCase()} download started! Check your downloads folder.`);
    } catch (error) {
      toast.error(error.message || 'Failed to download');
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app" style={dominantColor ? {
      background: `radial-gradient(circle at top right, ${dominantColor}15, #000000 70%)`
    } : {}}>
      {/* Animated Background Gradient */}
      {dominantColor && (
        <div className="dynamic-bg" style={{
          background: `radial-gradient(circle at 20% 50%, ${dominantColor}20, transparent 50%), 
                       radial-gradient(circle at 80% 80%, ${dominantColor}15, transparent 50%)`
        }}></div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">YT Downloader</span>
              <span className="logo-subtitle">Pro</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" />
            </svg>
            <span>Home</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="format-selector">
            <p className="format-label">Download Format</p>
            <div className="format-buttons">
              <button
                className={`format-btn ${selectedFormat === 'mp4' ? 'active' : ''}`}
                onClick={() => setSelectedFormat('mp4')}
                style={selectedFormat === 'mp4' && dominantColor ? {
                  background: `linear-gradient(135deg, ${dominantColor}, ${dominantColor}dd)`,
                  borderColor: dominantColor
                } : {}}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <path d="M7 2V22" />
                  <path d="M17 2V22" />
                  <path d="M2 12H22" />
                </svg>
                <span>Video (MP4)</span>
                <span className="format-badge">Best Quality</span>
              </button>
              <button
                className={`format-btn ${selectedFormat === 'mp3' ? 'active' : ''}`}
                onClick={() => setSelectedFormat('mp3')}
                style={selectedFormat === 'mp3' && dominantColor ? {
                  background: `linear-gradient(135deg, ${dominantColor}, ${dominantColor}dd)`,
                  borderColor: dominantColor
                } : {}}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5L21 3V16" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                <span>Audio (MP3)</span>
                <span className="format-badge">320kbps</span>
              </button>
            </div>
          </div>

          <div className="stats">
            <div className="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
              </svg>
              <span>Lightning Fast</span>
            </div>
            <div className="stat-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                <path d="M12 6V12L16 14" />
              </svg>
              <span>No Limits</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <header className="main-header">
            <h1 className="page-title" style={dominantColor ? {
              background: `linear-gradient(135deg, ${dominantColor}, #ffffff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            } : {}}>
              Download Anything
            </h1>
            <p className="page-subtitle">High quality YouTube downloads in seconds • MP4 & MP3 • Best quality automatically selected</p>
          </header>

          {/* Search Bar */}
          <form onSubmit={handleFetchInfo} className="search-section">
            <div className="search-bar" style={dominantColor ? {
              borderColor: `${dominantColor}40`
            } : {}}>
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" />
                <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60707C11.7642 9.26331 11.0685 9.05889 10.3533 9.00768C9.63819 8.95646 8.92037 9.05965 8.24861 9.31023C7.57685 9.5608 6.96684 9.95303 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                className="search-input"
                disabled={loading}
              />
              <button
                type="submit"
                className="search-button"
                disabled={loading}
                style={dominantColor && !loading ? {
                  background: `linear-gradient(135deg, ${dominantColor}, ${dominantColor}cc)`
                } : {}}
              >
                {loading ? (
                  <div className="spinner-small"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          {/* Empty State */}
          {!videoData && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 7L16 12L23 17V7Z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </svg>
              </div>
              <h2 className="empty-title">Ready to Download</h2>
              <p className="empty-text">Paste any YouTube URL above and get instant access to high-quality downloads</p>

              <div className="features">
                <div className="feature">
                  <div className="feature-icon">⚡</div>
                  <h3>Instant Downloads</h3>
                  <p>Lightning-fast processing</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🎵</div>
                  <h3>Dual Format</h3>
                  <p>MP3 audio or MP4 video</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">📺</div>
                  <h3>Best Quality</h3>
                  <p>Automatic quality selection</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Info */}
          {videoData && (
            <div className="video-section">
              <div className="video-card" style={dominantColor ? {
                borderColor: `${dominantColor}30`,
                background: `linear-gradient(135deg, ${dominantColor}08, ${dominantColor}03)`
              } : {}}>
                <div className="video-thumbnail">
                  {videoData.thumbnail && (
                    <img src={videoData.thumbnail} alt={videoData.title} />
                  )}
                  <div className="play-overlay">
                    <div className="play-button" style={dominantColor ? {
                      background: dominantColor
                    } : {}}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5V19L19 12L8 5Z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="video-info">
                  <h2 className="video-title">{videoData.title}</h2>
                  <div className="video-meta">
                    {videoData.duration > 0 && (
                      <span className="meta-badge" style={dominantColor ? {
                        background: `${dominantColor}15`,
                        borderColor: `${dominantColor}30`
                      } : {}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6V12L16 14" />
                        </svg>
                        {formatDuration(videoData.duration)}
                      </span>
                    )}
                    <span className="meta-badge" style={dominantColor ? {
                      background: `${dominantColor}15`,
                      borderColor: `${dominantColor}30`
                    } : {}}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11L12 14L22 4" />
                        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V12" />
                      </svg>
                      Best Quality
                    </span>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="download-button"
                disabled={downloading}
                style={dominantColor && !downloading ? {
                  background: `linear-gradient(135deg, ${dominantColor}, ${dominantColor}dd)`,
                  boxShadow: `0 10px 40px ${dominantColor}40`
                } : {}}
              >
                {downloading ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
                      <path d="M7 10L12 15L17 10" />
                      <path d="M12 15V3" />
                    </svg>
                    <span>Download {selectedFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
