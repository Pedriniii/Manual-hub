import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../_lib/db.js';
import { handleCors } from '../../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do manual não informado' });
  }

  if (req.method === 'POST') {
    try {
      const { revision, userId } = req.body || {};

      if (!revision || !revision.trim()) {
        return res.status(400).json({ error: 'Código de revisão é obrigatório.' });
      }

      // Insert new version
      const vResult = await query<any>(
        `
        INSERT INTO manual_versions (manual_id, revision, uploaded_by)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [id, revision.trim(), userId || null]
      );

      // Increment current_version and update revision string on manuals
      await query(
        `
        UPDATE manuals 
        SET revision = $1, current_version = current_version + 1, updated_at = timezone('utc', now())
        WHERE id = $2
        `,
        [revision.trim(), id]
      );

      return res.status(201).json(vResult[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
