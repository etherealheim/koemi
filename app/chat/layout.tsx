"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Memoize the AppSidebar to prevent re-renders
const MemoizedAppSidebar = React.memo(() => <AppSidebar />);
MemoizedAppSidebar.displayName = 'MemoizedAppSidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarTrigger className="absolute left-2 top-2 z-50 md:hidden" />
      <MemoizedAppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
} 