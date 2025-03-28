"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/theme-toggle"
import { Memories } from "@/components/dashboard/card-memories"
import { useCommandMenu } from "@/components/command-menu"
import CardCurrentDay from "@/components/dashboard/card-current-day"
import CardCalendar from "@/components/dashboard/card-calendar"
import CardNewChat from "@/components/dashboard/card-new-chat";

// Memoize the AppSidebar component to prevent unnecessary re-renders
const MemoizedAppSidebar = React.memo(() => <AppSidebar />);
MemoizedAppSidebar.displayName = 'MemoizedAppSidebar';

export default function Page() {
  const { setOpen: setCommandMenuOpen } = useCommandMenu();

  return (
    <SidebarProvider>
      <MemoizedAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    Dashboard
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommandMenuOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <span className="hidden md:inline">Search</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
              <ModeToggle />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Memories className="w-full h-80" />
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <CardCurrentDay />
            <CardCalendar />
            <CardNewChat />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
