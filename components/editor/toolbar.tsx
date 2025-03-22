"use client";

import * as React from "react";
import { Bold, Italic, Underline, Link, Code, Heading1, Heading2, List, ListOrdered, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarButton {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tooltip: string;
  onClick: (selectedText: string) => void;
}

interface ToolbarProps {
  onBold: (selectedText: string) => void;
  onItalic: (selectedText: string) => void;
  onUnderline: (selectedText: string) => void;
  onLink?: (selectedText: string) => void;
  onCode?: (selectedText: string) => void;
  onHeading1?: (selectedText: string) => void;
  onHeading2?: (selectedText: string) => void;
  onQuote?: (selectedText: string) => void;
  onList?: (selectedText: string) => void;
  onOrderedList?: (selectedText: string) => void;
  position: { x: number; y: number } | null;
  className?: string;
  selectedText?: string;
}

export function Toolbar({
  onBold,
  onItalic,
  onUnderline,
  onLink,
  onCode,
  onHeading1,
  onHeading2,
  onQuote,
  onList,
  onOrderedList,
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

  // Helper for formatting text
  const createFormatter = (prefix: string, suffix: string = prefix) => 
    (text: string) => {
      const textarea = document.activeElement as HTMLTextAreaElement;
      if (textarea?.tagName !== 'TEXTAREA') return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = textarea.value.substring(0, start);
      const afterText = textarea.value.substring(end);
      
      // Update textarea value
      textarea.value = `${beforeText}${prefix}${text}${suffix}${afterText}`;
      
      // Manually trigger input event to notify React of the change
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);
      
      // Set cursor position after the inserted text
      const newCursorPos = start + prefix.length + text.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    };

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
  
  // Add optional buttons if handlers are provided
  if (onLink) {
    buttons.push({
      icon: Link,
      label: "Link",
      tooltip: "Link (Markdown: [text](url))",
      onClick: onLink
    });
  }
  
  if (onCode) {
    buttons.push({
      icon: Code,
      label: "Code",
      tooltip: "Inline Code (Markdown: `text`)",
      onClick: onCode
    });
  }
  
  if (onHeading1) {
    buttons.push({
      icon: Heading1,
      label: "H1",
      tooltip: "Heading 1 (Markdown: # text)",
      onClick: onHeading1
    });
  }
  
  if (onHeading2) {
    buttons.push({
      icon: Heading2,
      label: "H2",
      tooltip: "Heading 2 (Markdown: ## text)",
      onClick: onHeading2
    });
  }
  
  if (onList) {
    buttons.push({
      icon: List,
      label: "List",
      tooltip: "Bullet List (Markdown: - text)",
      onClick: onList
    });
  }
  
  if (onOrderedList) {
    buttons.push({
      icon: ListOrdered,
      label: "Numbered List",
      tooltip: "Numbered List (Markdown: 1. text)",
      onClick: onOrderedList
    });
  }
  
  if (onQuote) {
    buttons.push({
      icon: Quote,
      label: "Quote",
      tooltip: "Quote (Markdown: > text)",
      onClick: onQuote
    });
  }

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
        "fixed z-50 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md overflow-x-auto max-w-md",
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