"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { VideoControls } from "./video-controls"
import { VideoOverlay } from "./video-overlay"
import { VideoContext } from "./video-context"
import { cn } from "@/lib/utils"

export interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  className?: string
  onEnded?: () => void
  aspectRatio?: "16:9" | "4:3" | "21:9" | "1:1"
  maxQuality?: string
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  className,
  onEnded,
  aspectRatio = "16:9",
  maxQuality = "4K",
}: VideoPlayerProps) {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState("auto")
  const [subtitles, setSubtitles] = useState("off")
  const [error, setError] = useState<string | null>(null)
  const [isUserSeeking, setIsUserSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const isMountedRef = useRef(true)

  // Aspect ratio styles
  const aspectRatioStyles = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "21:9": "aspect-[21/9]",
    "1:1": "aspect-square",
  }

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {
          // Ignore errors from interrupted play promises
        })
      }
    }
  }, [])

  // Safe play function
  const safePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video || !isMountedRef.current) return

    try {
      // Cancel any existing play promise
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {
          // Ignore errors from previous play attempts
        })
      }

      // Start new play promise
      playPromiseRef.current = video.play()
      await playPromiseRef.current
      playPromiseRef.current = null
    } catch (error) {
      playPromiseRef.current = null
      if (error instanceof Error && error.name !== "AbortError") {
        console.warn("Video play failed:", error.message)
      }
    }
  }, [])

  // Safe pause function
  const safePause = useCallback(() => {
    const video = videoRef.current
    if (!video || !isMountedRef.current) return

    try {
      video.pause()
    } catch (error) {
      console.warn("Video pause failed:", error)
    }
  }, [])

  // Initialize player
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set initial volume
    video.volume = volume

    // Auto play if specified
    if (autoPlay) {
      safePlay()
    }

    // Load metadata
    const handleLoadedMetadata = () => {
      if (!isMountedRef.current) return
      setDuration(video.duration)
      setIsLoading(false)
    }

    // Update time
    const handleTimeUpdate = () => {
      if (!isUserSeeking && isMountedRef.current) {
        setCurrentTime(video.currentTime)
        setSeekValue(video.currentTime)
      }
    }

    // Handle buffering
    const handleWaiting = () => {
      if (isMountedRef.current) {
        setIsBuffering(true)
      }
    }

    const handleCanPlay = () => {
      if (isMountedRef.current) {
        setIsBuffering(false)
      }
    }

    // Handle play/pause
    const handlePlay = () => {
      if (isMountedRef.current) {
        setIsPlaying(true)
      }
    }

    const handlePause = () => {
      if (isMountedRef.current) {
        setIsPlaying(false)
      }
    }

    // Handle errors
    const handleError = () => {
      if (isMountedRef.current) {
        setError("An error occurred while playing this video.")
        setIsLoading(false)
      }
    }

    // Handle end
    const handleEnded = () => {
      if (isMountedRef.current) {
        setIsPlaying(false)
        if (onEnded) onEnded()
      }
    }

    // Add event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("error", handleError)
    video.addEventListener("ended", handleEnded)

    // Clean up
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("error", handleError)
      video.removeEventListener("ended", handleEnded)
    }
  }, [autoPlay, isUserSeeking, onEnded, volume, safePlay])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isMountedRef.current) {
        setIsFullscreen(!!document.fullscreenElement)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying && !isUserSeeking && isMountedRef.current) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowControls(false)
        }
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls, isUserSeeking])

  // Player controls
  const togglePlay = useCallback(() => {
    if (!isMountedRef.current) return

    if (isPlaying) {
      safePause()
    } else {
      safePlay()
    }
  }, [isPlaying, safePlay, safePause])

  const handleSeekChange = useCallback((value: number) => {
    setIsUserSeeking(true)
    setSeekValue(value)
  }, [])

  const handleSeekCommit = useCallback((value: number) => {
    const video = videoRef.current
    if (!video || !isMountedRef.current) return

    video.currentTime = value
    setCurrentTime(value)
    setIsUserSeeking(false)
  }, [])

  const handleVolumeChange = useCallback((value: number) => {
    const video = videoRef.current
    if (!video || !isMountedRef.current) return

    video.volume = value
    setVolume(value)
    setIsMuted(value === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video || !isMountedRef.current) return

    if (isMuted) {
      video.volume = volume || 0.5
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container || !isMountedRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((error) => {
        console.warn("Error exiting fullscreen:", error)
      })
    } else {
      container.requestFullscreen().catch((error) => {
        console.warn("Error entering fullscreen:", error)
      })
    }
  }, [])

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video || !isMountedRef.current) return

      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
      setCurrentTime(video.currentTime)
      setSeekValue(video.currentTime)
    },
    [duration],
  )

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current
    if (!video || !isMountedRef.current) return

    video.playbackRate = rate
    setPlaybackRate(rate)
  }, [])

  const handleMouseMove = useCallback(() => {
    if (!isMountedRef.current) return

    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setShowControls(false)
        }
      }, 3000)
    }
  }, [isPlaying])

  // Context value
  const contextValue = {
    videoRef,
    containerRef,
    isPlaying,
    isLoading,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    showControls,
    playbackRate,
    quality,
    subtitles,
    error,
    seekValue,
    isUserSeeking,
    maxQuality,
    togglePlay,
    handleSeekChange,
    handleSeekCommit,
    handleVolumeChange,
    toggleMute,
    toggleFullscreen,
    skip,
    changePlaybackRate,
    setQuality,
    setSubtitles,
  }

  return (
    <VideoContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn(
          "relative bg-black overflow-hidden group",
          aspectRatioStyles[aspectRatio],
          isFullscreen && "fixed inset-0 z-50 h-screen w-screen",
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && isMountedRef.current && setShowControls(false)}
      >
        {/* Video Element */}
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

        {/* Overlay UI */}
        <VideoOverlay title={title} />

        {/* Controls */}
        <VideoControls />
      </div>
    </VideoContext.Provider>
  )
}
