import { 
  Manual, 
  ManualVersion, 
  PublicLink, 
  AccessLog, 
  DashboardStats,
  CreateManualDTO,
  CreateVersionDTO,
  CreatePublicLinkDTO 
} from '../types';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('manualhub_auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/stats', {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar estatísticas do dashboard.');
  }
  return res.json();
}

export async function fetchManuals(searchQuery?: string): Promise<Manual[]> {
  const url = searchQuery && searchQuery.trim() 
    ? `/api/manuals?search=${encodeURIComponent(searchQuery.trim())}`
    : '/api/manuals';

  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao buscar lista de manuais.');
  }

  return res.json();
}

export async function fetchManualById(id: string): Promise<{ manual: Manual; versions: ManualVersion[]; links: PublicLink[] } | null> {
  const res = await fetch(`/api/manuals/${id}`, {
    headers: { ...getAuthHeader() },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao carregar detalhes do manual.');
  }

  return res.json();
}

export async function createManual(dto: CreateManualDTO, userId?: string): Promise<Manual> {
  const res = await fetch('/api/manuals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      title: dto.title,
      company: dto.company,
      project: dto.project,
      revision: dto.revision,
      description: dto.description,
      userId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao criar manual no banco de dados.');
  }

  return res.json();
}

export async function addManualVersion(dto: CreateVersionDTO, userId?: string): Promise<ManualVersion> {
  const res = await fetch(`/api/manuals/${dto.manual_id}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      revision: dto.revision,
      userId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao cadastrar nova versão.');
  }

  return res.json();
}

export async function createPublicLink(dto: CreatePublicLinkDTO, userId?: string): Promise<PublicLink> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      manual_id: dto.manual_id,
      is_permanent: dto.is_permanent,
      expires_at: dto.expires_at,
      password: dto.password,
      active: dto.active,
      userId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao gerar link público.');
  }

  return res.json();
}

export async function togglePublicLinkStatus(linkId: string, active: boolean): Promise<void> {
  const res = await fetch(`/api/links/${linkId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ active }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao alterar status do link.');
  }
}

export async function fetchPublicLinkByToken(token: string): Promise<{ link: PublicLink; manual: Manual } | null> {
  const res = await fetch(`/api/public/${token}`);

  if (res.status === 404) return null;

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao buscar link público.');
  }

  return res.json();
}

export async function recordAccessLog(linkId: string, eventType: 'view' | 'download', ip?: string, userAgent?: string): Promise<void> {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        link_id: linkId,
        event_type: eventType,
        ip,
        user_agent: userAgent || navigator.userAgent,
      }),
    });
  } catch {
    // Audit logs non-blocking
  }
}

export async function fetchAccessLogs(): Promise<AccessLog[]> {
  const res = await fetch('/api/logs', {
    headers: { ...getAuthHeader() },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Erro ao buscar logs de acesso.');
  }

  return res.json();
}
