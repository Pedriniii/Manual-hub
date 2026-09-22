import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      const logs = await query<any>(`
        SELECT 
          al.id,
          al.link_id,
          al.event_type,
          al.ip,
          al.user_agent,
          al.created_at,
          pl.token as token,
          m.title as manual_title,
          m.company as manual_company,
          m.project as manual_project
        FROM access_logs al
        LEFT JOIN public_links pl ON al.link_id = pl.id
        LEFT JOIN manuals m ON pl.manual_id = m.id
        ORDER BY al.created_at DESC
      `);

      const formattedLogs = logs.map(item => ({
        id: item.id,
        link_id: item.link_id,
        event_type: item.event_type,
        ip: item.ip,
        user_agent: item.user_agent,
        created_at: item.created_at,
        public_link: item.token ? {
          token: item.token,
          manual: item.manual_title ? {
            title: item.manual_title,
            company: item.manual_company,
            project: item.manual_project,
          } : undefined
        } : undefined
      }));

      return res.status(200).json(formattedLogs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { link_id, event_type, ip, user_agent } = req.body || {};

      if (!link_id || !event_type) {
        return res.status(400).json({ error: 'link_id e event_type são obrigatórios' });
      }

      const clientIp = ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const clientUa = user_agent || (req.headers['user-agent'] as string) || '';

      const result = await query(
        `
        INSERT INTO access_logs (link_id, event_type, ip, user_agent)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [link_id, event_type, clientIp, clientUa]
      );

      return res.status(201).json(result[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
