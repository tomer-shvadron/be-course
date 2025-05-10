import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * Reads a file line by line from a relative path and returns an array of lines.
 * @param relativePath - The relative path to the file (from the current working directory).
 * @returns Promise that resolves with an array of lines.
 */
export const readFile = async (relativePath: string): Promise<string[]> => {
  const absolutePath = path.resolve(process.cwd(), relativePath);

  const fileStream = fs.createReadStream(absolutePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // Handles both \r\n and \n
  });

  const lines: string[] = [];
  for await (const line of rl) {
    lines.push(line);
  }

  return lines;
};
