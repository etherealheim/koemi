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
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "/") {
        e.preventDefault()
        
        const textarea = textareaRef.current
        if (textarea) {
          const cursorPosition = textarea.selectionStart
          setSlashPosition(cursorPosition)
          
          // Insert the slash character at the current cursor position
          const textBeforeCursor = textarea.value.substring(0, cursorPosition)
          const textAfterCursor = textarea.value.substring(cursorPosition)
          const newValue = textBeforeCursor + "/" + textAfterCursor
          
          if (props.onChange) {
            const event = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>
            props.onChange(event)
          }
          
          // Set cursor position immediately after the inserted slash
          setTimeout(() => {
            if (textarea) {
              const newPosition = cursorPosition + 1
              textarea.setSelectionRange(newPosition, newPosition)
              setShowDropdown(true)
            }
          }, 0)
        }
      }
    }

    const handleOptionSelect = (option: string) => {
      const textarea = textareaRef.current
      if (textarea && slashPosition !== null) {
        // Use the stored slash position to ensure correct replacement
        const textBeforeSlash = textarea.value.substring(0, slashPosition)
        const slashAndAfter = textarea.value.substring(slashPosition)
        const textAfterSlash = slashAndAfter.substring(1) // Remove the slash
        
        const newText = textBeforeSlash + option + textAfterSlash
        
        if (props.onChange) {
          const event = { target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>
          props.onChange(event)
        }
        
        // Focus and set cursor position after the inserted option
        setTimeout(() => {
          if (textarea) {
            const newCursorPosition = textBeforeSlash.length + option.length
            textarea.focus()
            textarea.setSelectionRange(newCursorPosition, newCursorPosition)
          }
        }, 0)
      }
      setShowDropdown(false)
      setSlashPosition(null)
    }
    
    // Close dropdown when clicking outside or when ESC key is pressed
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
          setShowDropdown(false)
          setSlashPosition(null)
        }
      }
      
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setShowDropdown(false)
          setSlashPosition(null)
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
            "flex w-full rounded-md border bg-background px-6 py-4 text-sm font-['Geist Mono Medium']",
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
        />
      </div>
    )
  }
)
TextEditor.displayName = "TextEditor"

export { TextEditor } 