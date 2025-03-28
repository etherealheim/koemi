"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { TextEditor } from "@/components/editor/TextEditor";
import { AppSidebar } from "@/components/app-sidebar"
import { ChatInput } from "@/components/chat-input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
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
MemoizedAppSidebar.displayName = 'MemoizedAppSidebar';

export default function MemoryPage() {
  const params = useParams();
  const name = params?.name as string || "";
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileName = `vault/memories/${name}.mdx`;
  const [isEditorPushed, setIsEditorPushed] = useState(false);

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

    if (name) {
      loadInitialContent();
    } else {
      setIsLoading(false);
      setContent("");
    }
  }, [fileName, name]);

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

  const handleSendMessage = (message: string) => {
    // Here you would implement your logic to process the chat message
    console.log(`Message sent: ${message}`);
    // For example, you could append the message to the current content
    if (content !== null) {
      const newContent = `${content}\n\n**Chat:** ${message}`;
      setContent(newContent);
      // Save the new content
      fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent, fileName }),
      }).catch(error => {
        console.error("Failed to save content:", error);
      });
    }
  };

  // Format name for display (e.g., "quantum-entanglement" to "Quantum Entanglement")
  const displayName = name
    ? name.split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Memory";

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
                    <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 relative">
          {isLoading || content === null ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          ) : (
            <>
              <TextEditor
                fileName={fileName}
                placeholder="Start writing in your journal..."
                className={`font-mono bg-background border-zinc-900 text-foreground resize-none outline-none focus:outline-none focus:ring-0 focus:border-zinc-800 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 h-[calc(100vh-14rem)] pb-16`}
                value={content}
                onChange={handleChange}
                spellCheck={false}
                disabled={isLoading}
              />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 