const envApiUrl = import.meta.env.VITE_DATALAYER_API_URL;
const API_BASE = (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.startsWith('http'))
  ? envApiUrl
  : (import.meta.env.DEV ? '' : 'http://localhost:8001');
const CIVITAS_API_KEY = import.meta.env.VITE_API_KEY;

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(CIVITAS_API_KEY ? { 'X-API-Key': CIVITAS_API_KEY } : {}),
  };
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: string;
  status: string;
  invited_at: string;
  joined_at: string | null;
  phone: string | null;
  external_link: string | null;
}

export interface TeamProject {
  id: string;
  team_id: string;
  name: string;
  property_address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  member_ids: string[];
}

export interface TeamDetail extends Team {
  members: TeamMember[];
  projects: TeamProject[];
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
}

export type MemberRole = 'lead_investor' | 'partner' | 'advisor';

export interface MemberInviteRequest {
  email: string;
  name?: string;
  role: string;
  phone?: string;
  external_link?: string;
}

export interface MemberUpdateRequest {
  role?: string;
  status?: string;
  name?: string;
  phone?: string;
  external_link?: string;
}

export interface ProjectCreateRequest {
  name: string;
  property_address?: string;
  member_ids?: string[];
}

export interface ProjectUpdateRequest {
  name?: string;
  property_address?: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  provider: 'gmail' | 'outlook' | 'sent';
  read: boolean;
}

export interface EmailThread {
  partnerId: string;
  messages: EmailMessage[];
}

export type ListingPlatform = 'airbnb' | 'vrbo' | 'other';
export type ListingStatus = 'sourcing' | 'renovating' | 'listed' | 'earning';

export type PropertyType = 'short_term_rental' | 'long_term_rental' | 'flip' | 'land' | 'development' | 'wholesale';
export type PropertyStatus = 'sourcing' | 'under_contract' | 'renovating' | 'listed' | 'rented' | 'earning' | 'sold' | 'closed';

function qs(userId: string): string {
  return `?user_id=${encodeURIComponent(userId)}`;
}

export const teamsService = {
  async createTeam(userId: string, body: TeamCreateRequest): Promise<Team> {
    const res = await fetch(`${API_BASE}/api/teams/${qs(userId)}`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to create team');
    return res.json();
  },

  async listTeams(userId: string): Promise<{ teams: Team[]; total: number }> {
    const res = await fetch(`${API_BASE}/api/teams/${qs(userId)}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to list teams');
    return res.json();
  },

  async getTeam(teamId: string, userId: string): Promise<TeamDetail> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}${qs(userId)}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to get team');
    return res.json();
  },

  async updateTeam(teamId: string, userId: string, body: { name?: string; description?: string }): Promise<Team> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}${qs(userId)}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update team');
    return res.json();
  },

  async deleteTeam(teamId: string, userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}${qs(userId)}`, {
      method: 'DELETE', headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to delete team');
  },

  async inviteMember(teamId: string, userId: string, body: MemberInviteRequest): Promise<TeamMember> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/members${qs(userId)}`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to invite member');
    return res.json();
  },

  async updateMember(teamId: string, memberId: string, userId: string, body: MemberUpdateRequest): Promise<TeamMember> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/members/${memberId}${qs(userId)}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update member');
    return res.json();
  },

  async removeMember(teamId: string, memberId: string, userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/members/${memberId}${qs(userId)}`, {
      method: 'DELETE', headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to remove member');
  },

  async createProject(teamId: string, userId: string, body: ProjectCreateRequest): Promise<TeamProject> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/projects${qs(userId)}`, {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async listProjects(teamId: string, userId: string): Promise<{ projects: TeamProject[]; total: number }> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/projects${qs(userId)}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to list projects');
    return res.json();
  },

  async updateProject(teamId: string, projectId: string, userId: string, body: ProjectUpdateRequest): Promise<TeamProject> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/projects/${projectId}${qs(userId)}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async deleteProject(teamId: string, projectId: string, userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/projects/${projectId}${qs(userId)}`, {
      method: 'DELETE', headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  // ── Chat Messages ──────────────────────────────────────────────────────────

  async sendMessage(
    teamId: string, senderId: string, recipientId: string, text: string, userId: string,
  ): Promise<{ id: string; team_id: string; sender_id: string; recipient_id: string; text: string; created_at: string }> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/messages${qs(userId)}`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ sender_id: senderId, recipient_id: recipientId, text }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async getMessages(
    teamId: string, partnerId: string, userId: string, limit = 50,
  ): Promise<{ messages: Array<{ id: string; sender_id: string; recipient_id: string; text: string; created_at: string }>; total: number }> {
    const params = new URLSearchParams({ user_id: userId, partner_id: partnerId, limit: String(limit) });
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/messages?${params}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to get messages');
    return res.json();
  },

  // ── Emails ─────────────────────────────────────────────────────────────────

  async sendEmail(
    teamId: string, senderId: string, recipientId: string, subject: string, body: string, userId: string,
  ): Promise<{ id: string; subject: string; body: string; status: string; created_at: string }> {
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/emails${qs(userId)}`, {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ sender_id: senderId, recipient_id: recipientId, subject, body }),
    });
    if (!res.ok) throw new Error('Failed to send email');
    return res.json();
  },

  async getEmails(
    teamId: string, partnerId: string, userId: string, limit = 50,
  ): Promise<{ emails: Array<{ id: string; sender_id: string; recipient_id: string; subject: string; body: string; status: string; created_at: string }>; total: number }> {
    const params = new URLSearchParams({ user_id: userId, partner_id: partnerId, limit: String(limit) });
    const res = await fetch(`${API_BASE}/api/teams/${teamId}/emails?${params}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to get emails');
    return res.json();
  },

  // ── Invites ───────────────────────────────────────────────────────────────

  async getInvite(token: string): Promise<InviteDetail> {
    const res = await fetch(`${API_BASE}/api/teams/invites/${token}`, {
      headers: headers(),
    });
    if (!res.ok) throw new Error('Invite not found or expired');
    return res.json();
  },

  async acceptInvite(token: string, userId: string): Promise<{ status: string; member: TeamMember }> {
    const res = await fetch(`${API_BASE}/api/teams/invites/${token}/accept${qs(userId)}`, {
      method: 'POST', headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to accept invite');
    return res.json();
  },
};

export interface InviteDetail {
  id: string;
  team_id: string;
  member_id: string;
  email: string;
  status: string;
  expires_at: string | null;
  team_name: string;
  team_description: string | null;
  role: string;
  name: string | null;
}
