"use client";

import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash } from "lucide-react";
import { DayContentProps } from "react-day-picker";

interface JournalEntry {
  date: string;
}

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
    if (!date) return null;

    const isOutsideMonth =
      displayMonth && date.getMonth() !== displayMonth.getMonth();
    if (isOutsideMonth) {
      return (
        <div className="flex h-9 w-full items-center justify-center">
          {date.getDate()}
        </div>
      );
    }

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onDateDelete(date);
    };

    const handleOpenClick = () => {
      onDateSelect(date);
    };

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={`flex h-9 w-full items-center justify-center rounded-md ${
              hasEntry
                ? "bg-stone-800 text-stone-300 font-bold hover:bg-stone-700"
                : "hover:bg-stone-900"
            } cursor-pointer transition-colors ${isNavigating ? 'opacity-50' : ''}`}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              if (isNavigating) {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              onDateSelect(date);
            }}
          >
            {date.getDate()}
          </div>
        </ContextMenuTrigger>
        {hasEntry && (
          <ContextMenuContent className="min-w-40 bg-stone-950 border-stone-800 text-stone-300">
            <ContextMenuItem
              className="cursor-pointer flex items-center gap-2 focus:bg-stone-800 focus:text-stone-300"
              onClick={handleOpenClick}
            >
              Open Entry
            </ContextMenuItem>
            <ContextMenuItem
              className="cursor-pointer flex items-center gap-2 focus:bg-stone-800 focus:text-stone-300"
            >
              View Details
            </ContextMenuItem>
            <ContextMenuItem
              className="cursor-pointer flex items-center gap-2 focus:bg-stone-800 focus:text-stone-300"
            >
              Share Entry
            </ContextMenuItem>
            <ContextMenuItem
              className="text-red-500 cursor-pointer flex items-center gap-2 focus:bg-stone-800 focus:text-stone-300"
              onClick={handleDeleteClick}
            >
              <Trash size={16} />
              Delete Entry
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
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
          "Creating new journal entry for " +
            selectedDate.toLocaleDateString("en-US", {
              year: "numeric",
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

  const handleDelete = useCallback(
    async (selectedDate: Date) => {
      if (!selectedDate || isDeleting) return;

      const formattedDate = selectedDate.toISOString().split("T")[0];

      try {
        setIsDeleting(true);
        const response = await fetch(
          `/api/journal?file=vault/journal/daily/${formattedDate}.md`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete (${response.status})`);
        }

        const result = await response.json();
        
        if (result.success) {
          toast.success("Journal entry deleted");
          setEntries((prev) =>
            prev.filter((entry) => entry.date !== formattedDate)
          );
        } else {
          toast.error(result.error || "Failed to delete journal entry");
        }
      } catch (error) {
        console.error("Failed to delete journal entry:", error);
        toast.error("Failed to delete journal entry");
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