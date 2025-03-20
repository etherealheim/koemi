"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, Eye } from "lucide-react";
import { DayContentProps } from "react-day-picker";
import * as Portal from "@radix-ui/react-portal";

interface JournalEntry {
  date: string;
}

interface ContextMenuProps {
  open: boolean;
  x: number;
  y: number;
  date: Date;
  onSelect: (date: Date) => void;
  onDelete: (date: Date) => void;
  onClose: () => void;
}

// Simplified context menu using Portal
const SimpleContextMenu = memo(({ open, x, y, date, onSelect, onDelete, onClose }: ContextMenuProps) => {
  // Always set up event listeners with useEffect to avoid hooks conditional calls
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal.Root>
      <div 
        className="fixed z-50"
        style={{ top: `${y}px`, left: `${x}px` }}
        onClick={e => e.stopPropagation()}
        onMouseLeave={onClose}
      >
        <div className="min-w-32 bg-popover border border-border rounded-md shadow-md p-1 text-sm text-popover-foreground">
          <div 
            className="px-2 py-1.5 cursor-pointer rounded-sm flex items-center hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onSelect(date);
              onClose();
            }}
          >
            <Eye size={16} className="mr-2" />
            View
          </div>
          <div 
            className="px-2 py-1.5 cursor-pointer rounded-sm flex items-center hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(date);
              onClose();
            }}
          >
            <Trash size={16} className="mr-2" />
            Delete
          </div>
        </div>
      </div>
    </Portal.Root>
  );
});

SimpleContextMenu.displayName = "SimpleContextMenu";

const CustomDay = memo(
  ({
    date,
    displayMonth,
    hasEntry,
    onDateSelect,
    onDateDelete,
    isNavigating,
  }: DayContentProps & {
    hasEntry: boolean;
    onDateSelect: (date: Date) => void;
    onDateDelete: (date: Date) => void;
    isNavigating: boolean;
  }) => {
    // Move all hooks to the top level
    const [contextMenuState, setContextMenuState] = useState({
      open: false,
      x: 0,
      y: 0
    });
    
    // Memoize these functions to avoid recreation on each render
    const closeContextMenu = useCallback(() => {
      setContextMenuState({
        open: false,
        x: 0,
        y: 0
      });
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenuState({
        open: true,
        x: e.clientX,
        y: e.clientY
      });
    }, []);
    
    const selectDay = useCallback((e: React.MouseEvent) => {
      if (!date || isNavigating) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      onDateSelect(date);
    }, [date, isNavigating, onDateSelect]);
    
    // Early return for invalid dates
    if (!date || !(date instanceof Date)) return null;

    // Handle outside month dates
    const isOutsideMonth =
      displayMonth && date.getMonth() !== displayMonth.getMonth();
    if (isOutsideMonth) {
      return (
        <div className="flex h-9 w-full items-center justify-center">
          {date.getDate()}
        </div>
      );
    }

    // Basic day rendering for dates without entries
    if (!hasEntry) {
      return (
        <div
          className="flex h-9 w-full items-center justify-center rounded-md hover:bg-stone-900 cursor-pointer transition-colors"
          onClick={selectDay}
        >
          {date.getDate()}
        </div>
      );
    }

    // Enhanced day rendering for dates with entries (with context menu)
    return (
      <>
        <div
          className="flex h-9 w-full items-center justify-center rounded-md bg-stone-800 text-stone-300 font-bold hover:bg-stone-700 cursor-pointer transition-colors"
          onClick={selectDay}
          onContextMenu={handleContextMenu}
        >
          {date.getDate()}
        </div>
        
        <SimpleContextMenu
          open={contextMenuState.open}
          x={contextMenuState.x}
          y={contextMenuState.y}
          date={date}
          onSelect={onDateSelect}
          onDelete={onDateDelete}
          onClose={closeContextMenu}
        />
      </>
    );
  }
);

CustomDay.displayName = "CustomDay";

