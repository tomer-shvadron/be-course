import { Piscina } from 'piscina';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { cpus } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const optimalThreadCount = Math.max(1, cpus().length - 1);

const pool = new Piscina<number[], number>({
  filename: resolve(__dirname, 'prime-worker.ts'),
  maxThreads: optimalThreadCount,
});

const chunkify = (numbers: number[], chunkSize: number): number[][] => {
  console.log('Chunking numbers...');

  const chunks: number[][] = [];

  for (let i = 0; i < numbers.length; i += chunkSize) {
    chunks.push(numbers.slice(i, i + chunkSize));
  }

  console.log('Chunks created:', chunks.length);

  return chunks;
};

export const countPrimes = async (numbers: number[]): Promise<number> => {
  console.log('Counting primes...');

  const chunks = chunkify(numbers, 50000);
  const result = await Promise.all(
    chunks.map((chunk, index) =>
      pool.run(chunk, { name: `prime-worker-${index}` })
    )
  );

  return result.reduce((acc, num) => acc + num, 0);
};
