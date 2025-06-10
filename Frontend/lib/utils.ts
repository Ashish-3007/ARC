import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDuration(duration: string): string {
  switch (duration) {
    case "24h":
      return "24 Hours"
    case "7d":
      return "7 Days"
    case "1mo":
      return "1 Month"
    case "lifetime":
      return "Lifetime"
    default:
      return duration
  }
}

export function formatTime(time: number): string {
  if (isNaN(time)) return "0:00"

  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
