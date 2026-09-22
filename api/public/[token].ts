import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token de acesso não informado' });
  }

  if (req.method === 'GET') {
    try {
      const links = await query<any>(
        `SELECT * FROM public_links WHERE token = $1 LIMIT 1`,
        [token]
      );

      if (links.length === 0) {
        return res.status(404).json({ error: 'Link não encontrado' });
      }

      const link = links[0];

      const manuals = await query<any>(
        `SELECT * FROM manuals WHERE id = $1 LIMIT 1`,
        [link.manual_id]
      );

      if (manuals.length === 0) {
        return res.status(404).json({ error: 'Manual associado não encontrado' });
      }

      return res.status(200).json({
        link,
        manual: manuals[0],
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
