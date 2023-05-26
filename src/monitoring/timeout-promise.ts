export async function timeoutPromise<T>(millis: number, promise: Promise<T>) {
  const timeout: Promise<T> = new Promise((_, reject) =>
    setTimeout(() => reject(`Timed out after ${millis} ms.`), millis)
  );
  return Promise.race([promise, timeout]);
}
