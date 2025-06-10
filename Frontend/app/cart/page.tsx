"use client"

import { Trash2, CreditCard } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDuration } from "@/lib/utils"
import { getQualityDescription } from "@/lib/pricing"

export default function CartPage() {
  const { items, removeFromCart, total, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <PageLayout title="Your Cart">
        <div className="max-w-4xl mx-auto text-center">
          <Card>
            <CardContent className="p-12">
              <p className="text-xl text-gray-400 mb-6">Your cart is empty</p>
              <Link href="/">
                <Button size="lg">Browse Movies</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Your Cart">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {items.length} item{items.length !== 1 ? "s" : ""} in cart
          </p>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <Card key={`${item.id}-${item.quality}-${item.duration}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={item.poster_path || "/placeholder.svg"}
                    alt={item.title}
                    className="w-20 h-30 object-cover rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={item.type === "buy" ? "success" : "default"}>
                        {item.type === "buy" ? "Purchase" : "Rental"}
                      </Badge>
                      <Badge variant="outline">{item.quality}</Badge>
                      <Badge variant="outline">{formatDuration(item.duration)}</Badge>
                    </div>

                    <p className="text-sm text-gray-400 mb-2">{getQualityDescription(item.quality)}</p>
                  </div>

                  <div className="text-right flex flex-col items-end space-y-2">
                    <p className="text-2xl font-bold text-purple-400">{formatCurrency(item.price)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id, item.quality, item.duration)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-2xl font-bold text-purple-400">{formatCurrency(total)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/checkout">
              <Button size="lg" className="w-full">
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
