"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Memory {
  id: string;
  name: string;
  height?: number;
}

interface MemoriesProps {
  memories?: Memory[];
  className?: string;
}

export function Memories({ memories = [], className }: MemoriesProps) {
  const mouseX = useMotionValue(0);
  const mouseXSmooth = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const [activeMemoryId, setActiveMemoryId] = React.useState<string | null>(null);
  const [hoveredMemoryId, setHoveredMemoryId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Generate random memories if none provided
  const memoriesData = React.useMemo(() => {
    if (memories.length > 0) return memories;
    
    // Create memories with interesting titles
    const memoryTitles = [
      "Quantum Entanglement", "Cooking List", "Movies for Dinner", 
      "Neural Networks", "Travel Plans", "Book Recommendations",
      "Gardening Tips", "Fitness Goals", "Project Ideas",
      "Dream Journal", "Philosophy Notes", "Music Playlist",
      "Art Inspiration", "Coding Snippets", "Language Learning",
      "Meditation Log", "Recipe Collection", "Photography Ideas",
      "Writing Prompts", "Home Renovation", "Financial Goals",
      "Astronomy Notes", "Chess Strategies", "Podcast List",
      "Hiking Trails", "Coffee Varieties", "Wine Tasting",
      "Architectural Designs", "Fashion Trends", "Historical Events",
      "Scientific Discoveries", "Math Problems", "Poetry Collection"
    ];
    
    // Reduce the number of items for better performance
    return Array.from({ length: 60 }, (_, i) => {
      return {
        id: `memory-${i}`,
        name: memoryTitles[i % memoryTitles.length],
        height: undefined
      };
    });
  }, [memories]);

  // Handle mouse move using Framer Motion's built-in optimizations
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
  }, [mouseX]);

  // Get the name of the currently displayed memory (hovered or active)
  const displayedMemoryName = React.useMemo(() => {
    // If there's an active memory, it takes precedence
    if (activeMemoryId) {
      const memory = memoriesData.find(m => m.id === activeMemoryId);
      return memory ? memory.name : null;
    }
    
    // Otherwise, show hovered memory name
    if (hoveredMemoryId) {
      const memory = memoriesData.find(m => m.id === hoveredMemoryId);
      return memory ? memory.name : null;
    }
    
    return null;
  }, [hoveredMemoryId, activeMemoryId, memoriesData]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex items-end justify-between p-6 rounded-lg bg-[#f5f5dc]", 
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {displayedMemoryName && (
        <div className="absolute top-3 left-3 text-base md:text-lg font-medium text-black">
          {displayedMemoryName}
        </div>
      )}
      <div className="flex items-end w-full justify-between">
        {memoriesData.map((memory, index) => {
          // Create a motion value for each memory's height that responds to mouse position
          const memoryHeight = useTransform(
            mouseXSmooth,
            (mouseXValue) => {
              if (!containerRef.current) return 100;
              
              const containerWidth = containerRef.current.offsetWidth;
              const containerHeight = containerRef.current.offsetHeight;
              const maxMemoryHeight = containerHeight * 0.7;
              
              // If this memory is active, always return max height
              if (activeMemoryId === memory.id) {
                return maxMemoryHeight;
              }
              
              const memoryCount = memoriesData.length;
              const memoryPosition = (containerWidth / memoryCount) * (index + 0.5);
              
              // Calculate distance from mouse to memory
              const distance = Math.abs(mouseXValue - memoryPosition);
              const maxDistance = containerWidth / 6; // Increased influence range
              
              // Create a bell curve effect using Gaussian function
              // e^(-(x^2)/(2*sigma^2)) where sigma controls the width of the bell
              const sigma = maxDistance / 2.5;
              const gaussianFactor = Math.exp(-(Math.pow(distance, 2)) / (2 * Math.pow(sigma, 2)));
              
              // Calculate height based on bell curve
              const minHeight = maxMemoryHeight * 0.4;
              return minHeight + gaussianFactor * (maxMemoryHeight - minHeight);
            }
          );
          
          return (
            <div 
              key={memory.id}
              className="relative flex flex-col items-center px-1 min-w-[12px] cursor-pointer"
              onMouseEnter={() => !activeMemoryId && setHoveredMemoryId(memory.id)}
              onMouseLeave={() => !activeMemoryId && setHoveredMemoryId(null)}
              onClick={() => setActiveMemoryId(memory.id === activeMemoryId ? null : memory.id)}
            >
              <motion.div
                className={cn(
                  "w-[2px] rounded-t-sm", // Increased width from 3px to 6px
                  activeMemoryId === memory.id ? "bg-red-500" : "bg-black"
                )}
                style={{ height: memoryHeight }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}