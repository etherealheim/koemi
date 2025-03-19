"use server";

import { writeFile, readFile } from "fs/promises";
import { join } from "path";

function getFilePath(fileName: string) {
  // Ensure the filename has .md extension
  const normalizedFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
  return join(process.cwd(), normalizedFileName);
}

export async function saveContent(content: string, fileName: string) {
  try {
    const filePath = getFilePath(fileName);
    await writeFile(filePath, content, "utf-8");
  } catch (error) {
    console.error("Failed to save:", error);
  }
}

export async function loadContent(fileName: string) {
  try {
    const filePath = getFilePath(fileName);
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    // If file doesn't exist, create it with empty content
    const filePath = getFilePath(fileName);
    await writeFile(filePath, "", "utf-8");
    return "";
  }
} 