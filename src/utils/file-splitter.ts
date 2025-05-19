import * as fs from 'fs';
import * as path from 'path';

const ensureDirectoryExists = (outputDir: string): void => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
};

const splitFileByLines = (
  inputFilePath: string,
  outputDir: string,
  linesPerFile: number,
  filePrefix: string = 'chunk_'
): Promise<string[]> => {
  const outputFiles: string[] = [];
  let currentFileIndex = 0;
  let currentLineCount = 0;
  let currentOutputFile: fs.WriteStream | null = null;

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(inputFilePath, {
      encoding: 'ascii',
    });

    let buffer = '';

    readStream.on('data', (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (currentLineCount === 0) {
          const outputPath = path.join(
            outputDir,
            `${filePrefix}${currentFileIndex}.txt`
          );

          currentOutputFile = fs.createWriteStream(outputPath);
          outputFiles.push(outputPath);
        }

        currentOutputFile?.write(line + '\n');
        currentLineCount++;

        if (currentLineCount >= linesPerFile) {
          currentOutputFile?.end();
          currentOutputFile = null;
          currentLineCount = 0;
          currentFileIndex++;
        }
      }
    });

    readStream.on('end', () => {
      if (buffer) {
        if (!currentOutputFile) {
          const outputPath = path.join(
            outputDir,
            `${filePrefix}${currentFileIndex}.txt`
          );
          currentOutputFile = fs.createWriteStream(outputPath);
          outputFiles.push(outputPath);
        }
        currentOutputFile?.write(buffer);
      }
      currentOutputFile?.end();
      resolve(outputFiles);
    });

    readStream.on('error', reject);
  });
};

const cleanup = (outputDir: string): void => {
  try {
    const files = fs.readdirSync(outputDir);

    for (const file of files) {
      fs.unlinkSync(path.join(outputDir, file));
    }

    fs.rmdirSync(outputDir);
  } catch (error) {
    console.error('Error cleaning up directory:', error);
  }
};

export const fileSpliiter = (
  inputFilePath: string,
  outputDir: string = './temp',
  linesPerFile: number = 10000,
  filePrefix: string = 'chunk_'
) => {
  ensureDirectoryExists(outputDir);

  splitFileByLines(inputFilePath, outputDir, linesPerFile, filePrefix);
};
