"use client"

import { useVideo } from "./video-context"
import { formatTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  Subtitles,
  Loader2,
  Lock,
} from "lucide-react"

export function VideoControls() {
  const {
    isPlaying,
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
    seekValue,
    isUserSeeking,
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
    maxQuality,
  } = useVideo()

  // Available options
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const allQualityOptions = ["auto", "4K", "1080p", "720p", "480p", "360p"]
  const subtitleOptions = ["off", "English", "Spanish", "French", "German"]

  // Get volume icon based on volume level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />
    if (volume < 0.5) return <Volume1 className="w-5 h-5" />
    return <Volume2 className="w-5 h-5" />
  }

  // Check if quality is available
  const isQualityAvailable = (qualityOption: string) => {
    if (qualityOption === "auto") return true
    if (!maxQuality || maxQuality === "4K") return true

    const qualityHierarchy = ["4K", "1080p", "720p", "480p", "360p"]
    const maxIndex = qualityHierarchy.indexOf(maxQuality)
    const optionIndex = qualityHierarchy.indexOf(qualityOption)

    return optionIndex >= maxIndex
  }

  const getQualityDescription = (qual: string) => {
    switch (qual) {
      case "auto":
        return "Auto"
      case "4K":
        return "4K Ultra HD (2160p)"
      case "1080p":
        return "Full HD (1080p)"
      case "720p":
        return "HD (720p)"
      case "480p":
        return "SD (480p)"
      case "360p":
        return "Low (360p)"
      default:
        return qual
    }
  }

  return (
    <div
      className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 transition-opacity duration-300 flex flex-col justify-between",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
    >
      {/* Progress bar */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div className="relative group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.01}
            value={isUserSeeking ? seekValue : currentTime}
            onChange={(e) => handleSeekChange(Number(e.target.value))}
            onMouseUp={(e) => handleSeekCommit(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer video-progress"
            style={{
              background: `linear-gradient(to right, #8e44ad 0%, #8e44ad ${((isUserSeeking ? seekValue : currentTime) / (duration || 100)) * 100}%, #374151 ${((isUserSeeking ? seekValue : currentTime) / (duration || 100)) * 100}%, #374151 100%)`,
            }}
          />

          {/* Buffering indicator */}
          {isBuffering && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            </div>
          )}

          {/* Time tooltip */}
          {isUserSeeking && (
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded">
              {formatTime(seekValue)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Play/Pause */}
          <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          {/* Skip backward */}
          <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
            <RotateCcw className="w-5 h-5" />
          </Button>

          {/* Skip forward */}
          <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/20">
            <RotateCw className="w-5 h-5" />
          </Button>

          {/* Volume */}
          <div className="flex items-center space-x-1 group">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
              {getVolumeIcon()}
            </Button>
            <div className="w-0 overflow-hidden transition-all duration-200 group-hover:w-20">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer volume-slider"
                style={{
                  background: `linear-gradient(to right, #8e44ad 0%, #8e44ad ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`,
                }}
              />
            </div>
          </div>

          {/* Time display */}
          <span className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Subtitles */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Subtitles className="w-5 h-5" />
              </Button>
            }
            align="end"
          >
            <div className="p-2 min-w-[150px]">
              <p className="text-xs font-medium mb-1 px-2">Subtitles</p>
              {subtitleOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSubtitles(option)}
                  className={subtitles === option ? "bg-purple-600 text-white" : ""}
                >
                  {option === "off" ? "Off" : option}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenu>

          {/* Playback speed */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" className="text-white hover:bg-white/20 text-xs">
                {playbackRate}x
              </Button>
            }
            align="end"
          >
            <div className="p-2 min-w-[100px]">
              <p className="text-xs font-medium mb-1 px-2">Speed</p>
              {playbackRates.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={playbackRate === rate ? "bg-purple-600 text-white" : ""}
                >
                  {rate}x
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenu>

          {/* Quality */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Settings className="w-5 h-5" />
              </Button>
            }
            align="end"
          >
            <div className="p-2 min-w-[200px]">
              <p className="text-xs font-medium mb-1 px-2">
                Quality {maxQuality && maxQuality !== "4K" && `(Max: ${maxQuality})`}
              </p>
              {allQualityOptions.map((option) => {
                const isAvailable = isQualityAvailable(option)
                return (
                  <DropdownMenuItem
                    key={option}
                    onClick={isAvailable ? () => setQuality(option) : undefined}
                    className={cn(
                      "flex items-center justify-between w-full transition-all duration-200",
                      isAvailable
                        ? cn(
                            "text-white hover:bg-purple-600/50 cursor-pointer",
                            quality === option && "bg-purple-600 text-white",
                          )
                        : "text-gray-500 cursor-not-allowed opacity-50 hover:bg-transparent",
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      {!isAvailable && <Lock className="w-3 h-3" />}
                      <span>{getQualityDescription(option)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {option === maxQuality && <span className="text-xs text-purple-300">MAX</span>}
                      {!isAvailable && <span className="text-xs text-gray-500">LOCKED</span>}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </div>
          </DropdownMenu>

          {/* Fullscreen */}
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
