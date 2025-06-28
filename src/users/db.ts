import { Pool } from 'pg';
import { config } from '../common/config.js';

// Create a connection pool
export const db = new Pool({
  host: config.USERS.DB.HOST,
  port: config.USERS.DB.PORT,
  database: config.USERS.DB.DATABASE,
  user: config.USERS.DB.USER,
  password: config.USERS.DB.PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await db.end();
  process.exit(0);
});
