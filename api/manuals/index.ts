import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { search } = req.query;
      let sql = `SELECT * FROM manuals ORDER BY updated_at DESC`;
      let params: any[] = [];

      if (search && typeof search === 'string' && search.trim()) {
        const q = `%${search.trim()}%`;
        sql = `
          SELECT * FROM manuals 
          WHERE title ILIKE $1 OR company ILIKE $1 OR project ILIKE $1 
          ORDER BY updated_at DESC
        `;
        params = [q];
      }

      const list = await query(sql, params);
      return res.status(200).json(list);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, company, project, revision, description, userId } = req.body || {};

      if (!title || !company || !project || !revision) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes: title, company, project, revision.' });
      }

      // 1. Insert manual record
      const result = await query<any>(
        `
        INSERT INTO manuals (title, company, project, revision, description, current_version, created_by)
        VALUES ($1, $2, $3, $4, $5, 1, $6)
        RETURNING *
        `,
        [title.trim(), company.trim(), project.trim(), revision.trim(), description || null, userId || null]
      );

      const newManual = result[0];

      // 2. Insert initial manual version metadata
      await query(
        `
        INSERT INTO manual_versions (manual_id, revision, uploaded_by)
        VALUES ($1, $2, $3)
        `,
        [newManual.id, revision.trim(), userId || null]
      );

      return res.status(201).json(newManual);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
