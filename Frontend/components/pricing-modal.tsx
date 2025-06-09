"use client"

import { useState } from "react"
import { X, Play, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/components/ui/toast"
import { getPricingOptions, getQualityDescription, type VideoQuality, type RentalDuration } from "@/lib/pricing"
import { formatCurrency, formatDuration } from "@/lib/utils"

interface Movie {
  id: number
  title: string
  poster_path: string
}

interface PricingModalProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
}

export function PricingModal({ movie, isOpen, onClose }: PricingModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>("HD")
  const [selectedDuration, setSelectedDuration] = useState<RentalDuration>("7d")
  const { addToCart } = useCart()
  const { addToast } = useToast()

  if (!isOpen) return null

  const pricingOptions = getPricingOptions(movie.id)
  const qualities: VideoQuality[] = ["SD", "HD", "FHD", "4K"]
  const durations: RentalDuration[] = ["24h", "7d", "1mo", "lifetime"]

  const selectedOption = pricingOptions.find(
    (option) => option.quality === selectedQuality && option.duration === selectedDuration,
  )

  const handleAddToCart = () => {
    if (selectedOption) {
      addToCart({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        type: selectedOption.type,
        price: selectedOption.price,
        quality: selectedOption.quality,
        duration: selectedOption.duration,
      })

      // Show success toast
      addToast({
        title: "Added to Cart",
        description: `${movie.title} (${selectedOption.quality}) added to your cart`,
        type: "success",
      })

      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={movie.poster_path || "/placeholder.svg"}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded"
            />
            <div>
              <h2 className="text-2xl font-bold">{movie.title}</h2>
              <p className="text-gray-400">Choose your viewing option</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6">
          {/* Quality Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Video Quality</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {qualities.map((quality) => (
                <button
                  key={quality}
                  onClick={() => setSelectedQuality(quality)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedQuality === quality
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold text-lg">{quality}</div>
                    <div className="text-sm text-gray-400 mt-1">{getQualityDescription(quality).split(" ").pop()}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Duration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {durations.map((duration) => {
                const option = pricingOptions.find(
                  (opt) => opt.quality === selectedQuality && opt.duration === duration,
                )
                return (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDuration === duration
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{formatDuration(duration)}</div>
                      <div className="text-purple-400 font-bold mt-1">
                        {option ? formatCurrency(option.price) : "—"}
                      </div>
                      {duration === "lifetime" && (
                        <Badge variant="success" className="mt-2">
                          Own Forever
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pricing Summary */}
          {selectedOption && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Selection</span>
                  <Badge variant={selectedOption.type === "buy" ? "success" : "default"}>
                    {selectedOption.type === "buy" ? "Purchase" : "Rental"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-400">Quality</div>
                    <div className="font-semibold">{getQualityDescription(selectedOption.quality)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Duration</div>
                    <div className="font-semibold">{formatDuration(selectedOption.duration)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="font-bold text-2xl text-purple-400">{formatCurrency(selectedOption.price)}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Play Trailer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>High-quality streaming</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Multiple device support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Offline download</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Subtitles available</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SD (480p)</span>
                    <span>Basic quality</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">HD (720p)</span>
                    <span>Good quality</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">FHD (1080p)</span>
                    <span>Great quality</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">4K (2160p)</span>
                    <span>Best quality</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
