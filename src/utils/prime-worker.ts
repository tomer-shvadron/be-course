const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }

  return true;
};

export default function primeWorker(
  numbers: number[],
  { name }: { name: string }
): number {
  console.log(`Prime worker ${name} started...`);

  const result = numbers.filter((num) => isPrime(num)).length;

  console.log(`Prime worker ${name} finished...`);

  return result;
}
