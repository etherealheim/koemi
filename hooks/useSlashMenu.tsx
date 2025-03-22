"use client";

import * as React from "react";

type ChangeHandler = ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;

export function useSlashMenu(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  onChange: ChangeHandler
) {
  // Apply markdown formatting to selected text
  function formatText(text: string, startMarker: string, endMarker: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Get current selection and split text
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    // Create the new text with formatting
    const newText = `${beforeText}${startMarker}${text}${endMarker}${afterText}`;
    
    // Update textarea and focus
    textarea.value = newText;
    
    // Trigger onChange event
    if (onChange) {
      const event = new Event('input', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      Object.defineProperty(event, 'target', { value: textarea });
      onChange(event);
    }
    
    // Set cursor position after the formatted text
    const newPosition = start + text.length + startMarker.length + endMarker.length;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  }

  // Common markdown formatting helpers
  const handleBold = (text: string) => formatText(text, "**", "**");
  const handleItalic = (text: string) => formatText(text, "*", "*");
  const handleUnderline = (text: string) => formatText(text, "__", "__");

  return { handleBold, handleItalic, handleUnderline };
}