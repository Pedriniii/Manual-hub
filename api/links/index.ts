import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';
import { handleCors } from '../_lib/cors';
import crypto from 'crypto';

function generateToken(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method === 'POST') {
    try {
      const { manual_id, is_permanent, expires_at, password, active, userId } = req.body || {};

      if (!manual_id) {
        return res.status(400).json({ error: 'ID do manual é obrigatório' });
      }

      const token = generateToken(10);
      let expAt: string | null = null;

      if (!is_permanent && expires_at) {
        expAt = new Date(expires_at).toISOString();
      }

      const result = await query<any>(
        `
        INSERT INTO public_links (manual_id, token, expires_at, password_hash, active, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          manual_id,
          token,
          expAt,
          password ? password.trim() : null,
          active !== undefined ? active : true,
          userId || null,
        ]
      );

      return res.status(201).json(result[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
