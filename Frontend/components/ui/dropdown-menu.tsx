"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right" | "center"
  side?: "top" | "bottom" | "auto"
}

export function DropdownMenu({ trigger, children, align = "left", side = "auto" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState<"top" | "bottom">("bottom")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    if (isOpen && side === "auto" && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top

      // If there's more space above or if we're in the bottom half of the screen
      if (spaceAbove > spaceBelow || triggerRect.bottom > viewportHeight * 0.6) {
        setPosition("top")
      } else {
        setPosition("bottom")
      }
    } else if (side !== "auto") {
      setPosition(side)
    }
  }, [isOpen, side])

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  }

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 min-w-[200px] bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl py-1 animate-in fade-in-0 zoom-in-95",
            alignmentClasses[align],
            positionClasses[position],
          )}
          style={{
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 first:rounded-t-lg last:rounded-b-lg",
        className,
      )}
    >
      {children}
    </button>
  )
}
