import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';
import { hashPassword, createSessionToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Usuário/E-mail e senha são obrigatórios.' });
    }

    const inputHash = hashPassword(password);

    // Search user by email / login ID
    const users = await query<any>(
      `SELECT id, name, email, password_hash, role, active FROM users WHERE email = $1 OR email = $2 LIMIT 1`,
      [email.trim(), email.trim().toUpperCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
    }

    const user = users[0];

    if (!user.active) {
      return res.status(403).json({ error: 'Usuário desativado.' });
    }

    // Verify password hash
    if (user.password_hash !== inputHash) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
    }

    const token = createSessionToken(user.id, user.email);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Erro no servidor: ${err.message}` });
  }
}