export default function CalendarCard() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToastActive, setIsToastActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecentlyCreated, setIsRecentlyCreated] = useState<string | null>(null);
  const navigationInProgress = useRef(false);
  const navigationTimer = useRef<NodeJS.Timeout | null>(null);

  // Load entries on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/journal?list=true", {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.error("Server returned error:", response.status);
          setEntries([]);
          return;
        }
        
        const data = await response.json();
        
        if (Array.isArray(data.entries)) {
          console.log("Loaded entries:", data.entries.length);
          setEntries(data.entries);
        } else {
          console.error("Invalid data format:", data);
          setEntries([]);
        }
      } catch (error) {
        console.error("Failed to load journal entries:", error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Handle selecting a date
  const handleSelect = useCallback(
    (selectedDate: Date) => {
      if (!selectedDate || navigationInProgress.current) return;

      const formattedDate = selectedDate.toISOString().split("T")[0];
      
      // Check if entry exists or was recently created
      const entryExists = entries.some(entry => entry.date === formattedDate) || 
                         isRecentlyCreated === formattedDate;

      // Set navigation flag to prevent duplicate calls
      navigationInProgress.current = true;
      
      // Clear any existing navigation timer
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }

      // Navigate to the journal entry with a slight delay to debounce multiple clicks
      navigationTimer.current = setTimeout(() => {
        router.push(`/journal/${formattedDate}`);
        setDate(selectedDate);
        navigationInProgress.current = false;
      }, 100);

      // Only show toast for new entries and prevent duplicate toasts
      if (!entryExists && !isToastActive) {
        setIsToastActive(true);
        setIsRecentlyCreated(formattedDate);
        
        // Add to entries so it shows as highlighted immediately
        setEntries(prev => [...prev, { date: formattedDate }]);
        
        toast.success(
          "Started a new journal for " +
            selectedDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })
        );
        
        // Reset toast state after delay
        setTimeout(() => {
          setIsToastActive(false);
        }, 2000);
      }
    },
    [entries, router, isToastActive, isRecentlyCreated]
  );

  // Handle deleting a journal entry
  const handleDelete = useCallback(
    async (selectedDate: Date) => {
      if (!selectedDate || isDeleting) return;

      const formattedDate = selectedDate.toISOString().split("T")[0];
      console.log("Attempting to delete entry:", formattedDate);

      try {
        setIsDeleting(true);
        const response = await fetch(
          `/api/journal?file=vault/journal/daily/${formattedDate}.md`,
          { 
            method: "DELETE",
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );

        console.log("Delete response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response body:", errorText);
          throw new Error(`Failed to delete (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log("Delete result:", result);
        
        if (result.success) {
          toast.success("Journal successfully deleted");
          setEntries((prev) =>
            prev.filter((entry) => entry.date !== formattedDate)
          );
        } else {
          toast.error(result.error || "Couldn't delete this journal");
        }
      } catch (error) {
        console.error("Failed to delete journal entry:", error);
        toast.error(error instanceof Error ? error.message : "Couldn't delete this journal");
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting]
  );

  const isDayWithEntry = useCallback(
    (day: Date): boolean => {
      if (!day) return false;
      const formattedDay = day.toISOString().split("T")[0];
      return entries.some((entry) => entry.date === formattedDay);
    },
    [entries]
  );

  const renderDay = useCallback(
    (dayProps: DayContentProps) => {
      const { date: dayDate } = dayProps;
      if (!dayDate) return null;

      return (
        <CustomDay
          {...dayProps}
          hasEntry={isDayWithEntry(dayDate)}
          onDateSelect={handleSelect}
          onDateDelete={handleDelete}
          isNavigating={navigationInProgress.current}
        />
      );
    },
    [isDayWithEntry, handleSelect, handleDelete, navigationInProgress]
  );

  return (
    <div className="h-full flex flex-col">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => newDate && handleSelect(newDate)}
        className="w-full bg-stone-950 text-stone-300 border-stone-800 rounded-md flex-1"
        disabled={isLoading || navigationInProgress.current}
        components={{ DayContent: renderDay }}
      />
    </div>
  );
}