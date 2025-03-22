/**
 * API endpoint for searching wiki pages in the vault directory
 * - Searches through markdown files in /vault directory
 * - Returns matching pages based on title search
 * - Supports partial matches and exact matches
 * - Returns up to 10 results sorted by relevance:
 *   1. Exact title matches
 *   2. Titles starting with search term
 *   3. Titles containing search term
 * - For non-exact matches, suggests creating a new page
 * - Each result includes: id, title, path and exists flag
 */

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

interface WikiPage {
  id: string;
  title: string;
  path: string;
  exists: boolean;
}

async function getAllFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { q } = req.query;
    const searchTerm = (q as string || '').toLowerCase();

    if (!searchTerm) {
      return res.status(200).json([]);
    }

    // Base path for vault content
    const vaultBasePath = path.join(process.cwd(), 'vault');
    
    // Get all files in the vault directory
    const allFiles = await getAllFiles(vaultBasePath);
    
    // Filter markdown files and create page objects
    const mdFiles = allFiles.filter(file => file.endsWith('.md'));
    
    const pages: WikiPage[] = mdFiles.map(filePath => {
      // Get relative path from vault dir
      const relativePath = path.relative(vaultBasePath, filePath);
      // Remove .md extension
      const pathWithoutExt = relativePath.replace(/\.md$/, '');
      // Use the filename without extension as title
      const title = path.basename(pathWithoutExt);
      
      return {
        id: pathWithoutExt,
        title,
        path: `/vault/${pathWithoutExt}`,
        exists: true
      };
    });
    
    // Filter pages that match the search term
    const filteredPages = pages.filter(page => 
      page.title.toLowerCase().includes(searchTerm)
    );
    
    // Sort results by relevance
    filteredPages.sort((a, b) => {
      // Exact matches first
      if (a.title.toLowerCase() === searchTerm) return -1;
      if (b.title.toLowerCase() === searchTerm) return 1;
      
      // Then starts with
      if (a.title.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.title.toLowerCase().startsWith(searchTerm)) return 1;
      
      // Then alphabetical
      return a.title.localeCompare(b.title);
    });
    
    // For non-exact matches, add a suggestion to create a new page
    if (!filteredPages.some(p => p.title.toLowerCase() === searchTerm) && searchTerm.length > 0) {
      filteredPages.push({
        id: searchTerm,
        title: searchTerm,
        path: `/vault/${searchTerm}`,
        exists: false
      });
    }
    
    return res.status(200).json(filteredPages.slice(0, 10)); // Limit to 10 results
  } catch (error) {
    console.error('Error searching pages:', error);
    return res.status(500).json({ message: 'Failed to search pages' });
  }
} 