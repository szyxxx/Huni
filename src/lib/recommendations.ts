import type { Property } from '../data/properties';
import type { FilterState, KprScenario } from '../store/useAppStore';

export type FitReason = { text: string; kind: 'budget' | 'commute' | 'preference' | 'trust' };

/**
 * Explainable "why this may fit you" reasons (PRD §12): built from actual user
 * state (saved KPR scenarios, active filters), never a hidden composite score.
 */
export function getFitReasons(
  property: Property,
  ctx: { filters: FilterState; kprScenarios: KprScenario[] }
): FitReason[] {
  const reasons: FitReason[] = [];

  if (property.estimatedInstallment && ctx.kprScenarios.length) {
    const bestBudget = Math.max(...ctx.kprScenarios.map((s) => s.monthlyInstallment));
    if (property.estimatedInstallment <= bestBudget) {
      reasons.push({ text: 'Sesuai anggaran cicilan bulanan dari simulasi KPR-mu', kind: 'budget' });
    }
  }

  if (ctx.filters.maxInstallment && property.estimatedInstallment && property.estimatedInstallment <= ctx.filters.maxInstallment) {
    reasons.push({ text: 'Dalam batas cicilan maksimum yang kamu tetapkan', kind: 'budget' });
  }

  if (ctx.filters.bedrooms && property.bedrooms && property.bedrooms >= ctx.filters.bedrooms) {
    reasons.push({ text: `Sesuai preferensi ${ctx.filters.bedrooms}+ kamar tidur`, kind: 'preference' });
  }

  if (ctx.filters.types.includes(property.type)) {
    reasons.push({ text: 'Tipe properti sesuai pencarianmu', kind: 'preference' });
  }

  const closeNearby = property.nearby?.find((n) => n.minutes <= 15);
  if (closeNearby) {
    reasons.push({ text: `${closeNearby.minutes} menit dari ${closeNearby.label.toLowerCase()}`, kind: 'commute' });
  }

  if (property.verification === 'official_developer' || property.verification === 'verified_agency') {
    reasons.push({ text: 'Diiklankan oleh pihak terverifikasi', kind: 'trust' });
  }

  if (reasons.length === 0 && property.fitReason) {
    reasons.push({ text: property.fitReason, kind: 'preference' });
  }

  return reasons;
}
