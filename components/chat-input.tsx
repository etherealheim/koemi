import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (message: string) => void;
  modelName?: string;
  onHeightChange?: (height: number) => void;
}

export function ChatInput({
  onSend,
  modelName = "Assistant",
  onHeightChange,
}: ChatInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Report height changes to parent
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current && onHeightChange) {
        const height = containerRef.current.offsetHeight;
        onHeightChange(height);
      }
    };

    updateHeight(); // Initial height
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isExpanded, onHeightChange]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const startCollapseTimer = () => {
    resetCollapseTimer();
    collapseTimerRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (handleRef.current) {
        const rect = handleRef.current.getBoundingClientRect();
        const isNearHandle =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top - 50 &&
          e.clientY <= rect.bottom + 50;

        if (isNearHandle) {
          resetCollapseTimer();
          if (!isHovering) {
            setIsHovering(true);
          }
        } else if (isHovering) {
          startCollapseTimer();
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      resetCollapseTimer();
    };
  }, [isHovering]);

  const handleInputFocus = () => {
    resetCollapseTimer();
  };

  const handleInputBlur = () => {
    startCollapseTimer();
  };

  useEffect(() => {
    if (isHovering) {
      controls.start("expanded");
      setIsExpanded(true);
    } else {
      controls.start("collapsed").then(() => setIsExpanded(false));
    }
  }, [isHovering, controls]);

  useEffect(() => {
    return () => {
      resetCollapseTimer();
    };
  }, []);

  return (
    <div className="grid grid-cols-12 pointer-events-none" ref={containerRef}>
      <div className="col-span-12 bottom-2">
        <motion.div
          className="relative w-full pointer-events-auto"
          initial="collapsed"
          animate={controls}
          variants={{
            expanded: { height: "auto" }, // Dynamic height when expanded
            collapsed: { height: 12 }, // Only the handle height (h-12 = 48px, but we adjust to just the handle)
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="absolute bottom-0 left-0 right-0 w-full">
            <AnimatePresence mode="wait">
              {!isExpanded && (
                <motion.div
                  ref={handleRef}
                  className="w-full h-12 flex items-center justify-center cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsHovering(true)}
                  onMouseEnter={() => setIsHandleHovered(true)}
                  onMouseLeave={() => setIsHandleHovered(false)}
                >
                  <motion.div
                    className="w-36 h-1.5 rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                    animate={{ opacity: isHandleHovered ? 0.8 : 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.div
                  className="mt-2 px-6 py-4 bg-background text-zinc-100 rounded-md border border-zinc-900 w-full shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={resetCollapseTimer}
                  onMouseLeave={startCollapseTimer}
                >
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="bg-background/50">
                      {modelName}
                    </Badge>
                    <Badge variant="outline" className="bg-background/50">
                      {currentDate}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Type your message..."
                      className="flex-1 font-['Geist Mono Medium'] text-sm placeholder:text-zinc-600"
                      autoFocus
                    />
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="h-8 w-8"
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}