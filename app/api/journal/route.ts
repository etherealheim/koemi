// app/api/journal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir, unlink, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Utility to get file path
function getFilePath(fileName: string): string {
  return join(process.cwd(), fileName);
}

// Ensure directory exists before file operations
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const directory = filePath.substring(0, filePath.lastIndexOf("/"));
  if (!existsSync(directory)) {
    await mkdir(directory, { recursive: true });
  }
  return; // Explicit return for Promise<void>
}

// Define types for cache and response data
interface JournalEntry {
  date: string;
}

interface JournalResponse {
  content?: string;
  entries?: JournalEntry[];
  error?: string;
}

interface CacheItem {
  data: JournalResponse;
  timestamp: number;
}

// Simple in-memory cache
const CACHE_TTL = 5000; // 5 seconds TTL
const responseCache = new Map<string, CacheItem>();

// GET: Load journal content or list entries
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");
  const isList = searchParams.get("list") === "true";
  const cacheKey = isList ? "list" : fileName || "";

  // Check cache
  const now = Date.now();
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedItem.data);
  }

  let responseData: JournalResponse;

  if (isList) {
    // List journal entries
    try {
      const dirPath = getFilePath("vault/journal/daily");
      await ensureDirectoryExists(dirPath);

      const files = await readdir(dirPath);
      const entries = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({ date: file.replace(".md", "") }));
      responseData = { entries };
    } catch (error) {
      console.error("Error listing journal entries:", error);
      responseData = { entries: [] };
    }
  } else if (fileName) {
    // Load specific journal entry
    try {
      const filePath = getFilePath(fileName);
      await ensureDirectoryExists(filePath);

      let content: string;
      try {
        content = await readFile(filePath, "utf-8");
      } catch {
        // If file doesn't exist, create it with empty content
        content = "";
        await writeFile(filePath, content, "utf-8");
      }
      responseData = { content };
    } catch (error) {
      console.error("Error reading journal file:", error);
      return NextResponse.json({ error: "Failed to read journal file" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Invalid request: file or list parameter required" }, { status: 400 });
  }

  // Cache the response
  responseCache.set(cacheKey, { data: responseData, timestamp: now });

  const response = NextResponse.json(responseData);
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
}

// POST: Save journal content
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { content, fileName } = body as { content?: string; fileName?: string };

    if (!fileName) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
    }

    const filePath = getFilePath(fileName);
    await ensureDirectoryExists(filePath);
    await writeFile(filePath, content, "utf-8");

    // Invalidate cache
    responseCache.delete(fileName);
    responseCache.delete("list"); // Invalidate list cache as a new file might be added

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving journal file:", error);
    return NextResponse.json({ error: "Failed to save journal file" }, { status: 500 });
  }
}

// DELETE: Remove a journal entry
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  if (!fileName) {
    return NextResponse.json({ error: "File path is required" }, { status: 400 });
  }

  try {
    const filePath = getFilePath(fileName);
    if (existsSync(filePath)) {
      await unlink(filePath);

      // Invalidate cache
      responseCache.delete(fileName);
      responseCache.delete("list");

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting journal file:", error);
    return NextResponse.json({ error: "Failed to delete journal file" }, { status: 500 });
  }
}

// Optional: Export config for Next.js API route
export const config = {
  api: {
    bodyParser: true,
  },
};