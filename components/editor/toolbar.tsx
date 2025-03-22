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

interface ToolbarButton {
  icon: React.ElementType;
  label: string;
  tooltip: string;
  onClick: (selectedText: string) => void;
}

export function Toolbar({
  onBold,
  onItalic,
  onUnderline,
  position,
  className,
  selectedText = "",
}: ToolbarProps) {
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [toolbarDimensions, setToolbarDimensions] = React.useState({ width: 120, height: 40 });

  // Measure toolbar when it renders
  React.useEffect(() => {
    if (toolbarRef.current && position) {
      const { width, height } = toolbarRef.current.getBoundingClientRect();
      setToolbarDimensions({ width, height });
    }
  }, [position]);

  if (!position || !selectedText) return null;

  // Define toolbar buttons
  const buttons: ToolbarButton[] = [
    {
      icon: Bold,
      label: "Bold",
      tooltip: "Bold (Markdown: **text**)",
      onClick: onBold
    },
    {
      icon: Italic,
      label: "Italic",
      tooltip: "Italic (Markdown: *text*)",
      onClick: onItalic
    },
    {
      icon: Underline,
      label: "Underline",
      tooltip: "Underline (Markdown: __text__)",
      onClick: onUnderline
    }
  ];

  // Handler factory for button clicks
  const createClickHandler = (handler: (text: string) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handler(selectedText);
  };
  
  // Calculate toolbar position to keep it within viewport
  const xPos = Math.min(
    Math.max(position.x, toolbarDimensions.width / 2 + 10),
    window.innerWidth - toolbarDimensions.width / 2 - 10
  );
  
  const yPos = Math.max(position.y - toolbarDimensions.height - 8, 10);

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
        transform: "translateX(-50%)",
        opacity: 1,
        transition: "opacity 0.2s ease-in-out"
      }}
    >
      <TooltipProvider>
        {buttons.map((button) => (
          <Tooltip key={button.label}>
            <TooltipTrigger asChild>
              <button
                onClick={createClickHandler(button.onClick)}
                className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={button.label}
                type="button"
              >
                <button.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{button.tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}