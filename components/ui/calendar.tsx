"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  daysWithEntries?: Date[];
  onDeleteEntry?: (date: Date) => void;
  onDayContextMenu?: (e: React.MouseEvent, date: Date) => void;
  [key: string]: any; // Allow other props to be passed to DayPicker
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  daysWithEntries = [],
  onDeleteEntry,
  onDayContextMenu,
  ...props
}: CalendarProps) {
  // Helper function to compare dates (year, month, day only)
  const areDatesEqual = React.useCallback((date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  }, []);

  // Check if a date has an entry
  const hasEntry = React.useCallback((date: Date): boolean => {
    if (!date || !daysWithEntries?.length) return false;
    
    return daysWithEntries.some(entryDate => areDatesEqual(entryDate, date));
  }, [daysWithEntries, areDatesEqual]);

  // Check if a date is today
  const today = new Date();
  const isToday = React.useCallback((date: Date): boolean => {
    return areDatesEqual(date, today);
  }, [today, areDatesEqual]);

  // Handle date selection with normalized dates
  const handleDateSelect = React.useCallback((date: Date | undefined) => {
    if (!date || !props.onSelect) return;
    
    // Create a clean date object at noon to avoid timezone issues
    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    props.onSelect(cleanDate);
  }, [props.onSelect]);

  // Custom day component that leverages button states directly
  const CustomDay = React.useCallback((dayProps: any) => {
    // Extract all props we need, ignore the rest to avoid passing non-DOM props to DOM elements
    const { 
      date, 
      disabled, 
      selected, 
      outside, 
      activeModifiers, 
      displayMonth, 
      today: isRdpToday,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      style,
      tabIndex,
      ...otherProps 
    } = dayProps;
    
    if (!date) return <div role="gridcell" />;
    
    // Determine button variant and styling based on state
    let variant: "default" | "outline" | "secondary" | "ghost" = "ghost";
    let additionalClasses = "cursor-pointer hover:bg-stone-800/50 transition-colors";
    
    const hasJournalEntry = hasEntry(date);
    const isTodayDate = isToday(date);
    
    // Determine appropriate button styling based on state combinations
    if (selected) {
      variant = "default"; // Primary style for selected
    } else if (hasJournalEntry) {
      variant = "secondary"; // Secondary style for days with entries
      additionalClasses += " bg-stone-800 text-stone-100 hover:bg-stone-700";
    }
    
    if (isTodayDate && !selected) {
      additionalClasses += " border border-white";
      if (hasJournalEntry) {
        additionalClasses = "cursor-pointer border border-white bg-white text-black hover:bg-stone-200 transition-colors";
      }
    }
    
    if (outside) {
      additionalClasses += " text-muted-foreground opacity-50";
    }
    
    if (disabled) {
      additionalClasses += " opacity-50 cursor-not-allowed";
    }
    
    // Handle context menu
    const handleContextMenu = (e: React.MouseEvent) => {
      if (hasJournalEntry && onDayContextMenu) {
        e.preventDefault();
        e.stopPropagation();
        onDayContextMenu(e, date);
      }
    };

    // Enhanced click handler that directly calls onSelect
    const handleClick = (e: React.MouseEvent) => {
      if (disabled) return;
      
      console.log("Day clicked:", date);
      
      // Call the original onClick for DayPicker internal state
      if (onClick) {
        onClick(e);
      }
      
      // Also directly call onSelect to ensure navigation works
      if (props.onSelect && !e.defaultPrevented) {
        const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
        console.log("Directly calling onSelect with:", cleanDate);
        props.onSelect(cleanDate);
      }
    };
    
    return (
      <div
        className="w-full h-full flex items-center justify-center p-0"
        role="gridcell"
        onContextMenu={handleContextMenu}
      >
        <button
          type="button"
          disabled={disabled}
          className={cn(
            buttonVariants({ variant, size: "sm" }),
            "h-8 w-full p-0 font-normal",
            additionalClasses
          )}
          tabIndex={tabIndex}
          onClick={handleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocus={onFocus}
          style={style}
          aria-selected={selected}
        >
          {date.getDate()}
        </button>
      </div>
    );
  }, [hasEntry, isToday, onDayContextMenu, props.onSelect]);
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 flex flex-col", className)}
      onSelect={handleDateSelect}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2 flex-1",
        month: "flex flex-col gap-4 flex-1",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse flex-1",
        head_row: "flex w-full justify-between",
        head_cell:
          "text-muted-foreground rounded-md w-full max-w-[2.5rem] font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2 justify-between gap-0.5",
        cell: "relative p-0 text-center text-sm mx-0.5 flex-1 max-w-[2.5rem] focus-within:relative focus-within:z-20",
        day: "", // Empty to rely on our custom day component
        day_selected: "", // Empty to rely on our custom styling
        day_today: "", // Empty to rely on our custom styling
        day_outside: "", // Empty to rely on our custom styling
        day_disabled: "", // Empty to rely on our custom styling
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
        Day: CustomDay,
        ...props.components,
      }}
      {...props}
    />
  );
}

export { Calendar };