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

export default function Page() {
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
            
            <ModeToggle />
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
