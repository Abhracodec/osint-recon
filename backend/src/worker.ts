import { startWorker } from './jobs'; // Adjust the path if necessary
import { connectToDatabase, connectToRedis } from './utils';
import { tavily } from '@tavily/core';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || 'tvly-YOUR_API_KEY' });

async function main() {
  await connectToDatabase();
  await connectToRedis();

  console.log('Worker started, listening for jobs...');
  startWorker(); // Ensure this function processes jobs correctly
}

main().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
