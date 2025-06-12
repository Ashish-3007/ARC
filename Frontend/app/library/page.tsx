"use client";

import { useState, useEffect } from "react";
import { Play, Download, Clock } from "lucide-react";
import Link from "next/link";
import { useLibrary } from "@/contexts/library-context";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

function CountdownTimer({ expiryDate }: { expiryDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft("Expired");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  const isExpiringSoon = () => {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const difference = expiry - now;
    return difference > 0 && difference < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  return (
    <Badge
      variant={
        timeLeft === "Expired"
          ? "destructive"
          : isExpiringSoon()
          ? "outline"
          : "secondary"
      }
      className="flex items-center space-x-1"
    >
      <Clock className="w-3 h-3" />
      <span>{timeLeft}</span>
    </Badge>
  );
}

export default function LibraryPage() {
  const { items } = useLibrary();
  const [activeTab, setActiveTab] = useState("all");

  const rentedItems = items.filter((item) => item.type === "rent");
  const ownedItems = items.filter((item) => item.type === "buy");

  const getItemsForTab = (tab: string) => {
    switch (tab) {
      case "rented":
        return rentedItems;
      case "owned":
        return ownedItems;
      default:
        return items;
    }
  };

  const LibraryGrid = ({ items }: { items: typeof rentedItems }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card
          key={`${item.id}-${item.type}-${item.quality}`}
          className="group hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="relative">
            <img
              src={item.poster_path || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
            />

            {/* Quality Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="default" className="bg-black/70 backdrop-blur-sm">
                {item.quality}
              </Badge>
            </div>

            {/* Type Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant={item.type === "buy" ? "success" : "default"}>
                {item.type === "buy" ? "Owned" : "Rented"}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {item.title}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Purchased</span>
                <span>{new Date(item.purchaseDate).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Price</span>
                <span>{formatCurrency(item.price)}</span>
              </div>

              {item.type === "rent" && item.expiryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Expires</span>
                  <CountdownTimer expiryDate={item.expiryDate} />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Link href={`/player/${item.id}`} className="flex-1">
                <Button className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              </Link>

              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <PageLayout title="My Library">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400">
              {items.length} movies in your collection
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>{ownedItems.length} Owned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span>{rentedItems.length} Rented</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Movies ({items.length})</TabsTrigger>
            <TabsTrigger value="rented">
              Rented ({rentedItems.length})
            </TabsTrigger>
            <TabsTrigger value="owned">Owned ({ownedItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {items.length > 0 ? (
              <LibraryGrid items={items} />
            ) : (
              <EmptyState type="all" />
            )}
          </TabsContent>

          <TabsContent value="rented">
            {rentedItems.length > 0 ? (
              <LibraryGrid items={rentedItems} />
            ) : (
              <EmptyState type="rented" />
            )}
          </TabsContent>

          <TabsContent value="owned">
            {ownedItems.length > 0 ? (
              <LibraryGrid items={ownedItems} />
            ) : (
              <EmptyState type="owned" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

function EmptyState({ type }: { type: "all" | "rented" | "owned" }) {
  const messages = {
    all: {
      icon: "📚",
      title: "Your library is empty",
      description:
        "Start building your collection by renting or buying movies.",
    },
    rented: {
      icon: "🎬",
      title: "No rented movies",
      description:
        "Rent movies to watch them for a limited time at a great price.",
    },
    owned: {
      icon: "💎",
      title: "No owned movies",
      description: "Buy movies to add them permanently to your collection.",
    },
  };

  const message = messages[type];

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">{message.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{message.title}</h3>
      <p className="text-gray-400 mb-6">{message.description}</p>
      <Link href="/">
        <Button size="lg">Browse Movies</Button>
      </Link>
    </div>
  );
}
