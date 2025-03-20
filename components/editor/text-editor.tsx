"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { EditorDropdown } from "@/components/editor/dropdown"
import { Toolbar } from "./toolbar"
import { useTextSelection } from "./hooks/use-text-selection"
import { useTextFormatting } from "./hooks/use-text-formatting"

export interface TextEditorProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fileName?: string;
}

const TextEditor = React.forwardRef<HTMLTextAreaElement, TextEditorProps>(
  ({ className, fileName = "example.md", ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [showDropdown, setShowDropdown] = React.useState(false)
    const [slashPosition, setSlashPosition] = React.useState<number | null>(null)
    const [dropdownPosition, setDropdownPosition] = React.useState<{ x: number, y: number } | null>(null)
    
    // Custom hooks
    const { 
      toolbarPosition, 
      selectedText, 
      handleSelectionChange 
    } = useTextSelection(textareaRef as React.RefObject<HTMLTextAreaElement>)
    
    const { 
      handleBold, 
      handleItalic, 
      handleUnderline 
    } = useTextFormatting(textareaRef as React.RefObject<HTMLTextAreaElement>, props.onChange)
    
    // Hide dropdown when text is selected
    React.useEffect(() => {
      if (selectedText && showDropdown) {
        setShowDropdown(false)
        setSlashPosition(null)
        setDropdownPosition(null)
      }
    }, [selectedText, showDropdown])
    
    // Function to calculate cursor position
    const calculateCursorPosition = (cursorPosition: number) => {
      const textarea = textareaRef.current
      if (!textarea) return null
      
      // Get textarea position and style
      const textareaRect = textarea.getBoundingClientRect()
      const computedStyle = window.getComputedStyle(textarea)
      const paddingLeft = parseInt(computedStyle.paddingLeft) || 0
      const paddingTop = parseInt(computedStyle.paddingTop) || 0
      const font = computedStyle.font || 
        `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`
      const fontSize = parseInt(computedStyle.fontSize) || 16
      const lineHeight = parseInt(computedStyle.lineHeight) || fontSize * 1.5
      
      // Get text until cursor to calculate line number
      const textUntilCursor = textarea.value.substring(0, cursorPosition)
      const lines = textUntilCursor.split('\n')
      const currentLineIndex = lines.length - 1
      const currentLine = lines[currentLineIndex]
      
      // Create a hidden span to measure text width accurately
      const span = document.createElement('span')
      span.style.font = font
      span.style.whiteSpace = 'pre'
      span.style.visibility = 'hidden'
      span.style.position = 'absolute'
      span.style.left = '-9999px'
      span.textContent = currentLine
      document.body.appendChild(span)
      
      const charWidth = span.getBoundingClientRect().width
      document.body.removeChild(span)
      
      // Calculate exact cursor position
      const x = textareaRect.left + paddingLeft + charWidth + 2 // +2px offset for cursor width
      const y = textareaRect.top + paddingTop + (currentLineIndex * lineHeight) + (lineHeight / 2)
      
      return { x, y }
    }
    
    // Check if we should dismiss dropdown based on cursor position
    const checkShouldDismissDropdown = () => {
      const textarea = textareaRef.current
      if (textarea && slashPosition !== null) {
        const cursorPos = textarea.selectionStart
        
        // If user has moved cursor away from right after the slash, dismiss
        if (cursorPos !== slashPosition + 1) {
          setShowDropdown(false)
          setSlashPosition(null)
          setDropdownPosition(null)
          return true
        }
        
        // If user has typed something right after the slash, dismiss
        if (cursorPos > slashPosition + 1) {
          setShowDropdown(false)
          setSlashPosition(null)
          setDropdownPosition(null)
          return true
        }
      }
      return false
    }
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // First check if dropdown is already open and we should dismiss it
      if (showDropdown) {
        // When dropdown is open, prevent the default action for navigation keys
        // to let the dropdown handle them
        if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) {
          e.preventDefault()
          // Only handle Escape here, the dropdown itself handles the other keys
          if (e.key === "Escape") {
            setShowDropdown(false)
            setSlashPosition(null)
            setDropdownPosition(null)
          }
          return
        }
        
        // Dismiss dropdown if typing continues after slash
        if (e.key !== "/") {
          // Allow a small delay for the input to be registered
          setTimeout(() => checkShouldDismissDropdown(), 10)
        }
      }
      
      // Handle slash to show dropdown
      if (e.key === "/") {
        // Don't prevent default here to allow the slash to be typed naturally
        
        const textarea = textareaRef.current
        if (textarea) {
          const cursorPosition = textarea.selectionStart
          
          // Set a small timeout to let the slash character be inserted first
          setTimeout(() => {
            if (textarea) {
              // Calculate position for dropdown after the slash has been inserted
              const position = calculateCursorPosition(cursorPosition + 1)
              if (position) {
                setSlashPosition(cursorPosition)
                setDropdownPosition(position)
                setShowDropdown(true)
              }
            }
          }, 10)
        }
      }
    }

    // Handle changes to the textarea content
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Call the original onChange handler
      if (props.onChange) {
        props.onChange(e)
      }
      
      // Check if we need to dismiss the dropdown
      if (showDropdown) {
        checkShouldDismissDropdown()
      }
    }

    const handleOptionSelect = (option: string) => {
      const textarea = textareaRef.current
      if (textarea && slashPosition !== null) {
        // We need to replace from the slash position (inclusive)
        const textBeforeSlash = textarea.value.substring(0, slashPosition)
        const textAfterSlash = textarea.value.substring(slashPosition + 1) // +1 to skip the slash
        
        // Completely replace the slash with the selected option
        const newText = textBeforeSlash + option + textAfterSlash
        
        if (props.onChange) {
          const event = { target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>
          props.onChange(event)
        }
        
        // Focus and set cursor position after the inserted option
        setTimeout(() => {
          if (textarea) {
            const newCursorPosition = slashPosition + option.length
            textarea.focus()
            textarea.setSelectionRange(newCursorPosition, newCursorPosition)
          }
        }, 0)
      }
      setShowDropdown(false)
      setSlashPosition(null)
      setDropdownPosition(null)
    }
    
    // Close dropdown when clicking outside or when ESC key is pressed
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
          setShowDropdown(false)
          setSlashPosition(null)
          setDropdownPosition(null)
        }
      }
      
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setShowDropdown(false)
          setSlashPosition(null)
          setDropdownPosition(null)
        }
      }
      
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleKeyDown)
      }
    }, [])

    return (
      <div className="relative">
        <textarea
          ref={(element) => {
            if (typeof ref === "function") ref(element)
            else if (ref) ref.current = element
            textareaRef.current = element
          }}
          className={cn(
            "flex w-full rounded-md border border-zinc-900 bg-background px-6 py-4 text-sm font-['Geist Mono Medium']",
            "placeholder:text-zinc-600 focus:placeholder:opacity-0 placeholder:transition-all duration-150",
            "text-zinc-100",
            className
          )}
          style={{
            lineHeight: "1.5",
            padding: "16px 24px",
            caretColor: "transparent",
          }}
          onFocus={(e) => {
            e.currentTarget.style.caretColor = "auto";
          }}
          onBlur={(e) => {
            e.currentTarget.style.caretColor = "transparent";
          }}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          {...props}
        />
        
        <Toolbar 
          onBold={handleBold}
          onItalic={handleItalic}
          onUnderline={handleUnderline}
          position={toolbarPosition}
          className="z-50"
          selectedText={selectedText}
        />
        
        <EditorDropdown 
          open={showDropdown} 
          onOpenChange={setShowDropdown}
          onOptionSelect={handleOptionSelect}
          position={dropdownPosition}
        />
      </div>
    )
  }
)
TextEditor.displayName = "TextEditor"

export { TextEditor } 