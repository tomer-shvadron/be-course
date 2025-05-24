import { join } from 'path';
import { Buffer } from 'buffer';
import { writeFile, readFile, rm, mkdir } from 'fs/promises';
import { directorySharder } from '../routes/blobs/blobs.utils.js';

type NodeError = Error & { code?: string };

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
    const shardDir = directorySharder.getShardDirectory(id);
    const blobDir = join(shardDir, id);

    await mkdir(blobDir, { recursive: true });

    await writeFile(join(blobDir, id), buffer);
    await writeFile(join(blobDir, 'headers.json'), JSON.stringify(headers), {
      encoding: 'ascii',
    });
  },

  findById: async (id: string) => {
    const shardDir = directorySharder.getShardDirectory(id);
    const blobDir = join(shardDir, id);
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
      return { buffer, headers };
    } catch (error) {
      if (error instanceof Error && (error as NodeError).code === 'ENOENT') {
        return null;
      }

      throw error;
    }
  },

  delete: async (id: string) => {
    const shardDir = directorySharder.getShardDirectory(id);
    const blobDir = join(shardDir, id);

    try {
      await rm(blobDir, { recursive: true, force: true });

      directorySharder.removeFromShard(id);
    } catch (error) {
      if (error instanceof Error && (error as NodeError).code === 'ENOENT') {
        throw new Error(`Blob with id ${id} not found`);
      }

      throw error;
    }
  },
};
