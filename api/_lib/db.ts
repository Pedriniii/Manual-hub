import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Set WebSocket constructor for serverless environments if needed
if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws;
}

/**
 * Sanitizes and validates DATABASE_URL from process.env
 */
export function getSanitizedDatabaseUrl(): string {
  const rawUrl = process.env.DATABASE_URL || '';
  
  // Clean whitespace, quotes, single quotes, double quotes, and line breaks
  const cleanedUrl = rawUrl
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, '');

  if (!cleanedUrl || cleanedUrl.includes('example')) {
    throw new Error(
      'A variável de ambiente DATABASE_URL não está configurada na Vercel ou contém o valor de exemplo. ' +
      'Por favor acesse Vercel -> Project Settings -> Environment Variables, adicione DATABASE_URL com a URL válida do Neon PostgreSQL e refaça o deploy.'
    );
  }

  if (!cleanedUrl.startsWith('postgres://') && !cleanedUrl.startsWith('postgresql://')) {
    throw new Error(
      `A DATABASE_URL fornecida não possui o formato válido postgresql://. Valor recebido: "${cleanedUrl.substring(0, 15)}..."`
    );
  }

  return cleanedUrl;
}

export function getDb() {
  const connectionString = getSanitizedDatabaseUrl();
  return neon(connectionString);
}

/**
 * Safely executes parameterized query on Neon PostgreSQL
 */
export async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  try {
    const db = getDb();
    const results = await db(sqlQuery, params);
    return (results as unknown) as T[];
  } catch (error: any) {
    console.error('[Neon DB Error]:', error);
    throw new Error(`Erro ao consultar banco Neon PostgreSQL: ${error?.message || String(error)}`);
  }
}
