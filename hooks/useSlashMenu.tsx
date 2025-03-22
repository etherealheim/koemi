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
  
  // MDX specific formatting helpers
  const handleLink = (text: string) => formatText(text, "[", "](url)");
  const handleImage = (text: string) => formatText(text, "![", "](url)");
  const handleCode = (text: string) => formatText(text, "`", "`");
  const handleCodeBlock = (text: string) => formatText(text, "```\n", "\n```");
  const handleHeading1 = (text: string) => formatText(text, "# ", "");
  const handleHeading2 = (text: string) => formatText(text, "## ", "");
  const handleHeading3 = (text: string) => formatText(text, "### ", "");
  const handleQuote = (text: string) => formatText(text, "> ", "");
  const handleBulletList = (text: string) => formatText(text, "- ", "");
  const handleNumberedList = (text: string) => formatText(text, "1. ", "");
  const handleTaskList = (text: string) => formatText(text, "- [ ] ", "");
  const handleStrikethrough = (text: string) => formatText(text, "~~", "~~");
  const handleHorizontalRule = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(start);
    
    // Add a newline before and after if not already present
    const beforeNewline = beforeText.endsWith('\n') ? '' : '\n';
    const afterNewline = afterText.startsWith('\n') ? '' : '\n';
    
    const newText = `${beforeText}${beforeNewline}---${afterNewline}${afterText}`;
    
    textarea.value = newText;
    
    if (onChange) {
      const event = new Event('input', { bubbles: true }) as unknown as React.ChangeEvent<HTMLTextAreaElement>;
      Object.defineProperty(event, 'target', { value: textarea });
      onChange(event);
    }
    
    const newPosition = start + beforeNewline.length + 3 + afterNewline.length;
    textarea.focus();
    textarea.setSelectionRange(newPosition, newPosition);
  };

  return { 
    handleBold, 
    handleItalic, 
    handleUnderline,
    handleLink,
    handleImage,
    handleCode,
    handleCodeBlock,
    handleHeading1,
    handleHeading2,
    handleHeading3,
    handleQuote,
    handleBulletList,
    handleNumberedList,
    handleTaskList,
    handleStrikethrough,
    handleHorizontalRule
  };
}