"use client";

import * as React from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
  onBold: (selectedText: string) => void;
  onItalic: (selectedText: string) => void;
  onUnderline: (selectedText: string) => void;
  position: { x: number; y: number } | null;
  className?: string;
  selectedText?: string;
}

export function Toolbar({
  onBold,
  onItalic,
  onUnderline,
  position,
  className,
  selectedText = "",
}: ToolbarProps) {
  // Add a ref and state to track the toolbar's dimensions
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [toolbarDimensions, setToolbarDimensions] = React.useState({ width: 120, height: 40 });

  // Measure the toolbar when it renders
  React.useEffect(() => {
    if (toolbarRef.current && position) {
      const { width, height } = toolbarRef.current.getBoundingClientRect();
      setToolbarDimensions({ width, height });
    }
  }, [position]);

  if (!position || !selectedText) return null;

  const handleBold = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBold(selectedText);
  };

  const handleItalic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onItalic(selectedText);
  };

  const handleUnderline = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUnderline(selectedText);
  };

  // Ensure toolbar stays within viewport
  const xPos = Math.min(
    Math.max(position.x, toolbarDimensions.width / 2 + 10), // Prevent going off left edge
    window.innerWidth - toolbarDimensions.width / 2 - 10 // Prevent going off right edge
  );
  
  // Position above the selection with a gap
  const yPos = Math.max(position.y - toolbarDimensions.height - 8, 10); // 8px gap, minimum 10px from top

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md",
        className
      )}
      style={{
        top: `${yPos}px`,
        left: `${xPos}px`,
        transform: "translateX(-50%)", // Center horizontally over selection
        opacity: 1,
        transition: "opacity 0.2s ease-in-out"
      }}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleBold}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Bold"
              type="button"
            >
              <Bold className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Bold (Markdown: **text**)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleItalic}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Italic"
              type="button"
            >
              <Italic className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Italic (Markdown: *text*)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleUnderline}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Underline"
              type="button"
            >
              <Underline className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Underline (Markdown: __text__)</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}