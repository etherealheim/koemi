"use client";

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/theme-toggle"
import { Memories } from "@/components/dashboard/memories"
import { createSwapy } from 'swapy'
import { useEffect } from 'react'
import { useCommandMenu } from "@/components/command-menu"

export default function Page() {
  const { setOpen: setCommandMenuOpen } = useCommandMenu();

  useEffect(() => {
    const container = document.querySelector('.container') as HTMLElement
    if (container) {
      const swapy = createSwapy(container, {
        animation: 'dynamic'
      })
    }
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
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
          
          <div className="container">
          <div className="slot top" data-swapy-slot="a">
            <div className="item item-memories" data-swapy-item="a">
              <Memories className="w-full h-72" />
            </div>
          </div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3 pt-4">
              <div className="slot" data-swapy-slot="b">
                <div className="item item-card1" data-swapy-item="b">
                  <div className="h-72 rounded-xl bg-muted" />
                </div>
              </div>
              <div className="slot" data-swapy-slot="c">
                <div className="item item-card2" data-swapy-item="c">
                  <div className="h-72 rounded-xl bg-muted" />
                </div>
              </div>
              <div className="slot" data-swapy-slot="d">
                <div className="item item-card3" data-swapy-item="d">
                  <div className="h-72 rounded-xl bg-muted" />
                </div>
              </div>
            </div>
            <div className="slot pt-4" data-swapy-slot="e">
              <div className="item item-main" data-swapy-item="e">
              <div className="h-72 rounded-xl bg-muted" />
            </div>
          </div>
          </div>
          
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
