"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useRouter } from "next/navigation";

interface Memory {
  id: string;
  name: string;
  height?: number;
}

interface MemoriesProps {
  memories?: Memory[];
  className?: string;
}

// Create a separate component for individual memory visualization
interface MemoryItemProps {
  memory: Memory;
  index: number;
  mouseXSmooth: ReturnType<typeof useSpring>;
  randomOffsets: Array<{damping: number; stiffness: number; delay: number}>;
  activeMemoryId: string | null;
  closestMemoryId: string | null;
  setHoveredMemoryId: (id: string | null) => void;
  setActiveMemoryId: (id: string | null) => void;
  handleMemoryClick: (memory: Memory) => void;
  getMinHeight: () => number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function MemoryItem({
  memory, 
  index, 
  mouseXSmooth, 
  randomOffsets, 
  activeMemoryId, 
  closestMemoryId,
  setHoveredMemoryId,
  setActiveMemoryId,
  handleMemoryClick,
  getMinHeight,
  containerRef
}: MemoryItemProps) {
  // Target height as a MotionValue for mouse interaction
  const targetHeight = useTransform(
    mouseXSmooth,
    (mouseXValue: number) => {
      const containerHeight = containerRef.current?.offsetHeight || 100;
      const maxMemoryHeight = containerHeight * 0.7;

      if (activeMemoryId === memory.id) return maxMemoryHeight;

      const memoryCount = 80; // Fixed value since we're no longer in the parent's context
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
  }, [animatedHeight, targetHeight, index, randomOffsets, getMinHeight]);

  return (
    <div
      key={memory.id}
      className="relative flex flex-col items-center px-1 min-w-[4px] cursor-pointer"
      onMouseEnter={() => !activeMemoryId && setHoveredMemoryId(memory.id)}
      onMouseLeave={() => !activeMemoryId && setHoveredMemoryId(null)}
      onClick={() => {
        setActiveMemoryId(memory.id === activeMemoryId ? null : memory.id);
        if (memory.id !== activeMemoryId) {
          handleMemoryClick(memory);
        }
      }}
    >
      <motion.div
        className="w-[2px] rounded-t-sm"
        style={{
          height: animatedHeight,
          backgroundColor: activeMemoryId === memory.id
            ? "#ef4444"
            : closestMemoryId === memory.id
              ? "rgb(0, 0, 0)"
              : "rgb(220, 207, 185)"
        }}
      />
    </div>
  );
}

export function Memories({ memories = [], className }: MemoriesProps) {
  const router = useRouter();
  const mouseX = useMotionValue(0);
  const mouseXSmooth = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const [activeMemoryId, setActiveMemoryId] = React.useState<string | null>(null);
  const [hoveredMemoryId, setHoveredMemoryId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [closestMemoryId, setClosestMemoryId] = React.useState<string | null>(null);
  const [randomOffsets] = React.useState(() =>
    Array.from({ length: 80 }, () => ({
      damping: Math.random() * 20 + 15, // 15 to 35
      stiffness: Math.random() * 100 + 200, // 200 to 300
      delay: Math.random() * 0.2, // 0 to 0.2s
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
  const getMinHeight = React.useCallback(() => {
    const containerHeight = containerRef.current?.offsetHeight || 100;
    const maxMemoryHeight = containerHeight * 0.7;
    return maxMemoryHeight * 0.4; // Same as minHeight in targetHeight
  }, []);

  // Generate markdown content based on memory name
  const generateMemoryContent = (memoryName: string) => {
    // Generate different content based on memory category
    const topics: Record<string, string> = {
      "Quantum": "# Quantum Entanglement\n\nQuantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance.\n\n## Key Concepts\n\n- Spooky action at a distance\n- Bell's inequality\n- Quantum teleportation\n- Quantum computing applications\n\n## Recent Thoughts\n\nI've been thinking about how quantum entanglement might be leveraged for secure communications systems beyond current quantum key distribution protocols.",
      "Cooking": "# Cooking List\n\n## Recipes to Try\n\n- Mushroom risotto with truffle oil\n- Korean bibimbap with homemade gochujang\n- Sourdough bread with wild yeast starter\n- Thai green curry with homemade paste\n\n## Ingredients to Purchase\n\n- High-quality olive oil\n- Fresh herbs (basil, thyme, rosemary)\n- Specialty salts\n- Aged balsamic vinegar\n\n## Cooking Techniques to Master\n\n- French knife skills\n- Proper tempering of chocolate\n- Sous vide cooking\n- Fermentation methods",
      "Movies": "# Movies for Dinner\n\n## Watch List\n\n- The Seventh Seal (1957)\n- In the Mood for Love (2000)\n- Parasite (2019)\n- Everything Everywhere All at Once (2022)\n\n## Director Retrospectives\n\n- Wong Kar-wai\n- Andrei Tarkovsky\n- Agnès Varda\n- Hayao Miyazaki\n\n## Themed Movie Nights\n\n- Neo-noir evening\n- Science fiction classics\n- International animation showcase\n- Documentary double features",
      "Neural": "# Neural Networks\n\n## Current Projects\n\n- Building a generative adversarial network for art creation\n- Implementing a transformer model for language processing\n- Exploring reinforcement learning for game playing\n\n## Research Areas\n\n- Attention mechanisms\n- Few-shot learning\n- Explainable AI\n- Neural architecture search\n\n## Resources\n\n- Papers to read: https://arxiv.org/list/cs.LG/recent\n- Frameworks to explore: PyTorch, JAX\n- Datasets to test: ImageNet, GLUE benchmark",
      "Travel": "# Travel Plans\n\n## Destinations\n\n- Kyoto, Japan (Cherry blossom season)\n- Patagonia, Argentina/Chile (Summer hiking)\n- Iceland (Northern lights winter trip)\n- Morocco (Cultural exploration)\n\n## Planning Checklist\n\n- Research visa requirements\n- Check vaccination needs\n- Find accommodation options\n- Create rough itineraries\n- Budget estimates per destination\n\n## Packing Essentials\n\n- Universal adapter\n- Compact camera\n- Lightweight quick-dry clothes\n- Quality walking shoes",
      "Book": "# Book Recommendations\n\n## Fiction\n\n- \"The Overstory\" by Richard Powers\n- \"Piranesi\" by Susanna Clarke\n- \"The Memory Police\" by Yoko Ogawa\n- \"Klara and the Sun\" by Kazuo Ishiguro\n\n## Non-Fiction\n\n- \"Entangled Life\" by Merlin Sheldrake\n- \"Breath\" by James Nestor\n- \"Four Thousand Weeks\" by Oliver Burkeman\n- \"Atlas of the Invisible\" by James Cheshire and Oliver Uberti\n\n## Reading Notes\n\nI've been particularly interested in books exploring the relationship between humans and technology lately. Looking for more recommendations in this area.",
      "default": `# ${memoryName}\n\n## Overview\n\nThis is a place to capture your thoughts, ideas, and reflections on ${memoryName}.\n\n## Key Points\n\n- First important point about ${memoryName}\n- Second important insight\n- Questions to explore further\n- Connections to other topics\n\n## Resources\n\n- Books to read\n- People to connect with\n- Websites to explore\n- Tools to try\n\n## Next Steps\n\nWhat would you like to learn or explore next about ${memoryName}?`
    };
    
    // Find the matching category or use default
    const category = Object.keys(topics).find(key => memoryName.includes(key));
    return category ? topics[category] : topics.default;
  };

  // Handle memory click to redirect to memory page
  const handleMemoryClick = async (memory: Memory) => {
    const memoryName = memory.name.toLowerCase().replace(/\s+/g, '-');
    const content = generateMemoryContent(memory.name);
    
    try {
      // Make API call to save memory content before redirecting
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          fileName: `vault/memories/${memoryName}.md` 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save memory content');
      }
      
      // Redirect to the memory page
      router.push(`/memories/${memoryName}`);
    } catch (error) {
      console.error("Failed to save memory content:", error);
      // Still redirect even if saving fails
      router.push(`/memories/${memoryName}`);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-end justify-between p-6 rounded-lg bg-orange-100",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {displayedMemoryName && (
        <div className="absolute top-4 left-6 text-base md:text-xl font-mono font-semibold text-stone-600">
          {displayedMemoryName}
        </div>
      )}
      <div ref={innerRef} className="flex items-end w-full justify-between">
        {memoriesData.map((memory, index) => (
          <MemoryItem
            key={memory.id}
            memory={memory}
            index={index}
            mouseXSmooth={mouseXSmooth}
            randomOffsets={randomOffsets}
            activeMemoryId={activeMemoryId}
            closestMemoryId={closestMemoryId}
            setHoveredMemoryId={setHoveredMemoryId}
            setActiveMemoryId={setActiveMemoryId}
            handleMemoryClick={handleMemoryClick}
            getMinHeight={getMinHeight}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}