"use client";

import { useState, useEffect } from "react";
import { TextComponent } from "@/components/text-component";
import { saveContent, loadContent } from "./actions";

export default function EditorPage() {
  const [content, setContent] = useState<string | null>(null); // Start with null to delay rendering
  const [isLoading, setIsLoading] = useState(true);
  const fileName = "journal.md";

  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        const initialContent = await loadContent(fileName);
        setContent(initialContent);
      } catch (error) {
        console.error("Failed to load content:", error);
        setContent(""); // Fallback to empty string on error
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
      await saveContent(newContent, fileName);
    } catch (error) {
      console.error("Failed to save content:", error);
      // Optionally show a user-facing error message
    }
  };

  if (isLoading || content === null) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="container mx-auto grid grid-cols-12 gap-6">
          <div className="col-span-12 col-start-2">
            <h1 className="text-2xl font-bold mb-4">Editor</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto grid grid-cols-12 gap-6">
        <div className="col-span-12 col-start-2">
          <h1 className="text-2xl font-bold mb-4">Editor</h1>
        </div>
        
        <div className="col-span-10 col-start-2">
          <TextComponent
            fileName={fileName}
            placeholder="Start typing"
            className="min-h-[600px] font-mono bg-zinc-950 border-zinc-900 text-zinc-100 resize-none outline-none focus:outline-none focus:ring-0 focus:border-zinc-900 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={content}
            onChange={handleChange}
            spellCheck={false}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}