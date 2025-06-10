"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  min: number
  max: number
  step?: number
  onValueChange?: (value: number[]) => void
  onValueCommit?: (value: number[]) => void
  className?: string
}

export function Slider({ value, min, max, step = 1, onValueChange, onValueCommit, className }: SliderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const sliderRef = React.useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateValue(e)
  }

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e)
      }
    },
    [isDragging],
  )

  const handleMouseUp = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      if (onValueCommit) {
        onValueCommit(value)
      }
    }
  }, [isDragging, onValueCommit, value])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newValue = min + percentage * (max - min)
    const steppedValue = Math.round(newValue / step) * step

    if (onValueChange) {
      onValueChange([steppedValue])
    }
  }

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className={cn("relative flex w-full touch-none select-none items-center cursor-pointer", className)}
      onMouseDown={handleMouseDown}
    >
      <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-700">
        <div className="absolute h-full bg-purple-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <div
        className="absolute block h-3.5 w-3.5 rounded-full border border-white bg-purple-500 shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50"
        style={{ left: `calc(${percentage}% - 7px)` }}
      />
    </div>
  )
}
