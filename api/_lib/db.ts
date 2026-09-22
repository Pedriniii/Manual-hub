import { neon } from '@neondatabase/serverless';

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined. Please set it in Vercel or .env file.');
  }
  return neon(connectionString);
}

/**
 * Execute parameterized query safely using Neon SQL tag/function
 */
export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  const db = getDb();
  // Neon serverless supports raw query execution with params
  const results = await db(sqlQuery, params);
  return (results as unknown) as T[];
}
