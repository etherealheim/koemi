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
  const toolbarWidth = 120; // Approximate width, adjust as needed
  const toolbarHeight = 40; // Approximate height, adjust as needed
  const xPos = Math.min(
    Math.max(position.x, toolbarWidth / 2 + 10), // Prevent going off left edge
    window.innerWidth - toolbarWidth / 2 - 10 // Prevent going off right edge
  );
  const yPos = position.y - toolbarHeight - 5; // 5px above the selection

  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md",
        className
      )}
      style={{
        top: `${Math.max(yPos, 10)}px`, // Ensure it doesn't go above the viewport
        left: `${xPos}px`,
        transform: "translateX(-50%)", // Center horizontally over selection
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