"use client";

import * as React from "react";

export function useToolbar(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const [toolbarPosition, setToolbarPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = React.useState("");
  const selectionTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Helper functions for text measurement and positioning
  const getTextWidth = React.useCallback((element: HTMLTextAreaElement, text: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    const style = getComputedStyle(element);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    
    return context.measureText(text).width;
  }, []);
  
  const getSelectionWidth = React.useCallback((element: HTMLTextAreaElement, start: number, end: number): number => {
    return getTextWidth(element, element.value.substring(start, end));
  }, [getTextWidth]);
  
  const getPadding = React.useCallback((element: HTMLTextAreaElement): {left: number, top: number} => {
    const style = getComputedStyle(element);
    return {
      left: parseInt(style.paddingLeft) || 0,
      top: parseInt(style.paddingTop) || 0
    };
  }, []);

  const handleSelectionChange = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || document.activeElement !== textarea) {
      setToolbarPosition(null);
      setSelectedText("");
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Only show toolbar if there's an actual selection
    if (start === end) {
      setToolbarPosition(null);
      setSelectedText("");
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
      return;
    }

    const selectedContent = textarea.value.substring(start, end);
    setSelectedText(selectedContent);
    
    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }
    
    // Show toolbar after a brief delay to avoid flicker with quick selections
    selectionTimerRef.current = setTimeout(() => {
      const textareaRect = textarea.getBoundingClientRect();
      const padding = getPadding(textarea);
      
      // Calculate position based on text selection
      const textLines = textarea.value.substring(0, start).split("\n");
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const lineCount = textLines.length;
      const lastLine = textLines[textLines.length - 1];
      
      // Calculate selection midpoint for X position
      const selectionWidth = getSelectionWidth(textarea, start, end);
      const selectionStartX = textareaRect.left + getTextWidth(textarea, lastLine) + padding.left;
      const selectionX = selectionStartX + (selectionWidth / 2);
      
      // Y position is at the top of the selected text
      const selectionY = textareaRect.top + (lineCount * lineHeight) - lineHeight + padding.top;
      
      setToolbarPosition({ x: selectionX, y: selectionY });
    }, 500);
  }, [textareaRef, getSelectionWidth, getTextWidth, getPadding]);

  React.useEffect(() => {
    const handleSelectionChangeEvent = () => handleSelectionChange();
    
    document.addEventListener("selectionchange", handleSelectionChangeEvent);
    document.addEventListener("keyup", handleSelectionChangeEvent);
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChangeEvent);
      document.removeEventListener("keyup", handleSelectionChangeEvent);
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
      }
    };
  }, [handleSelectionChange]);

  return { toolbarPosition, selectedText, handleSelectionChange };
} 