"use client";

import * as React from "react";

export function useTextSelection(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const [toolbarPosition, setToolbarPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = React.useState("");
  const selectionTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Only update if the textarea is focused
    if (document.activeElement !== textarea) {
      setToolbarPosition(null);
      setSelectedText("");
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Only show toolbar if there's an actual selection
    if (start === end) {
      setToolbarPosition(null);
      setSelectedText("");
      // Clear any pending timers
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
      return;
    }

    const selectedContent = textarea.value.substring(start, end);
    setSelectedText(selectedContent);
    
    // Clear any existing timer
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }
    
    // Set a new timer for showing the toolbar
    selectionTimerRef.current = setTimeout(() => {
      // Calculate the position of the selection
      const textareaRect = textarea.getBoundingClientRect();
      
      // Calculate approximate position of the selected text
      const textLines = textarea.value.substring(0, start).split("\n");
      const lastLine = textLines[textLines.length - 1];
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const lineCount = textLines.length;
      
      // Calculate selection midpoint
      const selectionWidth = getSelectionWidth(textarea, start, end);
      const selectionStartX = textareaRect.left + 
        getTextWidth(textarea, lastLine) + 
        getPaddingLeft(textarea);
      
      // Get Y position (top of the selected text - some offset)
      const selectionY = textareaRect.top + 
        (lineCount * lineHeight) - lineHeight +
        getPaddingTop(textarea);
      
      // Get X position (center of selection)
      const selectionX = selectionStartX + (selectionWidth / 2);
      
      setToolbarPosition({
        x: selectionX,
        y: selectionY
      });
    }, 1000); // 1 second delay
  };

  // Helper function to calculate text width
  const getTextWidth = (element: HTMLTextAreaElement, text: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    const style = getComputedStyle(element);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    
    return context.measureText(text).width;
  };
  
  // Helper function to calculate selection width
  const getSelectionWidth = (element: HTMLTextAreaElement, start: number, end: number): number => {
    const selectedText = element.value.substring(start, end);
    return getTextWidth(element, selectedText);
  };
  
  // Helper functions for padding
  const getPaddingLeft = (element: HTMLTextAreaElement): number => {
    return parseInt(getComputedStyle(element).paddingLeft) || 0;
  };
  
  const getPaddingTop = (element: HTMLTextAreaElement): number => {
    return parseInt(getComputedStyle(element).paddingTop) || 0;
  };

  React.useEffect(() => {
    const handleSelectionChangeEvent = () => {
      handleSelectionChange();
    };
    
    document.addEventListener("selectionchange", handleSelectionChangeEvent);
    document.addEventListener("keyup", handleSelectionChangeEvent);
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChangeEvent);
      document.removeEventListener("keyup", handleSelectionChangeEvent);
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
      }
    };
  }, []);

  return {
    toolbarPosition,
    selectedText,
    handleSelectionChange
  };
} 