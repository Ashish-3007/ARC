"use client"

import type React from "react"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { useLibrary } from "@/contexts/library-context"
import { useToast } from "@/components/ui/toast"
import { Lock, CreditCard, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { getQualityDescription } from "@/lib/pricing"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { addToLibrary } = useLibrary()
  const { addToast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
    address: "",
    city: "",
    zipCode: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Add all items to library
    items.forEach((item) => {
      addToLibrary({
        id: item.id,
        title: item.title,
        poster_path: item.poster_path,
        type: item.type,
        quality: item.quality,
        price: item.price,
        duration: item.duration,
      })
    })

    // Show success toast
    addToast({
      title: "Purchase Complete",
      description: `${items.length} item${items.length !== 1 ? "s" : ""} added to your library`,
      type: "success",
      duration: 5000,
    })

    // Clear cart and redirect to library
    clearCart()
    router.push("/library")
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <PageLayout title="Checkout">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cvv: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={isProcessing} size="lg" className="w-full">
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Lock className="w-5 h-5 mr-2" />
                    )}
                    {isProcessing ? "Processing..." : `Pay ${formatCurrency(total)}`}
                  </Button>
                </div>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 pt-2">
                  <Shield className="w-4 h-4" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.quality}-${item.duration}`} className="border-b border-gray-700 pb-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.poster_path || "/placeholder.svg"}
                        alt={item.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant={item.type === "buy" ? "success" : "default"} className="text-xs">
                            {item.type === "buy" ? "Purchase" : "Rental"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.quality}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {formatDuration(item.duration)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{getQualityDescription(item.quality)}</p>
                      </div>
                      <span className="font-bold text-purple-400">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                  </span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2">
                  <span>Total</span>
                  <span className="text-purple-400">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-semibold mb-2 text-sm">What's Included:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Instant access to your purchased content</li>
                  <li>• High-quality streaming up to purchased resolution</li>
                  <li>• Multiple device support</li>
                  <li>• Offline download capability</li>
                  <li>• Subtitles and audio options</li>
                  <li>• No additional fees or hidden charges</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
