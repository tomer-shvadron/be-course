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

export class FileReader {
  /**
   * Reads a specific number of lines from a file starting at a given line number
   * @param filePath Path to the file to read
   * @param startLine Line number to start reading from (1-based)
   * @param numLines Number of lines to read
   * @returns Promise resolving to array of lines read
   */
  async readLines(
    filePath: string,
    startLine: number,
    numLines: number
  ): Promise<string[]> {
    if (startLine < 1) {
      throw new Error('Start line must be greater than 0');
    }

    const lines: string[] = [];
    let currentLine = 0;

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
      });

      rl.on('line', (line: string) => {
        currentLine++;

        if (currentLine >= startLine) {
          lines.push(line);

          if (lines.length >= numLines) {
            rl.close();
          }
        }
      });

      rl.on('close', () => {
        resolve(lines);
      });

      rl.on('error', reject);
    });
  }

  /**
   * Counts the total number of lines in a file
   * @param filePath Path to the file
   * @returns Promise resolving to the number of lines
   */
  async countLines(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
      });

      rl.on('line', () => {
        count++;
      });

      rl.on('close', () => {
        resolve(count);
      });

      rl.on('error', reject);
    });
  }

  /**
   * Reads a file line by line and processes each line with a callback
   * @param filePath Path to the file
   * @param processLine Callback function to process each line
   * @returns Promise that resolves when the file is fully processed
   */
  async processFileByLines<T>(
    filePath: string,
    processLine: (line: string, lineNumber: number) => T
  ): Promise<T[]> {
    const results: T[] = [];
    let lineNumber = 0;

    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
      });

      rl.on('line', (line: string) => {
        lineNumber++;
        results.push(processLine(line, lineNumber));
      });

      rl.on('close', () => {
        resolve(results);
      });

      rl.on('error', reject);
    });
  }
}
