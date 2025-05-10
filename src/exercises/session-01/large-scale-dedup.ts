import * as fs from 'fs';
import * as path from 'path';
import { HashMap } from './hash-map';

export class LargeScaleDedup {
  private readonly NUM_FILES = 20;
  private readonly TEMP_DIR = './temp';
  private readonly FILE_PREFIX = 'file_';
  private readonly INPUT_FILE_PATH = './src/input.txt';
  private readonly OUTPUT_FILE_PATH = './src/output.txt';

  async deduplicate(
    inputFilePath: string = this.INPUT_FILE_PATH,
    outputFilePath: string = this.OUTPUT_FILE_PATH
  ) {
    this.ensureTempDirectoryExists();
    this.ensureOutputFileDoesNotExist();

    const tempFilePaths = await this.splitInputFiles(inputFilePath);
    await this.deduplicateFiles(tempFilePaths);
    await this.mergeDeduplicatedFiles(tempFilePaths, outputFilePath);

    this.cleanupTempData();
  }

  private ensureTempDirectoryExists() {
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  private ensureOutputFileDoesNotExist() {
    if (fs.existsSync(this.OUTPUT_FILE_PATH)) {
      fs.unlinkSync(this.OUTPUT_FILE_PATH);
    }
  }

  private getTempFilePath(index: number): string {
    return path.join(this.TEMP_DIR, `${this.FILE_PREFIX}${index}.txt`);
  }

  private writeToFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
  }

  private readFromFile(filePath: string): string {
    return fs.readFileSync(filePath, 'ascii');
  }

  private async splitInputFiles(inputFilePath: string): Promise<string[]> {
    const tempFiles: string[] = [];
    const fileSize = fs.statSync(inputFilePath).size;
    const chunkSize = Math.ceil(fileSize / this.NUM_FILES);

    const readStream = fs.createReadStream(inputFilePath, {
      highWaterMark: chunkSize,
    });

    let currentFileIndex = 0;
    let currentChunk = '';

    return new Promise((resolve, reject) => {
      readStream.on('data', (chunk) => {
        currentChunk += chunk.toString();

        if (
          currentChunk.length >= chunkSize ||
          currentFileIndex === this.NUM_FILES - 1
        ) {
          const tempFilePath = this.getTempFilePath(currentFileIndex);
          this.writeToFile(tempFilePath, currentChunk);

          tempFiles.push(tempFilePath);

          currentChunk = '';
          currentFileIndex++;
        }
      });

      readStream.on('end', () => {
        if (currentChunk) {
          const tempFilePath = this.getTempFilePath(currentFileIndex);
          this.writeToFile(tempFilePath, currentChunk);
          tempFiles.push(tempFilePath);
        }

        resolve(tempFiles);
      });

      readStream.on('error', reject);
    });
  }

  private async deduplicateFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      await this.deduplicateFile(filePath);
    }
  }

  private async deduplicateFile(file: string) {
    const hashMap = new HashMap();
    const lines = this.readFromFile(file).split('\n');

    lines.forEach((line) => {
      if (this.isValidLine(line) && this.isUniqueLine(hashMap, line)) {
        hashMap.put(line, line);
      }
    });

    const uniqueLines = hashMap.values().join('\n');
    this.writeToFile(file, uniqueLines);
  }

  private isValidLine(line: string): boolean {
    return line.trim().length > 0;
  }

  private isUniqueLine(hashMap: HashMap, line: string): boolean {
    try {
      hashMap.get(line);

      return false;
    } catch {
      return true;
    }
  }

  private async mergeDeduplicatedFiles(
    filePaths: string[],
    outputFilePath: string
  ) {
    const writeStream = fs.createWriteStream(outputFilePath);

    for (const filePath of filePaths) {
      const readStream = fs.createReadStream(filePath);

      await new Promise<void>((resolve, reject) => {
        readStream.pipe(writeStream, { end: false });

        readStream.on('end', () => {
          writeStream.write('\n');
          resolve();
        });

        readStream.on('error', reject);
      });
    }

    writeStream.end();

    return new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  private async cleanupTempData() {
    setTimeout(() => {
      const files = fs.readdirSync(this.TEMP_DIR);

      files.forEach((file) => {
        fs.unlinkSync(path.join(this.TEMP_DIR, file));
      });

      fs.rmdirSync(this.TEMP_DIR);
    }, 1000);
  }
}
