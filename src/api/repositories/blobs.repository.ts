import { join } from 'path';
import { Buffer } from 'buffer';
import { writeFile, readFile, access, rm } from 'fs/promises';
import { createBlobDirectory, BLOBS_DIR } from '../routes/blobs/blobs.utils.js';

export const BlobsRepository = {
  create: async ({
    id,
    buffer,
    headers,
  }: {
    id: string;
    buffer: Buffer;
    headers: Record<string, string | string[]>;
  }) => {
    const blobDir = await createBlobDirectory(id);

    await writeFile(join(blobDir, id), buffer);
    await writeFile(join(blobDir, 'headers.json'), JSON.stringify(headers), {
      encoding: 'ascii',
    });
  },

  findById: async (id: string) => {
    const blobDir = join(BLOBS_DIR, id);
    const blobPath = join(blobDir, id);
    const headersPath = join(blobDir, 'headers.json');

    try {
      const [buffer, headersJson] = await Promise.all([
        readFile(blobPath),
        readFile(headersPath, { encoding: 'ascii' }),
      ]);

      const headers = JSON.parse(headersJson) as Record<
        string,
        string | string[]
      >;

      return {
        buffer,
        headers,
      };
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  },

  delete: async (id: string) => {
    const blobDir = join(BLOBS_DIR, id);

    await rm(blobDir, { recursive: true, force: true });
  },
};
