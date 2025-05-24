import { join } from 'path';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { writeFile, readFile, rm, mkdir, stat } from 'fs/promises';
import { IncomingMessage } from 'http';

import { directorySharder } from '../routes/blobs/blobs.utils.js';

type NodeError = Error & { code?: string };

export const BlobsRepository = {
  create: async ({
    id,
    stream,
    headers,
  }: {
    id: string;
    stream: IncomingMessage;
    headers: Record<string, string | string[]>;
  }) => {
    const shardDir = directorySharder.getShardDirectory(id);
    const blobDir = join(shardDir, id);
    const blobPath = join(blobDir, id);

    await mkdir(blobDir, { recursive: true });

    const writeStream = createWriteStream(blobPath);

    stream.on('error', (error) => {
      console.error('Error reading from request stream:', error);
      writeStream.destroy(error);
    });

    writeStream.on('error', (error) => {
      console.error('Error writing to file stream:', error);
      stream.destroy(error);
    });

    try {
      await Promise.all([
        pipeline(stream, writeStream),
        writeFile(join(blobDir, 'headers.json'), JSON.stringify(headers), {
          encoding: 'ascii',
        }),
      ]);

      const stats = await stat(blobPath);

      if (stats.size === 0) {
        throw new Error('File was written but is empty');
      }
    } catch (error) {
      try {
        await rm(blobPath, { force: true });
      } catch (cleanupError) {
        console.error('Error cleaning up failed blob:', cleanupError);
      }

      throw error;
    }
  },

  findById: async (id: string) => {
    const shardDir = directorySharder.getShardDirectory(id);
    const blobDir = join(shardDir, id);
    const blobPath = join(blobDir, id);
    const headersPath = join(blobDir, 'headers.json');

    try {
      const headersJson = await readFile(headersPath, { encoding: 'ascii' });
      const headers = JSON.parse(headersJson) as Record<
        string,
        string | string[]
      >;

      const stream = createReadStream(blobPath);

      return { stream, headers };
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
