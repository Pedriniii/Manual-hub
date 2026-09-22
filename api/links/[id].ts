import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do link não informado' });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { active } = req.body || {};

      await query(
        `UPDATE public_links SET active = $1 WHERE id = $2`,
        [Boolean(active), id]
      );

      return res.status(200).json({ success: true, active: Boolean(active) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
