import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do manual não informado' });
  }

  if (req.method === 'GET') {
    try {
      const [manuals, versions, links] = await Promise.all([
        query<any>(`SELECT * FROM manuals WHERE id = $1 LIMIT 1`, [id]),
        query<any>(`SELECT * FROM manual_versions WHERE manual_id = $1 ORDER BY uploaded_at DESC`, [id]),
        query<any>(`SELECT * FROM public_links WHERE manual_id = $1 ORDER BY created_at DESC`, [id]),
      ]);

      if (manuals.length === 0) {
        return res.status(404).json({ error: 'Manual não encontrado' });
      }

      return res.status(200).json({
        manual: manuals[0],
        versions,
        links,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // 1. Delete associated logs, links, versions
      await query(`DELETE FROM access_logs WHERE link_id IN (SELECT id FROM public_links WHERE manual_id = $1)`, [id]);
      await query(`DELETE FROM public_links WHERE manual_id = $1`, [id]);
      await query(`DELETE FROM manual_versions WHERE manual_id = $1`, [id]);
      await query(`DELETE FROM manuals WHERE id = $1`, [id]);

      return res.status(200).json({ success: true, message: 'Manual excluído com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
