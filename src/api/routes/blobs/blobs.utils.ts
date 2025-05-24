import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FastifyRequest } from 'fastify';
import { Buffer } from 'buffer';
import { stat } from 'fs/promises';
import { ApiConfig } from '../../api.config.js';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { CreateBlobSchema } from './schemas/create-blob.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const BLOBS_DIR = join(__dirname, 'saved-blobs');

export const ensureBlobsDirectory = async (): Promise<void> => {
  try {
    await mkdir(BLOBS_DIR, { recursive: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('EEXIST')) {
      throw error;
    }
  }
};

export const createBlobDirectory = async (id: string): Promise<string> => {
  const blobDir = join(BLOBS_DIR, id);

  await mkdir(blobDir, { recursive: true });

  return blobDir;
};

export const getBlobDirectory = (id: string): string => join(BLOBS_DIR, id);

export const getRelevantHeaders = (
  headers: Record<string, string | string[]>
): Record<string, string | string[]> => {
  const relevantHeaders = {
    'content-type': headers['content-type'],
  } as Record<string, string | string[]>;

  for (const key in headers) {
    if (key.startsWith('x-rebase-')) {
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
): Promise<void> => {
  const { id } = request.params;
  const contentLength = request.headers['content-length'];
  const headers = getRelevantHeaders(request.headers);

  if (!contentLength) {
    throw new Error('Content-Length header is required');
  }

  if (id.length > ApiConfig.MAX_ID_LENGTH) {
    throw new Error(
      `ID length exceeds maximum allowed length of ${ApiConfig.MAX_ID_LENGTH} characters`
    );
  }

  const validIdRegex = /^[a-zA-Z0-9._-]+$/;

  if (!validIdRegex.test(id)) {
    throw new Error(
      'ID can only contain letters, numbers, dots, underscores, and hyphens'
    );
  }

  const headerEntries = Object.entries(headers);

  if (headerEntries.length > ApiConfig.MAX_HEADER_COUNT) {
    throw new Error(
      `Number of headers exceeds maximum allowed count of ${ApiConfig.MAX_HEADER_COUNT}`
    );
  }

  for (const [key, value] of headerEntries) {
    if (key.length > ApiConfig.MAX_HEADER_LENGTH) {
      throw new Error(
        `Header key length exceeds maximum allowed length of ${ApiConfig.MAX_HEADER_LENGTH} characters`
      );
    }

    const valueStr = Array.isArray(value) ? value.join(',') : value;

    if (valueStr.length > ApiConfig.MAX_HEADER_LENGTH) {
      throw new Error(
        `Header value length exceeds maximum allowed length of ${ApiConfig.MAX_HEADER_LENGTH} characters`
      );
    }
  }

  const headersSize = Buffer.from(JSON.stringify(headers)).length;
  const contentLengthNum = parseInt(contentLength, 10);
  const totalSize = contentLengthNum + headersSize;

  if (totalSize > ApiConfig.MAX_LENGTH) {
    throw new Error(
      `Total size (${totalSize} bytes) exceeds maximum allowed size of ${ApiConfig.MAX_LENGTH} bytes`
    );
  }

  try {
    const stats = await stat(BLOBS_DIR);
    const currentDiskUsage = stats.size;
    const potentialNewUsage = currentDiskUsage + totalSize;

    if (potentialNewUsage > ApiConfig.MAX_DISK_QUOTA) {
      throw new Error(
        `Storing this blob would exceed maximum disk quota of ${ApiConfig.MAX_DISK_QUOTA} bytes`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw error;
    }
  }
};
