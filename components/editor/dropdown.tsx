"use client";

import * as React from "react";
import { Heading, List, Quote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptionSelect: (option: string) => void;
}

export function EditorDropdown({ open, onOpenChange, onOptionSelect }: EditorDropdownProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
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
          onClick={() => onOptionSelect("# Heading ")}
        >
          <Heading className="h-4 w-4" />
          Heading
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 flex items-center gap-2"
          onClick={() => onOptionSelect("- List item ")}
        >
          <List className="h-4 w-4" />
          List
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-zinc-100 focus:bg-zinc-800 focus:text-zinc-100 flex items-center gap-2"
          onClick={() => onOptionSelect("> Quote ")}
        >
          <Quote className="h-4 w-4" />
          Quote
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 