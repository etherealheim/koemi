"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { TextComponent } from "@/components/text-component";
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
import { useParams } from "next/navigation";

// Memoize the AppSidebar to prevent re-renders on navigation
const MemoizedAppSidebar = React.memo(() => <AppSidebar />);

export default function MemoryPage() {
  const params = useParams();
  const name = params.name as string;
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileName = `vault/memories/${name}.md`;

  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        const response = await fetch(`/api/memory?file=${fileName}`);
        if (!response.ok) throw new Error('Failed to load memory');
        const data = await response.json();
        setContent(data.content);
      } catch (error) {
        console.error("Failed to load content:", error);
        setContent("");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialContent();
  }, [fileName]);

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent, fileName }),
      });
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  // Format name for display (e.g., "quantum-entanglement" to "Quantum Entanglement")
  const displayName = name
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
                    Memories
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{displayName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {isLoading || content === null ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <TextComponent
              fileName={fileName}
              placeholder="Start writing in your memory..."
              className="min-h-[calc(100vh-6rem)] font-mono bg-background border-zinc-900 text-foreground resize-none outline-none focus:outline-none focus:ring-0 focus:border-zinc-800 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4"
              value={content}
              onChange={handleChange}
              spellCheck={false}
              disabled={isLoading}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 