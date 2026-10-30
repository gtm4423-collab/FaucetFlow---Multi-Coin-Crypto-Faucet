/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Play, 
  Pause
} from 'lucide-react';

export default function App() {
  const playerRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [statusText, setStatusText] = useState('SmartVideo ready — tap play to start streaming.');
  const [statusVisible, setStatusVisible] = useState(false);
  const TOTAL_DURATION_SECONDS = 45 * 60; // 45 minutes = 2700s
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [duration] = useState('45:00');
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoSrc] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

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

  // Active timer for 45-minute progress while playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = prev + 1 * playbackSpeed;
        if (next >= TOTAL_DURATION_SECONDS) {
          setIsPlaying(false);
          setProgress(100);
          setCurrentTime('45:00');
          showStatus('45:00 Video stream ended');
          return TOTAL_DURATION_SECONDS;
        }
        const pct = (next / TOTAL_DURATION_SECONDS) * 100;
        setProgress(pct);
        setCurrentTime(formatTime(next));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          showStatus('Playing 45-min live video stream');
        })
        .catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => {
            setIsPlaying(true);
            showStatus('Playing muted (tap unmute for audio)');
          });
        });
    } else {
      video.pause();
      setIsPlaying(false);
      showStatus('Video paused');
    }
  };

  // Handle video ending - loops the background visual while continuing 45min timeline
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Interactive seek on track bar across the full 45-minute timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    const targetSeconds = Math.floor(clampedPos * TOTAL_DURATION_SECONDS);

    setCurrentSeconds(targetSeconds);
    setProgress(clampedPos * 100);
    setCurrentTime(formatTime(targetSeconds));

    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = (targetSeconds % Math.floor(videoRef.current.duration));
    }
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
    </main>
  );
}
