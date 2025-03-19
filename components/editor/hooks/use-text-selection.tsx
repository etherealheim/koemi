"use client";

import * as React from "react";

export function useTextSelection(textareaRef: React.RefObject<HTMLTextAreaElement>) {
  const [toolbarPosition, setToolbarPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = React.useState("");

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
      return;
    }

    const selectedContent = textarea.value.substring(start, end);
    setSelectedText(selectedContent);
    
    // Calculate position relative to the textarea
    const textareaRect = textarea.getBoundingClientRect();
    const selectionRect = textarea.getBoundingClientRect();
    
    setToolbarPosition({
      x: selectionRect.left + (selectionRect.width / 2),
      y: textareaRect.top
    });
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
    };
  }, []);

  return {
    toolbarPosition,
    selectedText,
    handleSelectionChange
  };
} 