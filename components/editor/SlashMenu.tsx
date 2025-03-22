"use client";

import * as React from "react";
import { Heading, List, Quote, Hash, Link, Image, Code, Table, Check, Type, Sparkles, ChevronRight, FileText } from "lucide-react";
import * as Portal from "@radix-ui/react-portal";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SlashMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptionSelect: (option: string) => void;
  position: { x: number; y: number } | null;
}

interface MenuOption {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  value?: string;
  type?: "separator" | "item";
}

export function SlashMenu({ open, onOpenChange, onOptionSelect, position }: SlashMenuProps) {
  // Track dropdown measurements
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const options: MenuOption[] = React.useMemo(() => [
    { icon: Sparkles, label: "Generate summary", value: "/ai summary", type: "item" },
    { type: "separator" },
    { icon: Heading, label: "Heading 1", value: "# Heading ", type: "item" },
    { icon: Heading, label: "Heading 2", value: "## Heading ", type: "item" },
    { icon: Heading, label: "Heading 3", value: "### Heading ", type: "item" },
    { icon: List, label: "Bullet List", value: "- List item ", type: "item" },
    { icon: Check, label: "Task List", value: "- [ ] Task ", type: "item" },
    { icon: Type, label: "Numbered List", value: "1. List item ", type: "item" },
    { icon: Quote, label: "Quote", value: "> Quote ", type: "item" },
    { icon: Code, label: "Code Block", value: "```\ncode\n```", type: "item" },
    { icon: Code, label: "Inline Code", value: "`code`", type: "item" },
    { icon: Link, label: "Link", value: "[link text](https://example.com)", type: "item" },
    { icon: FileText, label: "Wiki Link", value: "[[link]]", type: "item" },
    { icon: Image, label: "Image", value: "![alt text](https://example.com/image.jpg)", type: "item" },
    { icon: Hash, label: "Footnote", value: "Text with footnote[^1]\n\n[^1]: Footnote content", type: "item" },
    { icon: Table, label: "Table", value: "| Header | Header |\n| ------ | ------ |\n| Cell   | Cell   |", type: "item" },
  ], []);
  
  // Get non-separator items for navigation
  const nonSeparatorIndices = React.useMemo(() => {
    return options
      .map((option, index) => option.type !== "separator" ? index : -1)
      .filter(index => index !== -1);
  }, [options]);
  
  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          // Find current position in non-separator indices
          const currentIndex = nonSeparatorIndices.indexOf(activeIndex);
          // If not found or at end, go to first, otherwise go to next
          const nextItemIndex = currentIndex === -1 || currentIndex === nonSeparatorIndices.length - 1
            ? 0
            : currentIndex + 1;
          setActiveIndex(nonSeparatorIndices[nextItemIndex]);
          break;
        case "ArrowUp":
          e.preventDefault();
          // Find current position in non-separator indices
          const currIndex = nonSeparatorIndices.indexOf(activeIndex);
          // If not found or at beginning, go to last, otherwise go to previous
          const prevItemIndex = currIndex <= 0
            ? nonSeparatorIndices.length - 1
            : currIndex - 1;
          setActiveIndex(nonSeparatorIndices[prevItemIndex]);
          break;
        case "Enter":
          e.preventDefault();
          // Only process if we have a valid active index
          if (activeIndex >= 0 && activeIndex < options.length) {
            const selectedOption = options[activeIndex];
            if (selectedOption.type !== "separator" && selectedOption.value) {
              onOptionSelect(selectedOption.value);
            }
          }
          break;
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, onOptionSelect, options, nonSeparatorIndices]);
  
  // Reset active index when dropdown opens
  React.useEffect(() => {
    if (open) {
      // Set the first non-separator as active
      const firstOptionIndex = options.findIndex(opt => opt.type !== "separator");
      setActiveIndex(firstOptionIndex >= 0 ? firstOptionIndex : 0);
    }
  }, [open, options]);
  
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
  
  // Scroll active item into view when navigating with keyboard
  React.useEffect(() => {
    if (open && dropdownRef.current) {
      const activeElement = dropdownRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex, open]);
  
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
            "z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md",
            "border-zinc-800 bg-zinc-950/85 backdrop-blur-sm text-zinc-100",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "max-h-[320px] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-y-auto"
          )}
          data-state="open"
          data-side="bottom"
        >
          {options.map((option, index) => {
            // Render a separator
            if (option.type === "separator") {
              return <Separator key={`separator-${index}`} className="my-1 bg-zinc-800" />;
            }
            
            // Skip if missing required props
            if (!option.icon || !option.label || !option.value) {
              return null;
            }
            
            const IconComponent = option.icon;
            
            return (
              <div
                key={option.label}
                data-index={index}
                className={cn(
                  "relative flex justify-between cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                  "transition-colors gap-2 group",
                  "[&_svg:first-child]:size-4 [&_svg:first-child]:shrink-0",
                  index === activeIndex 
                    ? "bg-zinc-800 text-zinc-50" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
                )}
                onClick={() => option.value && onOptionSelect(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                role="menuitem"
                tabIndex={-1}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="size-4" />
                  <span>
                    {option.label}
                  </span>
                </div>
                
                <ChevronRight className="size-3.5 opacity-0 text-zinc-500 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>
    </Portal.Root>
  );
}