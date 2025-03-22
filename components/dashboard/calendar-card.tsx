"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Portal from "@radix-ui/react-portal";
import { Trash, Eye } from "lucide-react";

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

// Helper function to format a date consistently
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Context menu component
const ContextMenu = ({ open, x, y, date, onSelect, onDelete, onClose }: ContextMenuProps) => {
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = () => onClose();
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
};

export default function CalendarCard() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToastActive, setIsToastActive] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigationInProgress = useRef(false);
  const navigationTimer = useRef<NodeJS.Timeout | null>(null);
  const [contextMenu, setContextMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    date: new Date()
  });

  // Load entries on component mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/journal?list=true", {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
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

  // Add entry to state
  const addEntry = useCallback((formattedDate: string) => {
    setEntries(prev => {
      // Don't add if already exists
      if (prev.some(entry => entry.date === formattedDate)) {
        return prev;
      }
      return [...prev, { date: formattedDate }];
    });
  }, []);

  // Handle selecting a date
  const handleSelect = useCallback(
    (selectedDate: Date) => {
      if (!selectedDate) return;
      
      // Prevent rapid repeated clicks
      if (navigationInProgress.current) {
        console.log("Navigation already in progress, ignoring click");
        return;
      }
      
      // Format the date string consistently
      const formattedDate = formatDateString(selectedDate);
      console.log(`Selecting date: ${formattedDate}`);
      
      // Check if entry exists
      const entryExists = entries.some(entry => entry.date === formattedDate);
      
      // Set navigation flag to prevent duplicate calls
      navigationInProgress.current = true;
      
      // Clear any existing navigation timer
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
        navigationTimer.current = null;
      }
      
      // Add entry to state immediately for visual feedback
      if (!entryExists) {
        addEntry(formattedDate);
        console.log("New entry added to state:", formattedDate);
      }
      
      // Update the selected date immediately for visual feedback
      setDate(selectedDate);
      
      // Navigate immediately in all cases
      window.location.href = `/journal/${formattedDate}`;
    },
    [entries, addEntry]
  );

  // Handle deleting a journal entry
  const handleDelete = useCallback(
    async (selectedDate: Date) => {
      if (!selectedDate || isDeleting) return;
      
      // Format date consistently for deletion
      const formattedDate = formatDateString(selectedDate);
      console.log(`Deleting entry: ${formattedDate}`);

      try {
        setIsDeleting(true);
        const response = await fetch(
          `/api/journal?file=vault/journal/daily/${formattedDate}.mdx`,
          { 
            method: "DELETE",
            headers: { 'Cache-Control': 'no-cache' }
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        
        if (result.success) {
          toast.success("Journal successfully deleted");
          setEntries(prev => prev.filter(entry => entry.date !== formattedDate));
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

  // Convert entries to Date objects for the calendar
  const entriesAsDates = useCallback(() => {
    return entries.map(entry => {
      const [year, month, day] = entry.date.split('-').map(Number);
      return new Date(year, month - 1, day, 12); // Use noon to avoid timezone issues
    });
  }, [entries]);

  // Handle right-click on a day
  const handleDayContextMenu = useCallback((e: React.MouseEvent, day: Date) => {
    e.preventDefault();
    if (!day) return;
    
    setContextMenu({
      open: true,
      x: e.clientX,
      y: e.clientY,
      date: day
    });
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <div className="h-full flex flex-col" onContextMenu={e => e.preventDefault()}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelect}
        className="w-full bg-stone-950 text-stone-300 border-stone-800 rounded-md flex-1"
        disabled={isLoading}
        daysWithEntries={entriesAsDates()}
        onDayContextMenu={handleDayContextMenu}
      />

      <ContextMenu
        open={contextMenu.open}
        x={contextMenu.x}
        y={contextMenu.y}
        date={contextMenu.date}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onClose={closeContextMenu}
      />
    </div>
  );
}