"use client";

import * as React from "react";
import { Heading, List, Quote } from "lucide-react";
import * as Portal from "@radix-ui/react-portal";
import { cn } from "@/lib/utils";

interface SlashMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptionSelect: (option: string) => void;
  position: { x: number; y: number } | null;
}

export function SlashMenu({ open, onOpenChange, onOptionSelect, position }: SlashMenuProps) {
  // Track dropdown measurements
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const options = React.useMemo(() => [
    { icon: Heading, label: "Heading", value: "# Heading " },
    { icon: List, label: "List", value: "- List item " },
    { icon: Quote, label: "Quote", value: "> Quote " }
  ], []);
  
  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % options.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(prev => (prev - 1 + options.length) % options.length);
          break;
        case "Enter":
          e.preventDefault();
          onOptionSelect(options[activeIndex].value);
          break;
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, onOptionSelect, options]);
  
  // Reset active index when dropdown opens
  React.useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);
  
  // Close on click outside
  React.useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);
  
  if (!open || !position) return null;
  
  return (
    <Portal.Root>
      <div 
        ref={dropdownRef}
        className="fixed z-50"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y + 15}px`, // Add more padding from cursor
          transform: 'translateY(0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
            "border-zinc-800 bg-zinc-950/85 backdrop-blur-sm text-zinc-100",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "max-h-[300px] origin-[var(--radix-dropdown-menu-content-transform-origin)]"
          )}
          data-state="open"
          data-side="bottom"
        >
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={option.label}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "transition-colors gap-2",
                  "[&_svg]:size-4 [&_svg]:shrink-0",
                  index === activeIndex 
                    ? "bg-zinc-800 text-zinc-50" 
                    : "text-zinc-400 focus:bg-zinc-800 focus:text-zinc-50"
                )}
                onClick={() => onOptionSelect(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                role="menuitem"
                tabIndex={-1}
              >
                <Icon className="size-4" />
                {option.label}
              </div>
            );
          })}
        </div>
      </div>
    </Portal.Root>
  );
}