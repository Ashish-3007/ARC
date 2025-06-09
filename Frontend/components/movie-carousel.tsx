"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./movie-card";
import { Button } from "@/components/ui/button";
import type { Movie } from "@/lib/mock-data";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateArrows = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateArrows);
      updateArrows();
      return () => container.removeEventListener("scroll", updateArrows);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.75;
    const newScrollLeft =
      direction === "left"
        ? Math.max(0, container.scrollLeft - scrollAmount)
        : container.scrollLeft + scrollAmount;
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <div className="relative group px-2 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
        {title}
      </h2>

      <div className="relative">
        {showLeftArrow && (
          <Button
            onClick={() => scroll("left")}
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        <div
          ref={containerRef}
          className="flex space-x-3 sm:space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0">
              <MovieCard movie={movie} size="md" />
            </div>
          ))}
        </div>

        {showRightArrow && (
          <Button
            onClick={() => scroll("right")}
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-md border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
