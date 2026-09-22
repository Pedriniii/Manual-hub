import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db.js';
import { verifySessionToken } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }

    const users = await query<any>(
      `SELECT id, name, email, role, active, permissions FROM users WHERE id = $1 LIMIT 1`,
      [payload.userId]
    );

    if (users.length === 0 || !users[0].active) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    const user = users[0];
    const defaultPerms = {
      can_view: true,
      can_edit: user.role !== 'viewer',
      can_delete: user.role === 'admin' || user.role === 'superadmin',
      can_manage_users: user.role === 'admin' || user.role === 'superadmin',
    };

    return res.status(200).json({ 
      user: {
        ...user,
        permissions: user.permissions || defaultPerms,
      } 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
