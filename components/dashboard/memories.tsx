"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";

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
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [closestMemoryId, setClosestMemoryId] = React.useState<string | null>(null);
  const [randomOffsets] = React.useState(() =>
    Array.from({ length: 80 }, () => ({
      damping: Math.random() * 30 + 10, // 10 to 40
      stiffness: Math.random() * 200 + 300, // 300 to 500
      delay: Math.random() * 0.3, // 0 to 0.3s
    }))
  );

  const memoriesData = React.useMemo(() => {
    if (memories.length > 0) return memories;
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
      "Scientific Discoveries", "Math Problems", "Poetry Collection",
      "Digital Art", "Blockchain Notes", "Sustainable Living",
      "Space Exploration", "Robotics Projects", "Virtual Reality",
      "Artificial Intelligence", "Biohacking Ideas", "Quantum Computing",
      "Cybersecurity Tips", "3D Printing Designs", "Smart Home Automation",
      "Renewable Energy", "Genetic Engineering", "Nanotechnology",
      "Augmented Reality", "Cloud Computing", "Internet of Things",
      "Machine Learning", "Data Visualization", "Cryptography",
      "Biotechnology", "Neuroscience", "Astrophysics"
    ];
    return Array.from({ length: 80 }, (_, i) => ({
      id: `memory-${i}`,
      name: memoryTitles[i % memoryTitles.length],
      height: undefined
    }));
  }, [memories]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!innerRef.current) return;

    const innerRect = innerRef.current.getBoundingClientRect();
    const adjustedMouseX = e.clientX - innerRect.left;
    const innerWidth = innerRect.width;

    const normalizedMouseX = Math.max(0, Math.min(1, adjustedMouseX / innerWidth));
    mouseX.set(normalizedMouseX);

    const memoryCount = memoriesData.length;
    if (memoryCount === 0) return;

    const closestIndex = Math.round(normalizedMouseX * (memoryCount - 1));
    const clampedIndex = Math.max(0, Math.min(memoryCount - 1, closestIndex));
    setClosestMemoryId(memoriesData[clampedIndex].id);
  }, [mouseX, memoriesData]);

  const displayedMemoryName = React.useMemo(() => {
    const memory = memoriesData.find(m => m.id === (activeMemoryId || hoveredMemoryId));
    return memory ? memory.name : null;
  }, [hoveredMemoryId, activeMemoryId, memoriesData]);

  // Pre-calculate minHeight for initial animation
  const getMinHeight = () => {
    const containerHeight = containerRef.current?.offsetHeight || 100;
    const maxMemoryHeight = containerHeight * 0.7;
    return maxMemoryHeight * 0.4; // Same as minHeight in targetHeight
  };

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
      <div ref={innerRef} className="flex items-end w-full justify-between">
        {memoriesData.map((memory, index) => {
          // Target height as a MotionValue for mouse interaction
          const targetHeight = useTransform(
            mouseXSmooth,
            (mouseXValue) => {
              const containerHeight = containerRef.current?.offsetHeight || 100;
              const maxMemoryHeight = containerHeight * 0.7;

              if (activeMemoryId === memory.id) return maxMemoryHeight;

              const memoryCount = memoriesData.length;
              const memoryPos = index / (memoryCount - 1);
              const distance = Math.abs(mouseXValue - memoryPos);

              const sigma = 1 / 15;
              const gaussianFactor = Math.exp(-(distance ** 2) / (2 * sigma ** 2));
              const minHeight = maxMemoryHeight * 0.4;
              return minHeight + gaussianFactor * (maxMemoryHeight - minHeight);
            }
          );

          // Spring-animated height with random offsets
          const animatedHeight = useSpring(0, {
            damping: randomOffsets[index].damping,
            stiffness: randomOffsets[index].stiffness,
            restDelta: 0.01
          });

          // Automatic reveal animation on mount
          React.useEffect(() => {
            const minHeight = getMinHeight();
            const delay = randomOffsets[index].delay;

            // Animate from 0 to minHeight with random delay
            const controls = animate(animatedHeight, minHeight, {
              type: "spring",
              damping: randomOffsets[index].damping,
              stiffness: randomOffsets[index].stiffness,
              delay,
            });

            // After initial animation, follow targetHeight for mouse interaction
            const timeout = setTimeout(() => {
              const unsubscribe = targetHeight.on("change", (latestHeight) => {
                animatedHeight.set(latestHeight);
              });
              return () => unsubscribe();
            }, delay * 1000); // Match delay in ms

            return () => {
              controls.stop();
              clearTimeout(timeout);
            };
          }, [animatedHeight, targetHeight, index]);

          return (
            <div
              key={memory.id}
              className="relative flex flex-col items-center px-1 min-w-[2px] cursor-pointer"
              onMouseEnter={() => !activeMemoryId && setHoveredMemoryId(memory.id)}
              onMouseLeave={() => !activeMemoryId && setHoveredMemoryId(null)}
              onClick={() => setActiveMemoryId(memory.id === activeMemoryId ? null : memory.id)}
            >
              <motion.div
                className="w-[2px] rounded-t-sm"
                style={{
                  height: animatedHeight,
                  backgroundColor: activeMemoryId === memory.id
                    ? "rgb(239, 68, 68)"
                    : closestMemoryId === memory.id
                      ? "rgb(0, 0, 0)"
                      : "rgb(150, 150, 150)"
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}