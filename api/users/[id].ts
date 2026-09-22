import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db.js';
import { hashPassword } from '../_lib/auth.js';
import { handleCors } from '../_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do usuário não informado' });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    try {
      const { name, email, password, role, active, permissions } = req.body || {};

      // Get current user
      const current = await query<any>(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [id]);
      if (current.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const existingUser = current[0];

      const newName = name !== undefined ? name.trim() : existingUser.name;
      const newEmail = email !== undefined ? email.trim() : existingUser.email;
      const newRole = role !== undefined ? role : existingUser.role;
      const newActive = active !== undefined ? Boolean(active) : existingUser.active;
      const newPermissions = permissions !== undefined ? permissions : (existingUser.permissions || {
        can_view: true,
        can_edit: true,
        can_delete: true,
        can_manage_users: true,
      });

      let newPasswordHash = existingUser.password_hash;
      if (password && password.trim()) {
        newPasswordHash = hashPassword(password.trim());
      }

      const result = await query<any>(
        `
        UPDATE users
        SET name = $1, email = $2, password_hash = $3, role = $4, active = $5, permissions = $6::jsonb, updated_at = timezone('utc', now())
        WHERE id = $7
        RETURNING id, name, email, role, active, permissions, created_at, updated_at
        `,
        [newName, newEmail, newPasswordHash, newRole, newActive, JSON.stringify(newPermissions), id]
      );

      return res.status(200).json(result[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Prevent deleting superadmin 'SUP'
      const target = await query<any>(`SELECT email FROM users WHERE id = $1 LIMIT 1`, [id]);
      if (target.length > 0 && (target[0].email === 'SUP' || target[0].email === 'superadmin')) {
        return res.status(400).json({ error: 'O usuário mestre (SUP) não pode ser excluído.' });
      }

      await query(`DELETE FROM users WHERE id = $1`, [id]);
      return res.status(200).json({ success: true, message: 'Usuário excluído com sucesso.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
