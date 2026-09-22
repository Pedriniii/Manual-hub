import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from './_lib/db';
import { handleCors } from './_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const [manualsCount, linksCount, viewsCount, downloadsCount] = await Promise.all([
      query<any>(`SELECT COUNT(*)::int as count FROM manuals`),
      query<any>(`SELECT COUNT(*)::int as count FROM public_links WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())`),
      query<any>(`SELECT COUNT(*)::int as count FROM access_logs WHERE event_type = 'view'`),
      query<any>(`SELECT COUNT(*)::int as count FROM access_logs WHERE event_type = 'download'`),
    ]);

    return res.status(200).json({
      totalManuals: manualsCount[0]?.count || 0,
      activeLinks: linksCount[0]?.count || 0,
      totalViews: viewsCount[0]?.count || 0,
      totalDownloads: downloadsCount[0]?.count || 0,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
