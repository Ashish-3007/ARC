"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Subtitles,
  Download,
  Share,
  Heart,
  Loader2,
  Info,
  Lock,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PremiumVideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  description?: string;
  duration?: number;
  quality?: string;
  maxQuality?: string;
  hasAccess?: boolean;
  accessType?: "rent" | "buy" | null;
  expiryDate?: string;
  onBack?: () => void;
  onPurchase?: () => void;
  showPurchasePrompt?: boolean;
}

export function PremiumVideoPlayer({
  src,
  poster,
  title,
  description,
  duration: totalDuration,
  quality = "4K",
  maxQuality = "4K",
  hasAccess = false,
  accessType = null,
  expiryDate,
  onBack,
  onPurchase,
}: PremiumVideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const isMountedRef = useRef(true);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState(() => {
    const allQualityOptions = ["4K", "1080p", "720p", "480p", "360p"];
    const maxIndex = allQualityOptions.indexOf(maxQuality);
    const currentIndex = allQualityOptions.indexOf(quality);
    if (maxIndex !== -1 && currentIndex !== -1 && currentIndex < maxIndex) {
      return maxQuality;
    }
    return quality;
  });
  const [subtitles, setSubtitles] = useState("Off");
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Available options
  const allQualityOptions = ["4K", "1080p", "720p", "480p", "360p"];
  const maxQualityIndex = allQualityOptions.indexOf(maxQuality);
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const subtitleOptions = [
    "Off",
    "English",
    "Spanish",
    "French",
    "German",
    "Japanese",
  ];

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {
          // Ignore errors from interrupted play promises
        });
      }
    };
  }, []);

  // Safe play function
  const safePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isMountedRef.current || !hasAccess) return;

    try {
      // Cancel any existing play promise
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {
          // Ignore errors from previous play attempts
        });
      }

      // Start new play promise
      playPromiseRef.current = video.play();
      await playPromiseRef.current;
      playPromiseRef.current = null;
    } catch (error) {
      playPromiseRef.current = null;
      if (error instanceof Error && error.name !== "AbortError") {
        console.warn("Video play failed:", error.message);
      }
    }
  }, [hasAccess]);

  // Safe pause function
  const safePause = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isMountedRef.current) return;

    try {
      video.pause();
    } catch (error) {
      console.warn("Video pause failed:", error);
    }
  }, []);

  // Check rental expiry
  useEffect(() => {
    if (accessType === "rent" && expiryDate) {
      const updateTimeRemaining = () => {
        const now = new Date().getTime();
        const expiry = new Date(expiryDate).getTime();
        const difference = expiry - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );

          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h remaining`);
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m remaining`);
          } else {
            setTimeRemaining(`${minutes}m remaining`);
          }
        } else {
          setTimeRemaining("Expired");
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [accessType, expiryDate]);

  // Keyboard shortcuts (only if has access)
  useEffect(() => {
    if (!hasAccess) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "Escape":
          if (showSettings) setShowSettings(false);
          if (showInfo) setShowInfo(false);
          break;
        case "KeyI":
          e.preventDefault();
          setShowInfo(!showInfo);
          break;
        case "Comma":
          e.preventDefault();
          changePlaybackRate(Math.max(0.25, playbackRate - 0.25));
          break;
        case "Period":
          e.preventDefault();
          changePlaybackRate(Math.min(2, playbackRate + 0.25));
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [hasAccess, volume, playbackRate, showSettings, showInfo]);

  // Initialize video (only if has access)
  useEffect(() => {
    if (!hasAccess) {
      setIsLoading(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (!isMountedRef.current) return;
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (!isDragging && isMountedRef.current) {
        setCurrentTime(video.currentTime);
      }
    };

    const handlePlay = () => {
      if (isMountedRef.current) {
        setIsPlaying(true);
      }
    };

    const handlePause = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    };

    const handleWaiting = () => {
      if (isMountedRef.current) {
        setIsBuffering(true);
      }
    };

    const handleCanPlay = () => {
      if (isMountedRef.current) {
        setIsBuffering(false);
      }
    };

    const handleEnded = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      if (isMountedRef.current) {
        console.warn("Video error occurred");
        setIsLoading(false);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [hasAccess, isDragging]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isMountedRef.current) {
        setIsFullscreen(!!document.fullscreenElement);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls (only if has access)
  const resetControlsTimeout = useCallback(() => {
    if (!hasAccess || !isMountedRef.current) return;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    if (isPlaying && !isDragging && !showSettings && !showInfo) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [hasAccess, isPlaying, isDragging, showSettings, showInfo]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  // Player controls (only if has access)
  const togglePlay = useCallback(() => {
    if (!hasAccess || !isMountedRef.current) return;

    if (isPlaying) {
      safePause();
    } else {
      safePlay();
    }
  }, [hasAccess, isPlaying, safePlay, safePause]);

  const handleSeek = useCallback(
    (time: number) => {
      if (!hasAccess || !isMountedRef.current) return;
      const video = videoRef.current;
      if (!video) return;

      video.currentTime = time;
      setCurrentTime(time);
    },
    [hasAccess]
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (!hasAccess || !isMountedRef.current) return;
      const video = videoRef.current;
      if (!video) return;

      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    },
    [hasAccess]
  );

  const toggleMute = useCallback(() => {
    if (!hasAccess || !isMountedRef.current) return;
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [hasAccess, isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    if (!isMountedRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        // Ignore fullscreen errors
      });
    } else {
      container.requestFullscreen().catch(() => {
        // Ignore fullscreen errors
      });
    }
  }, []);

  const skip = useCallback(
    (seconds: number) => {
      if (!hasAccess || !isMountedRef.current) return;
      const video = videoRef.current;
      if (!video) return;

      const newTime = Math.max(
        0,
        Math.min(duration, video.currentTime + seconds)
      );
      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [hasAccess, duration]
  );

  const changePlaybackRate = useCallback(
    (rate: number) => {
      if (!hasAccess || !isMountedRef.current) return;
      const video = videoRef.current;
      if (!video) return;

      video.playbackRate = rate;
      setPlaybackRate(rate);
    },
    [hasAccess]
  );

  // Progress bar handlers (only if has access)
  const handleProgressClick = useCallback(
    (e: React.MouseEvent) => {
      if (!hasAccess) return;
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;

      const percentage = (e.clientX - rect.left) / rect.width;
      const time = percentage * duration;
      handleSeek(time);
    },
    [hasAccess, duration, handleSeek]
  );

  const handleProgressMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!hasAccess || !showControls) return;

      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;

      const percentage = (e.clientX - rect.left) / rect.width;
      const time = percentage * duration;
      setPreviewTime(time);
      setShowPreview(true);
    },
    [hasAccess, showControls, duration]
  );

  const handleProgressMouseLeave = useCallback(() => {
    setShowPreview(false);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Check if rental is expired
  const isExpired =
    accessType === "rent" &&
    expiryDate &&
    new Date(expiryDate).getTime() < new Date().getTime();

  const getQualityDescription = (qual: string) => {
    switch (qual) {
      case "4K":
        return "4K Ultra HD (2160p)";
      case "1080p":
        return "Full HD (1080p)";
      case "720p":
        return "HD (720p)";
      case "480p":
        return "SD (480p)";
      case "360p":
        return "Low (360p)";
      default:
        return qual;
    }
  };

  // Check if quality is available
  const isQualityAvailable = (qualityOption: string) => {
    const qualityIndex = allQualityOptions.indexOf(qualityOption);
    return qualityIndex >= maxQualityIndex;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden group"
      onMouseMove={hasAccess ? resetControlsTimeout : undefined}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowPreview(false);
      }}
    >
      {/* Video Element */}
      {hasAccess && !isExpired ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={poster}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          playsInline
          preload="metadata"
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${poster})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Access Denied Overlay */}
      {(!hasAccess || isExpired) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center max-w-md mx-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
              <Lock className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 gradient-premium">
              {isExpired ? "Rental Expired" : "Premium Content"}
            </h2>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {isExpired
                ? "Your rental period has ended. Purchase or rent again to continue watching."
                : "This movie requires a purchase or rental to watch. Choose your preferred viewing option below."}
            </p>

            <div className="space-y-4">
              <Button
                onClick={
                  onPurchase ||
                  (() => router.push(`/movie/${router.query?.id || ""}`))
                }
                size="lg"
                className="w-full btn-premium"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isExpired ? "Rent or Buy Again" : "Rent or Buy Movie"}
              </Button>

              <Button
                variant="outline"
                onClick={onBack || (() => router.back())}
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </Button>
            </div>

            {accessType === "rent" && timeRemaining && !isExpired && (
              <div className="mt-6 p-4 glass-dark rounded-lg border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Rental Status</p>
                <p className="text-white font-medium">{timeRemaining}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State (only if has access) */}
      {hasAccess && !isExpired && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white text-xl">Loading video...</p>
            <p className="text-gray-400 text-sm mt-2">
              Preparing your premium viewing experience
            </p>
          </div>
        </div>
      )}

      {/* Buffering Indicator (only if has access) */}
      {hasAccess && !isExpired && isBuffering && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm p-6 rounded-full">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
          </div>
        </div>
      )}

      {/* Center Play Button (only if has access) */}
      {hasAccess && !isExpired && !isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={togglePlay}
            size="lg"
            className="w-24 h-24 rounded-full btn-premium shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <Play className="w-12 h-12 text-white ml-2" />
          </Button>
        </div>
      )}

      {/* Top Controls (only if has access) */}
      {hasAccess && !isExpired && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-all duration-300",
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack || (() => router.back())}
                className="text-white hover:bg-white/20 glass"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-white mb-1 gradient-premium">
                  {title}
                </h1>
                {description && (
                  <p className="text-gray-300 text-sm max-w-md truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInfo(!showInfo)}
                className="text-white hover:bg-white/20 glass"
              >
                <Info className="w-5 h-5" />
              </Button>
              <Badge variant="default" className="bg-purple-600/80 glass">
                {selectedQuality}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/30 text-white glass"
              >
                {formatTime(duration)}
              </Badge>
              <Badge
                variant="outline"
                className="border-purple-500/50 text-purple-300 glass"
              >
                Max: {maxQuality}
              </Badge>
              {accessType && (
                <Badge
                  variant={accessType === "buy" ? "success" : "default"}
                  className={
                    accessType === "buy"
                      ? "bg-green-600/80"
                      : "bg-purple-600/80"
                  }
                >
                  {accessType === "buy" ? "Owned" : "Rented"}
                </Badge>
              )}
              {timeRemaining && accessType === "rent" && (
                <Badge
                  variant="outline"
                  className="border-yellow-500/50 text-yellow-400"
                >
                  {timeRemaining}
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar (only if has access) */}
      {hasAccess && !isExpired && (
        <div
          className={cn(
            "absolute bottom-20 left-0 right-0 px-6 transition-all duration-300",
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          )}
        >
          <div
            ref={progressRef}
            className="relative group cursor-pointer"
            onClick={handleProgressClick}
            onMouseMove={handleProgressMouseMove}
            onMouseLeave={handleProgressMouseLeave}
          >
            <div className="h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-1.5 transition-all duration-200">
              <div
                className="h-full progress-gradient transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg border-2 border-white"
              style={{ left: `calc(${progress}% - 8px)` }}
            />

            {/* Time Preview */}
            {showPreview && (
              <div
                className="absolute bottom-full mb-2 glass-dark text-white text-xs py-1 px-2 rounded"
                style={{
                  left: `calc(${(previewTime / duration) * 100}% - 20px)`,
                }}
              >
                {formatTime(previewTime)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls (only if has access) */}
      {hasAccess && !isExpired && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-all duration-300",
            showControls
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 glass"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white/20 glass"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                className="text-white hover:bg-white/20 glass"
              >
                <RotateCw className="w-5 h-5" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 group">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 glass"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>

                <div className="w-0 overflow-hidden transition-all duration-300 group-hover:w-24">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer volume-slider"
                  />
                </div>
              </div>

              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 glass"
              >
                <Heart className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 glass"
              >
                <Download className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 glass"
              >
                <Share className="w-5 h-5" />
              </Button>

              {/* Subtitles */}
              <DropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 glass"
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>
                }
                align="right"
                side="top"
              >
                <div className="p-2 min-w-[150px]">
                  <p className="text-xs font-medium mb-2 px-2 text-gray-300">
                    Subtitles
                  </p>
                  {subtitleOptions.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setSubtitles(option)}
                      className={cn(
                        "text-white hover:bg-purple-600/50",
                        subtitles === option && "bg-purple-600 text-white"
                      )}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenu>

              {/* Playback Speed */}
              <DropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 glass text-sm px-3"
                  >
                    {playbackRate}x
                  </Button>
                }
                align="right"
                side="top"
              >
                <div className="p-2 min-w-[120px]">
                  <p className="text-xs font-medium mb-2 px-2 text-gray-300">
                    Speed
                  </p>
                  {playbackRates.map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={cn(
                        "text-white hover:bg-purple-600/50",
                        playbackRate === rate && "bg-purple-600 text-white"
                      )}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenu>

              {/* Quality Settings */}
              <DropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 glass"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                }
                align="right"
                side="top"
              >
                <div className="p-2 min-w-[200px]">
                  <p className="text-xs font-medium mb-2 px-2 text-gray-300">
                    Quality (Max: {getQualityDescription(maxQuality)})
                  </p>
                  {allQualityOptions.map((option) => {
                    const isAvailable = isQualityAvailable(option);
                    return (
                      <DropdownMenuItem
                        key={option}
                        onClick={
                          isAvailable
                            ? () => setSelectedQuality(option)
                            : undefined
                        }
                        className={cn(
                          "flex items-center justify-between w-full transition-all duration-200",
                          isAvailable
                            ? cn(
                                "text-white hover:bg-purple-600/50 cursor-pointer",
                                selectedQuality === option &&
                                  "bg-purple-600 text-white"
                              )
                            : "text-gray-500 cursor-not-allowed opacity-50 hover:bg-transparent"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          {!isAvailable && <Lock className="w-3 h-3" />}
                          <span>{getQualityDescription(option)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {option === maxQuality && (
                            <span className="text-xs text-purple-300">MAX</span>
                          )}
                          {!isAvailable && (
                            <span className="text-xs text-gray-500">
                              LOCKED
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <DropdownMenuItem
                      onClick={() => setShowSettings(true)}
                      className="text-white hover:bg-purple-600/50"
                    >
                      Keyboard Shortcuts
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 glass"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Movie Info Overlay (only if has access) */}
      {hasAccess && !isExpired && showInfo && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-dark rounded-xl p-8 max-w-2xl w-full mx-4 border border-white/10">
            <div className="flex items-start space-x-4">
              <img
                src={poster || "/placeholder.svg"}
                alt={title}
                className="w-24 h-36 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2 gradient-premium">
                  {title}
                </h2>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="default" className="bg-purple-600/80">
                    Current: {selectedQuality}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-purple-500/50 text-purple-300"
                  >
                    Max Available: {maxQuality}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/30 text-white"
                  >
                    {formatTime(duration)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-white/30 text-white"
                  >
                    {playbackRate}x Speed
                  </Badge>
                  {accessType && (
                    <Badge
                      variant={accessType === "buy" ? "success" : "default"}
                      className={
                        accessType === "buy"
                          ? "bg-green-600/80"
                          : "bg-purple-600/80"
                      }
                    >
                      {accessType === "buy" ? "Owned" : "Rented"}
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-400 space-y-1">
                  <div>Current Time: {formatTime(currentTime)}</div>
                  <div>Remaining: {formatTime(duration - currentTime)}</div>
                  <div>Quality: {getQualityDescription(selectedQuality)}</div>
                  <div>Max Quality: {getQualityDescription(maxQuality)}</div>
                  <div>Subtitles: {subtitles}</div>
                  {timeRemaining && <div>Rental: {timeRemaining}</div>}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 btn-premium"
            >
              Close Info
            </Button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay (only if has access) */}
      {hasAccess && !isExpired && showSettings && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-dark rounded-xl p-8 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 gradient-premium">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Play/Pause</span>
                <kbd>Space</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Skip Forward</span>
                <kbd>→</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Skip Backward</span>
                <kbd>←</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Volume Up</span>
                <kbd>↑</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Volume Down</span>
                <kbd>↓</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Fullscreen</span>
                <kbd>F</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Mute</span>
                <kbd>M</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Movie Info</span>
                <kbd>I</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Speed Down</span>
                <kbd>,</kbd>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Speed Up</span>
                <kbd>.</kbd>
              </div>
            </div>
            <Button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 btn-premium"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
