"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface JournalEntry {
  date: string;
  displayDate: string;
}

export default function JournalIndexPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Function to load journal entries
    const loadEntries = async () => {
      try {
        const response = await fetch('/api/journal?list=true', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (!response.ok) throw new Error('Failed to load journal entries');
        const data = await response.json();
        
        // Process entries to add display dates
        const processedEntries = data.entries.map((entry: { date: string }) => ({
          date: entry.date,
          displayDate: new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }));
        
        setEntries(processedEntries);
      } catch (error) {
        console.error("Failed to load journal entries:", error);
        // Set some example entries for now
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        setEntries([
          {
            date: today.toISOString().split('T')[0],
            displayDate: today.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          },
          {
            date: yesterday.toISOString().split('T')[0],
            displayDate: yesterday.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();
  }, []);

  const handleEntryClick = (date: string) => {
    router.push(`/journal/${date}`);
  };

  // Create a new journal entry for today
  const handleCreateNew = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push(`/journal/${today}`);
  };

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
                  <BreadcrumbItem>
                    <BreadcrumbPage>Journal</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Journal Entries</h1>
            <button 
              onClick={handleCreateNew}
              className="bg-stone-900 hover:bg-stone-800 text-white py-2 px-4 rounded transition-colors"
            >
              New Entry
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p>Loading entries...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-stone-500 mb-4">No journal entries yet</p>
              <button 
                onClick={handleCreateNew}
                className="bg-stone-900 hover:bg-stone-800 text-white py-2 px-4 rounded transition-colors"
              >
                Create your first entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <Card 
                  key={entry.date}
                  className="hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer transition-colors"
                  onClick={() => handleEntryClick(entry.date)}
                >
                  <CardContent className="p-6">
                    <CardTitle className="mb-2">{entry.displayDate}</CardTitle>
                    <p className="text-stone-500 text-sm">Click to view or edit</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 