import { supabase, isSupabaseConfigured } from './supabase';

type LeadChannel = 'whatsapp' | 'call' | 'inquiry' | 'brochure' | 'project_interest' | 'tour_request';

type LogLeadInput = {
  propertyId?: string;
  projectId?: string;
  userId: string | null;
  sourceSurface: string;
  channel: LeadChannel;
  scheduledFor?: Date;
  note?: string;
};

/**
 * Best-effort lead log — never blocks or throws on the caller (a failed
 * insert here should not stop the WhatsApp handoff the user actually
 * wants). No-ops when Supabase isn't configured or the user is a guest
 * (leads.user_id has no anonymous/guest column yet).
 */
export async function logLead(input: LogLeadInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !input.userId) return;
  try {
    await supabase.from('leads').insert({
      property_id: input.propertyId ?? null,
      project_id: input.projectId ?? null,
      user_id: input.userId,
      source_surface: input.sourceSurface,
      channel: input.channel,
      scheduled_for: input.scheduledFor?.toISOString() ?? null,
      note: input.note ?? null,
    });
  } catch {
    // best-effort only
  }
}
