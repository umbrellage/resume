const API_BASE = '/api';

export interface ResumeListItem {
  id: string;
  title: string;
  templateId: string;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeData {
  id: string;
  title: string;
  templateId: string;
  data: unknown;
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function listResumes(token: string): Promise<{ resumes: ResumeListItem[] }> {
  const res = await fetch(`${API_BASE}/resumes`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to list resumes');
  return res.json();
}

export async function createResume(token: string, data: {
  title?: string;
  templateId?: string;
  data?: unknown;
}): Promise<{ resume: ResumeListItem }> {
  const res = await fetch(`${API_BASE}/resumes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create resume');
  return res.json();
}

export async function updateResume(token: string, id: string, data: {
  title?: string;
  templateId?: string;
  data?: unknown;
}): Promise<{ resume: ResumeListItem }> {
  const res = await fetch(`${API_BASE}/resumes/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update resume');
  return res.json();
}

export async function deleteResume(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resumes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete resume');
}

export async function shareResume(token: string, id: string): Promise<{ shareToken: string }> {
  const res = await fetch(`${API_BASE}/resumes/${id}/share`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to share resume');
  return res.json();
}

export async function getSharedResume(token: string): Promise<{ resume: ResumeData }> {
  const res = await fetch(`${API_BASE}/resumes/shared/${token}`);
  if (!res.ok) throw new Error('Resume not found');
  return res.json();
}

export async function getResume(token: string, id: string): Promise<{ resume: ResumeData }> {
  const res = await fetch(`${API_BASE}/resumes/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Resume not found');
  return res.json();
}

export async function duplicateResume(token: string, id: string): Promise<{ resume: ResumeListItem }> {
  const res = await fetch(`${API_BASE}/resumes/${id}/duplicate`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to duplicate resume');
  return res.json();
}

export async function sendResumeEmail(token: string, to: string, subject: string, html: string): Promise<void> {
  const res = await fetch(`${API_BASE}/email/send-resume`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ to, subject, html }),
  });
  if (!res.ok) throw new Error('Failed to send email');
}

export interface TrashResumeItem {
  id: string;
  title: string;
  templateId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

export async function listTrash(token: string): Promise<{ resumes: TrashResumeItem[] }> {
  const res = await fetch(`${API_BASE}/resumes/trash`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to list trash');
  return res.json();
}

export async function restoreResume(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resumes/trash/${id}/restore`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to restore resume');
}

export async function permanentDeleteResume(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/resumes/trash/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to permanently delete resume');
}
