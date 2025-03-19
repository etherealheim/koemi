import * as React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Heading, List, Quote } from "lucide-react"
import { motion } from "framer-motion"

export interface TextComponentProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fileName?: string;
}

const TextComponent = React.forwardRef<HTMLTextAreaElement, TextComponentProps>(
  ({ className, fileName = "example.md", ...props }, ref) => {
    const [showDropdown, setShowDropdown] = React.useState(false)
    const [displayText, setDisplayText] = React.useState("")
    const [isAnimating, setIsAnimating] = React.useState(false)
    const [hasAnimated, setHasAnimated] = React.useState(false)
    const [hasUserInteracted, setHasUserInteracted] = React.useState(false)
    const [animationHeight, setAnimationHeight] = React.useState<number | undefined>(undefined)
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const hiddenTextareaRef = React.useRef<HTMLTextAreaElement>(null)
    const initialValueRef = React.useRef<string | null>(null)

    // Pre-calculate height before animation
    React.useEffect(() => {
      if (props.value && typeof props.value === "string" && !hasAnimated && !isAnimating) {
        if (hiddenTextareaRef.current) {
          hiddenTextareaRef.current.value = props.value;
          setAnimationHeight(hiddenTextareaRef.current.scrollHeight);
        }
      }
    }, [props.value, hasAnimated, isAnimating]);

    // Text animation (only on initial load)
    React.useEffect(() => {
      if (
        props.value &&
        typeof props.value === "string" &&
        props.value.length > 0 &&
        !hasAnimated &&
        !isAnimating &&
        !hasUserInteracted
      ) {
        initialValueRef.current = props.value;
        setIsAnimating(true)
        setDisplayText("")

        const text = props.value;
        let currentLength = 0;
        // Increase animation speed by using a shorter interval (5ms instead of 10ms)
        // and increasing the characters added per interval
        const charsPerStep = Math.max(1, Math.floor(text.length / 100));
        
        const animationInterval = setInterval(() => {
          // Check if props.value has changed during animation
          if (props.value !== initialValueRef.current) {
            clearInterval(animationInterval)
            setDisplayText((props.value as string) ?? "") // Fallback to empty string if undefined
            setIsAnimating(false)
            setHasAnimated(true)
            return
          }

          if (currentLength < text.length) {
            // Add multiple characters per step for faster animation
            currentLength = Math.min(text.length, currentLength + charsPerStep);
            setDisplayText(text.substring(0, currentLength))
          } else {
            clearInterval(animationInterval)
            setDisplayText(text)
            setTimeout(() => {
              setIsAnimating(false)
              setHasAnimated(true)
            }, 50) // Reduced from 100ms to 50ms
          }
        }, 5) // Reduced from 10ms to 5ms

        return () => clearInterval(animationInterval)
      }
    }, [props.value, hasAnimated, hasUserInteracted])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true)
        setIsAnimating(false)
        setHasAnimated(true)
      }

      if (e.key === "/") {
        setShowDropdown(true)
        e.preventDefault()

        const textarea = textareaRef.current
        if (textarea) {
          const cursorPosition = textarea.selectionStart
          const text = textarea.value.substring(0, cursorPosition)
          const newValue = text + "/" + textarea.value.substring(cursorPosition)
          if (props.onChange) {
            const event = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>
            props.onChange(event)
          }
        }
      }
    }

    const handleOptionSelect = (option: string) => {
      const textarea = textareaRef.current
      if (textarea) {
        const cursorPosition = textarea.selectionStart
        const textBeforeSlash = textarea.value.substring(0, cursorPosition - 1) // -1 to remove the slash
        const textAfterCursor = textarea.value.substring(cursorPosition)
        const newText = textBeforeSlash + option + textAfterCursor
        if (props.onChange) {
          const event = { target: { value: newText } } as React.ChangeEvent<HTMLTextAreaElement>
          props.onChange(event)
        }
        setTimeout(() => {
          if (textarea) {
            const newCursorPosition = textBeforeSlash.length + option.length
            textarea.focus()
            textarea.setSelectionRange(newCursorPosition, newCursorPosition)
          }
        }, 0)
      }
      setShowDropdown(false)
    }

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
          setShowDropdown(false)
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
      <div className="relative">
        <textarea
          ref={hiddenTextareaRef}
          className={cn(
            "absolute opacity-0 pointer-events-none",
            "w-full rounded-md border bg-background px-6 py-4 text-sm font-['Geist Mono Medium']",
            className
          )}
          style={{ visibility: "hidden", position: "absolute", height: "auto" }}
          defaultValue={props.value as string | undefined}
          readOnly
        />

        {isAnimating && !hasUserInteracted ? (
          <motion.div
            className={cn(
              "w-full rounded-md border bg-background px-6 py-4 text-sm font-['Geist Mono Medium']",
              "text-zinc-100",
              className
            )}
            style={{
              minHeight: className?.includes("min-h-") ? "600px" : "80px",
              height: animationHeight ? `${animationHeight}px` : "auto",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              lineHeight: "1.5",
              overflow: "auto",
              resize: "vertical",
              boxSizing: "border-box",
              padding: "16px 24px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {displayText}
          </motion.div>
        ) : (
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
        )}
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger asChild>
            <div className="h-0 w-0 opacity-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-zinc-900 border-zinc-800"
            style={{
              position: "relative",
              left: "0",
              top: "0",
            }}
          >
            <DropdownMenuItem
              className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 flex items-center gap-2"
              onClick={() => handleOptionSelect("# Heading ")}
            >
              <Heading className="h-4 w-4" />
              Heading
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 flex items-center gap-2"
              onClick={() => handleOptionSelect("- List item ")}
            >
              <List className="h-4 w-4" />
              List
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 flex items-center gap-2"
              onClick={() => handleOptionSelect("> Quote ")}
            >
              <Quote className="h-4 w-4" />
              Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }
)
TextComponent.displayName = "TextComponent"

export { TextComponent }