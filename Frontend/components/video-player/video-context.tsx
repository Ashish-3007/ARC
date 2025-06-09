"use client"

import { createContext, useContext, type RefObject } from "react"

interface VideoContextType {
  videoRef: RefObject<HTMLVideoElement>
  containerRef: RefObject<HTMLDivElement>
  isPlaying: boolean
  isLoading: boolean
  isBuffering: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  isFullscreen: boolean
  showControls: boolean
  playbackRate: number
  quality: string
  subtitles: string
  error: string | null
  seekValue: number
  isUserSeeking: boolean
  maxQuality?: string // Add this new property
  togglePlay: () => void
  handleSeekChange: (value: number) => void
  handleSeekCommit: (value: number) => void
  handleVolumeChange: (value: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  skip: (seconds: number) => void
  changePlaybackRate: (rate: number) => void
  setQuality: (quality: string) => void
  setSubtitles: (subtitles: string) => void
}

export const VideoContext = createContext<VideoContextType | undefined>(undefined)

export function useVideo() {
  const context = useContext(VideoContext)
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider")
  }
  return context
}
