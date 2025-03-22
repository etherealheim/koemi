"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { SlashMenu } from "@/components/editor/SlashMenu"
import { Toolbar } from "./Toolbar"
import { useToolbar } from "@/hooks/useToolbar"
import { useSlashMenu } from "@/hooks/useSlashMenu"
import { Eye, EyeOff, Split } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { Button } from "@/components/ui/button"

export interface TextEditorProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fileName?: string;
}

type ViewMode = "edit" | "preview" | "split";

const TextEditor = React.forwardRef<HTMLTextAreaElement, TextEditorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, fileName, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [showDropdown, setShowDropdown] = React.useState(false)
    const [slashPosition, setSlashPosition] = React.useState<number | null>(null)
    const [dropdownPosition, setDropdownPosition] = React.useState<{ x: number, y: number } | null>(null)
    const [viewMode, setViewMode] = React.useState<ViewMode>("edit")
    const [markdownContent, setMarkdownContent] = React.useState("")
    
    // Custom hooks
    const { 
      toolbarPosition, 
      selectedText
    } = useToolbar(textareaRef as React.RefObject<HTMLTextAreaElement>)
    
    const slashMenuHandlers = useSlashMenu(textareaRef as React.RefObject<HTMLTextAreaElement>, props.onChange)
    
    // Hide dropdown when text is selected
    React.useEffect(() => {
      if (selectedText && showDropdown) {
        setShowDropdown(false)
        setSlashPosition(null)
        setDropdownPosition(null)
      }
    }, [selectedText, showDropdown])
    
    // Initial content setup for text area value
    React.useEffect(() => {
      if (props.value) {
        setMarkdownContent(props.value.toString());
      }
    }, [props.value]);
    
    // Update markdown content when textarea value changes
    React.useEffect(() => {
      if (viewMode !== "edit") {
        const content = textareaRef.current?.value || props.value?.toString() || "";
        setMarkdownContent(content);
      }
    }, [viewMode, props.value]);
    
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
      
      // Update markdown content in real-time
      if (viewMode !== "edit") {
        setMarkdownContent(e.target.value);
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
        
        // Update markdown content directly 
        if (viewMode !== "edit") {
          setMarkdownContent(newText);
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

    // Toggle between edit, preview, and split modes
    const toggleViewMode = (mode: ViewMode) => {
      setViewMode(mode);
      
      // Update markdown content when switching to preview or split mode
      if (mode !== "edit") {
        const content = textareaRef.current?.value || props.value?.toString() || "";
        setMarkdownContent(content);
      }
    };
    
    // Render Markdown components
    const MarkdownComponents = {
      // Override h1 with custom styling
      h1: ({ node, ...props }: any) => (
        <h1 className="text-2xl font-bold tracking-tight mt-6 mb-2" {...props} />
      ),
      // Override h2 with custom styling
      h2: ({ node, ...props }: any) => (
        <h2 className="text-xl font-semibold tracking-tight mt-6 mb-2" {...props} />
      ),
      // Override h3 with custom styling
      h3: ({ node, ...props }: any) => (
        <h3 className="text-lg font-medium tracking-tight mt-4 mb-2" {...props} />
      ),
      // Override link with custom styling
      a: ({ node, ...props }: any) => (
        <a className="text-blue-400 hover:text-blue-300 underline" {...props} />
      ),
      // Override code with custom styling
      code: ({ node, inline, ...props }: any) => (
        inline 
          ? <code className="bg-zinc-800 rounded px-1 py-0.5 text-sm" {...props} />
          : <code className="block bg-zinc-800/50 rounded p-4 my-4 overflow-x-auto" {...props} />
      ),
      // Override blockquote with custom styling
      blockquote: ({ node, ...props }: any) => (
        <blockquote className="border-l-4 border-zinc-700 pl-4 italic my-4" {...props} />
      ),
      // Override unordered lists (bullet points)
      ul: ({ node, ...props }: any) => (
        <ul className="pl-6 my-4 space-y-2 list-disc" {...props} />
      ),
      // Override ordered lists (numbered)
      ol: ({ node, ...props }: any) => (
        <ol className="pl-6 my-4 space-y-2 list-decimal" {...props} />
      ),
      // Override list items
      li: ({ node, ...props }: any) => (
        <li className="pl-1 marker:text-zinc-400" {...props} />
      ),
      // Override task lists
      input: ({ node, ...props }: any) => (
        props.type === 'checkbox' ? (
          <input 
            {...props} 
            disabled={true} 
            className="mr-1 h-3.5 w-3.5 rounded border-zinc-600 text-blue-500 focus:ring-0 focus:ring-offset-0 accent-blue-500"
          />
        ) : (
          <input {...props} />
        )
      ),
    };

    return (
      <div className="relative flex flex-col gap-2">
        <div className="flex justify-end mb-1 gap-1">
          <div className="flex bg-zinc-900/50 rounded-md p-0.5">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleViewMode("edit")}
              className={cn(
                "flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-sm",
                viewMode === "edit" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleViewMode("preview")}
              className={cn(
                "flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-sm",
                viewMode === "preview" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleViewMode("split")}
              className={cn(
                "flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-sm",
                viewMode === "split" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Split</span>
            </Button>
          </div>
        </div>

        <div className={cn("relative w-full", viewMode === "split" ? "grid grid-cols-2 gap-4" : "")}>
          {/* Editor */}
          {(viewMode === "edit" || viewMode === "split") && (
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
                  height: viewMode === "split" ? "400px" : undefined
                }}
                onFocus={(e) => {
                  e.currentTarget.style.caretColor = "auto";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.caretColor = "transparent";
                }}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                placeholder="Write, press '/' for commands"
                {...props}
              />
              
              <Toolbar 
                onBold={slashMenuHandlers.handleBold}
                onItalic={slashMenuHandlers.handleItalic}
                onUnderline={slashMenuHandlers.handleUnderline}
                onLink={slashMenuHandlers.handleLink}
                onCode={slashMenuHandlers.handleCode}
                onHeading1={slashMenuHandlers.handleHeading1}
                onHeading2={slashMenuHandlers.handleHeading2}
                onQuote={slashMenuHandlers.handleQuote}
                onList={slashMenuHandlers.handleBulletList}
                onOrderedList={slashMenuHandlers.handleNumberedList}
                position={toolbarPosition}
                className="z-50"
                selectedText={selectedText}
              />
              
              <SlashMenu 
                open={showDropdown} 
                onOpenChange={setShowDropdown}
                onOptionSelect={handleOptionSelect}
                position={dropdownPosition}
              />
            </div>
          )}
          
          {/* Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div 
              className={cn(
                "rounded-md border border-zinc-900 bg-background px-6 py-4",
                "prose prose-invert prose-zinc prose-headings:font-semibold max-w-none",
                "prose-ul:pl-5 prose-ul:list-disc prose-ol:pl-5",
                viewMode === "preview" ? "w-full" : ""
              )}
              style={{ 
                height: viewMode === "split" ? "400px" : undefined,
                overflowY: "auto"
              }}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={MarkdownComponents}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    )
  }
)
TextEditor.displayName = "TextEditor"

export { TextEditor } 