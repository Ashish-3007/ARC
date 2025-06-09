"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PremiumVideoPlayer } from "@/components/premium-player/premium-video-player";
import { getMovieById } from "@/lib/mock-data";
import { useLibrary } from "@/contexts/library-context";

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = Number.parseInt(params.id as string);
  const [movie, setMovie] = useState<any>(null);
  const { getLibraryItem } = useLibrary();
  const libraryItem = getLibraryItem(movieId);

  useEffect(() => {
    const movieData = getMovieById(movieId);
    if (movieData) {
      setMovie(movieData);
    }
  }, [movieId]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Movie...</h1>
          <p className="text-gray-400">
            Please wait while we prepare your viewing experience
          </p>
        </div>
      </div>
    );
  }

  const hasAccess = !!libraryItem;
  const accessType = libraryItem?.type || null;
  const expiryDate = libraryItem?.expiryDate;
  const purchasedQuality = libraryItem?.quality || "4K";
  const isExpired =
    accessType === "rent" &&
    expiryDate &&
    new Date(expiryDate).getTime() < new Date().getTime();

  const handlePurchase = () => {
    router.push(`/movie/${movieId}`);
  };

  const handleBack = () => {
    router.back();
  };

  // Determine the source based on access
  const videoSrc =
    movie.trailer_url ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const allowPlayback = hasAccess && !isExpired;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <PremiumVideoPlayer
        src={videoSrc}
        poster={movie.backdrop_path}
        title={movie.title}
        description={movie.overview}
        duration={movie.runtime * 60}
        quality={purchasedQuality}
        maxQuality={purchasedQuality}
        hasAccess={allowPlayback}
        accessType={accessType}
        expiryDate={expiryDate}
        onBack={handleBack}
        onPurchase={handlePurchase}
        showPurchasePrompt={!allowPlayback}
      />
    </div>
  );
}
