export interface Manual {
  id: string;
  title: string;
  company: string;
  project: string;
  revision: string;
  description: string | null;
  storage_path: string;
  current_version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  signed_url?: string;
}

export interface ManualVersion {
  id: string;
  manual_id: string;
  revision: string;
  storage_path: string;
  uploaded_at: string;
  uploaded_by: string | null;
  signed_url?: string;
}

export interface PublicLink {
  id: string;
  manual_id: string;
  token: string;
  expires_at: string | null;
  password_hash: string | null;
  active: boolean;
  created_at: string;
  created_by: string | null;
  manual?: Manual;
  access_count?: number;
}

export interface AccessLog {
  id: string;
  link_id: string;
  event_type: 'view' | 'download';
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  public_link?: {
    token: string;
    manual?: {
      title: string;
      company: string;
      project: string;
    };
  };
}

export interface DashboardStats {
  totalManuals: number;
  activeLinks: number;
  totalViews: number;
  totalDownloads: number;
}

export interface CreateManualDTO {
  title: string;
  company: string;
  project: string;
  revision: string;
  description?: string;
  file: File;
}

export interface CreateVersionDTO {
  manual_id: string;
  revision: string;
  file: File;
}

export interface CreatePublicLinkDTO {
  manual_id: string;
  is_permanent: boolean;
  expires_at?: string;
  password?: string;
  active?: boolean;
}
