"use client"

import type React from "react"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  fullWidth?: boolean
}

export function PageLayout({ children, title, subtitle, className, fullWidth = false }: PageLayoutProps) {
  const { isOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-[#121212]">
      <div
        className={cn(
          "transition-all duration-300",
          // Responsive sidebar margins
          "ml-0", // Mobile: no margin
          isOpen ? "lg:ml-72" : "lg:ml-20", // Desktop: responsive to sidebar state
          className,
        )}
      >
        {title && (
          <div className="border-b border-gray-800/50 bg-[#0a0a0a]/50 backdrop-blur-sm">
            <div
              className={cn(
                "py-4 sm:py-6",
                fullWidth ? "px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
              )}
            >
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-gray-400 text-sm sm:text-base">{subtitle}</p>}
            </div>
          </div>
        )}

        <div className={cn("py-4 sm:py-6 lg:py-8", fullWidth ? "px-0" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8")}>
          {children}
        </div>
      </div>
    </div>
  )
}
