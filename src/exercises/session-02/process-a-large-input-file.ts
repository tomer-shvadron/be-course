/*
 * Given a text input file input.txt with a single number in each line
 * Your task is to print how many prime numbers are in this file and how long it took to find them
 */

import { readFile } from '../../utils/file-reader.js';
import { countPrimes } from '../../utils/prime-counter.js';

export const processLargeInputFile = async (inputFilePath: string) => {
  console.log('Processing large input file...');

  const startTime = Date.now();
  const numbers = (await readFile(inputFilePath)).map(Number);

  const numOfPrimeNumbers = await countPrimes(numbers);

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`Number of prime numbers: ${numOfPrimeNumbers}`); // 16_912_305
  console.log(`Time taken: ${duration}ms`);
};
