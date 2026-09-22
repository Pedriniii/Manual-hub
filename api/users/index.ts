import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db.js';
import { hashPassword } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    try {
      const users = await query<any>(`
        SELECT id, name, email, role, active, permissions, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
      `);
      return res.status(200).json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, password, role, permissions } = req.body || {};

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, Usuário/E-mail e Senha são obrigatórios.' });
      }

      // Check if user already exists
      const existing = await query<any>(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email.trim()]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Já existe um usuário cadastrado com este e-mail/login.' });
      }

      const pHash = hashPassword(password);
      const defaultPermissions = permissions || {
        can_view: true,
        can_edit: role !== 'viewer',
        can_delete: role === 'admin' || role === 'superadmin',
        can_manage_users: role === 'admin' || role === 'superadmin',
      };

      const result = await query<any>(
        `
        INSERT INTO users (name, email, password_hash, role, active, permissions)
        VALUES ($1, $2, $3, $4, true, $5::jsonb)
        RETURNING id, name, email, role, active, permissions, created_at
        `,
        [name.trim(), email.trim(), pHash, role || 'editor', JSON.stringify(defaultPermissions)]
      );

      return res.status(201).json(result[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
