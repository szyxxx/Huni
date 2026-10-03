import { supabase } from './supabase';
import { normalizeContactPhone, parseProjectInquiry, type ProjectInquiry } from './projectInquiryFormat';
import { deleteDemoInterest, readDemoInterest, writeDemoInterest } from './demoInterestStorage';

export type { InquiryKind, ProjectInquiry } from './projectInquiryFormat';

type InquiryDetails = Omit<ProjectInquiry, 'id' | 'createdAt'>;

function validatedDetails(details: InquiryDetails): InquiryDetails {
  const contactPhone = normalizeContactPhone(details.contactPhone);
  if (!contactPhone) throw new Error('Masukkan nomor WhatsApp yang valid.');
  const contactName = details.contactName.trim();
  if (contactName.length < 2 || contactName.length > 100) throw new Error('Masukkan nama lengkap.');
  return { ...details, contactName, contactPhone };
}

function demoKey(projectId: string) {
  return `huni.demo-project-inquiry.${projectId}`;
}

function legacyDemoKey(projectId: string) {
  return `huni:demo-project-inquiry:${projectId}`;
}

export async function saveDemoProjectInquiry(details: InquiryDetails): Promise<ProjectInquiry> {
  const normalized = validatedDetails(details);
  const saved = { ...normalized, id: `demo-${Date.now()}`, createdAt: new Date().toISOString() };
  await writeDemoInterest(demoKey(details.projectId), JSON.stringify(saved));
  return saved;
}

export async function getDemoProjectInquiry(projectId: string): Promise<ProjectInquiry | null> {
  const saved = await readDemoInterest(demoKey(projectId), legacyDemoKey(projectId));
  if (!saved) return null;
  try {
    return JSON.parse(saved) as ProjectInquiry;
  } catch {
    return null;
  }
}

export async function clearDemoProjectInquiry(projectId: string): Promise<void> {
  await deleteDemoInterest(demoKey(projectId), legacyDemoKey(projectId));
}

export async function createProjectInquiry(details: InquiryDetails, userId: string): Promise<ProjectInquiry> {
  if (!supabase) throw new Error('Koneksi Huni belum tersedia.');
  const normalized = validatedDetails(details);
  const note = JSON.stringify({ version: 1, unitName: normalized.unitName, kind: normalized.kind, contactName: normalized.contactName, contactPhone: normalized.contactPhone });
  const { data, error } = await supabase.from('leads').insert({
    project_id: details.projectId,
    user_id: userId,
    source_surface: 'project_detail',
    channel: 'project_interest',
    note,
  }).select('id, created_at').single();
  if (error || !data) throw new Error('Permintaan belum tersimpan. Coba lagi.');
  return { ...normalized, id: data.id, createdAt: data.created_at };
}

export async function getMyProjectInquiry(projectId: string, userId: string): Promise<ProjectInquiry | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('leads')
    .select('id, project_id, created_at, note')
    .eq('project_id', projectId).eq('user_id', userId).eq('channel', 'project_interest')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return parseProjectInquiry(data);
}

export async function getDeveloperInquiries(projectIds: string[]): Promise<ProjectInquiry[]> {
  if (!supabase || projectIds.length === 0) return [];
  const { data, error } = await supabase.from('leads')
    .select('id, project_id, created_at, note')
    .in('project_id', projectIds).eq('channel', 'project_interest')
    .order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map(parseProjectInquiry).filter((item): item is ProjectInquiry => item !== null);
}
