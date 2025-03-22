import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir, unlink, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

function getFilePath(fileName: string) {
  return join(process.cwd(), fileName);
}

async function ensureDirectoryExists(filePath: string) {
  const directory = filePath.substring(0, filePath.lastIndexOf("/"));
  if (!existsSync(directory)) {
    await mkdir(directory, { recursive: true });
  }
}

// Define proper types for the cache data
interface CacheData {
  entries?: Array<{ name: string }>;
  content?: string;
}

interface CacheItem {
  data: CacheData;
  timestamp: number;
}

// Use a different approach to cache: store the actual data instead of Response objects
const responseCache = new Map<string, CacheItem>();
const CACHE_TTL = 5000; // 5 seconds cache TTL

// GET: Load memory content or list entries
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");
  const isList = searchParams.get("list") === "true";
  
  // Generate a cache key based on the request parameters
  const cacheKey = isList ? "list" : fileName || "";
  
  // Check if we have a valid cached response
  const now = Date.now();
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && (now - cachedItem.timestamp) < CACHE_TTL) {
    return NextResponse.json(cachedItem.data);
  }

  let responseData;

  if (isList) {
    // Handle listing memory entries
    try {
      const dirPath = getFilePath("vault/memories");
      
      // Create directory if it doesn't exist
      await ensureDirectoryExists(dirPath);
      
      // Check if directory exists before reading
      if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
        responseData = { entries: [] };
      } else {
        const files = await readdir(dirPath);
        const entries = files
          .filter((file) => file.endsWith(".mdx"))
          .map((file) => ({
            name: file.replace(".mdx", ""),
          }));
        responseData = { entries };
      }
    } catch (error) {
      console.error("Error listing memory entries:", error);
      responseData = { entries: [] };
    }
  } else if (fileName) {
    try {
      const filePath = getFilePath(fileName);
      await ensureDirectoryExists(filePath);

      let content = "";
      try {
        content = await readFile(filePath, "utf-8");
      } catch {
        await writeFile(filePath, "", "utf-8");
      }
      responseData = { content };
    } catch (error) {
      console.error("Error reading memory file:", error);
      return NextResponse.json(
        { error: "Failed to read memory file" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  // Store in cache
  responseCache.set(cacheKey, {
    data: responseData,
    timestamp: now
  });
  
  // Return JSON response
  const response = NextResponse.json(responseData);
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  
  return response;
}

// POST: Save memory content
export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json();
    if (!fileName) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    const filePath = getFilePath(fileName);
    await ensureDirectoryExists(filePath);
    await writeFile(filePath, content, "utf-8");

    // Invalidate cache for this file
    const cacheKey = fileName;
    responseCache.delete(cacheKey);
    
    // Also invalidate the list cache since we might have created a new file
    responseCache.delete("list");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving memory file:", error);
    return NextResponse.json(
      { error: "Failed to save memory file" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a memory entry
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("file");

  if (!fileName) {
    return NextResponse.json(
      { error: "File path is required" },
      { status: 400 }
    );
  }

  try {
    const filePath = getFilePath(fileName);
    if (existsSync(filePath)) {
      await unlink(filePath);
      
      // Invalidate cache for this file
      const cacheKey = fileName;
      responseCache.delete(cacheKey);
      
      // Also invalidate the list cache
      responseCache.delete("list");
      
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting memory file:", error);
    return NextResponse.json(
      { error: "Failed to delete memory file" },
      { status: 500 }
    );
  }
} 