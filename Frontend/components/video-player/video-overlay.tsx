"use client"

import { useVideo } from "./video-context"
import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoOverlayProps {
  title?: string
}

export function VideoOverlay({ title }: VideoOverlayProps) {
  const { isPlaying, isLoading, isBuffering, error, togglePlay } = useVideo()

  // Show loading state
  if (isLoading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-white text-lg">Loading video...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
        <div className="text-center p-6 max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-4">Error</p>
          <p className="text-white mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Reload Player</Button>
        </div>
      </div>
    )
  }

  // Show play button when paused
  if (!isPlaying && !isBuffering) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {title && <h2 className="text-white text-2xl font-bold mb-8 text-center px-4 drop-shadow-lg">{title}</h2>}
        <Button
          onClick={togglePlay}
          size="lg"
          className="w-20 h-20 rounded-full bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm border-2 border-white/30"
        >
          <Play className="w-10 h-10 text-white ml-1" />
        </Button>
      </div>
    )
  }

  // Show buffering indicator
  if (isBuffering) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </div>
    )
  }

  return null
}
