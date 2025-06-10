import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FastifyRequest } from 'fastify';
import { Buffer } from 'buffer';
import { stat } from 'fs/promises';
import { config } from '../../../common/config.js';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { CreateBlobSchema } from '../../../common/schemas/create-blob.schema.js';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BLOBS_DIR = join(__dirname, 'saved-blobs');

class DirectorySharder {
  private readonly shardMap: Map<string, number> = new Map();
  private readonly shardCount: number;

  constructor(private readonly maxBlobsPerShard: number) {
    this.shardCount = Math.ceil(
      config.API.MAX_DISK_QUOTA / (maxBlobsPerShard * config.API.MAX_LENGTH)
    );
  }

  private getShardKey(id: string): string {
    return createHash('sha256').update(id).digest('hex');
  }

  private getShardNumber(hash: string): number {
    // Use first 8 characters of hash to get a number between 0 and shardCount-1
    return parseInt(hash.substring(0, 8), 16) % this.shardCount;
  }

  getShardDirectory(id: string): string {
    const hash = this.getShardKey(id);
    const shardNumber = this.getShardNumber(hash);

    const currentCount = this.shardMap.get(hash) || 0;
    this.shardMap.set(hash, currentCount + 1);

    return join(BLOBS_DIR, `shard-${shardNumber}`);
  }

  removeFromShard(id: string): void {
    const hash = this.getShardKey(id);
    const currentCount = this.shardMap.get(hash) || 0;

    if (currentCount > 0) {
      this.shardMap.set(hash, currentCount - 1);
    }
  }
}

export const directorySharder = new DirectorySharder(
  config.API.MAX_BLOBS_IN_FOLDER
);

export const ensureBlobsDirectory = async () => {
  try {
    await mkdir(BLOBS_DIR, { recursive: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('EEXIST')) {
      throw error;
    }
  }
};

export const createBlobDirectory = async (id: string) => {
  const blobDir = join(BLOBS_DIR, id);

  await mkdir(blobDir, { recursive: true });

  return blobDir;
};

export const getBlobDirectory = (id: string) => join(BLOBS_DIR, id);

export const getRelevantHeaders = (
  headers: Record<string, string | string[]>
): Record<string, string | string[]> => {
  const relevantHeaders = {
    'content-type': headers['content-type'],
  } as Record<string, string | string[]>;

  for (const key in headers) {
    if (key.toLowerCase().startsWith('x-rebase-')) {
      relevantHeaders[key] = headers[key];
    }
  }

  return relevantHeaders;
};

export const validateBlobRequest = async (
  request: FastifyRequest<
    {
      Params: typeof CreateBlobSchema.params;
      Body: typeof CreateBlobSchema.body;
    } & TypeBoxTypeProvider
  >
) => {
  const { id } = request.params;
  const contentLength = request.headers['content-length'];
  const headers = getRelevantHeaders(request.headers);

  if (!contentLength) {
    throw new Error('Content-Length header is required');
  }

  if (id.length > config.API.MAX_ID_LENGTH) {
    throw new Error(
      `ID length exceeds maximum allowed length of ${config.API.MAX_ID_LENGTH} characters`
    );
  }

  const validIdRegex = /^[a-zA-Z0-9._-]+$/;

  if (!validIdRegex.test(id)) {
    throw new Error(
      'ID can only contain letters, numbers, dots, underscores, and hyphens'
    );
  }

  const headerEntries = Object.entries(headers);

  if (headerEntries.length > config.API.MAX_HEADER_COUNT) {
    throw new Error(
      `Number of headers exceeds maximum allowed count of ${config.API.MAX_HEADER_COUNT}`
    );
  }

  for (const [key, value] of headerEntries) {
    if (key.length > config.API.MAX_HEADER_LENGTH) {
      throw new Error(
        `Header key length exceeds maximum allowed length of ${config.API.MAX_HEADER_LENGTH} characters`
      );
    }

    const valueStr = Array.isArray(value) ? value.join(',') : value;

    if (valueStr.length > config.API.MAX_HEADER_LENGTH) {
      throw new Error(
        `Header value length exceeds maximum allowed length of ${config.API.MAX_HEADER_LENGTH} characters`
      );
    }
  }

  const headersSize = Buffer.from(JSON.stringify(headers)).length;
  const contentLengthNum = parseInt(contentLength, 10);
  const totalSize = contentLengthNum + headersSize;

  if (totalSize > config.API.MAX_LENGTH) {
    throw new Error(
      `Total size (${totalSize} bytes) exceeds maximum allowed size of ${config.API.MAX_LENGTH} bytes`
    );
  }

  try {
    const stats = await stat(BLOBS_DIR);
    const currentDiskUsage = stats.size;
    const potentialNewUsage = currentDiskUsage + totalSize;

    if (potentialNewUsage > config.API.MAX_DISK_QUOTA) {
      throw new Error(
        `Storing this blob would exceed maximum disk quota of ${config.API.MAX_DISK_QUOTA} bytes`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw error;
    }
  }
};
