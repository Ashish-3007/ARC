export type VideoQuality = "SD" | "HD" | "FHD" | "4K"
export type RentalDuration = "24h" | "7d" | "1mo" | "lifetime"

export interface PricingOption {
  quality: VideoQuality
  duration: RentalDuration
  price: number
  type: "rent" | "buy"
}

export const PRICING_MATRIX: Record<VideoQuality, Record<RentalDuration, number>> = {
  SD: {
    "24h": 19,
    "7d": 39,
    "1mo": 59,
    lifetime: 199,
  },
  HD: {
    "24h": 29,
    "7d": 59,
    "1mo": 89,
    lifetime: 249,
  },
  FHD: {
    "24h": 39,
    "7d": 79,
    "1mo": 119,
    lifetime: 299,
  },
  "4K": {
    "24h": 59,
    "7d": 119,
    "1mo": 159,
    lifetime: 399,
  },
}

export function getPrice(quality: VideoQuality, duration: RentalDuration): number {
  return PRICING_MATRIX[quality][duration]
}

export function getPricingOptions(movieId: number): PricingOption[] {
  const options: PricingOption[] = []

  Object.entries(PRICING_MATRIX).forEach(([quality, durations]) => {
    Object.entries(durations).forEach(([duration, price]) => {
      options.push({
        quality: quality as VideoQuality,
        duration: duration as RentalDuration,
        price,
        type: duration === "lifetime" ? "buy" : "rent",
      })
    })
  })

  return options
}

export function getQualityDescription(quality: VideoQuality): string {
  switch (quality) {
    case "SD":
      return "Standard Definition (480p)"
    case "HD":
      return "High Definition (720p)"
    case "FHD":
      return "Full HD (1080p)"
    case "4K":
      return "4K Ultra HD (2160p)"
    default:
      return quality
  }
}
