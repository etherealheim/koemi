"use client";

import * as React from "react";

type ChangeHandler = ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;

export function useTextFormatting(
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  onChange: ChangeHandler
) {
  const handleBold = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = `${beforeText}**${text}**${afterText}`;
    
    // Update the textarea value
    textarea.value = newText;
    
    // Trigger the onChange event
    if (onChange) {
      const event = new Event('input', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      Object.defineProperty(event, 'target', { value: textarea });
      onChange(event);
    }
    
    // Set cursor position after the formatted text
    textarea.focus();
    const newPosition = start + text.length + 4;
    textarea.setSelectionRange(newPosition, newPosition);
  };

  const handleItalic = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = `${beforeText}*${text}*${afterText}`;
    
    // Update the textarea value
    textarea.value = newText;
    
    // Trigger the onChange event
    if (onChange) {
      const event = new Event('input', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      Object.defineProperty(event, 'target', { value: textarea });
      onChange(event);
    }
    
    // Set cursor position after the formatted text
    textarea.focus();
    const newPosition = start + text.length + 2;
    textarea.setSelectionRange(newPosition, newPosition);
  };

  const handleUnderline = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = `${beforeText}__${text}__${afterText}`;
    
    // Update the textarea value
    textarea.value = newText;
    
    // Trigger the onChange event
    if (onChange) {
      const event = new Event('input', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      Object.defineProperty(event, 'target', { value: textarea });
      onChange(event);
    }
    
    // Set cursor position after the formatted text
    textarea.focus();
    const newPosition = start + text.length + 4;
    textarea.setSelectionRange(newPosition, newPosition);
  };

  return {
    handleBold,
    handleItalic,
    handleUnderline
  };
}