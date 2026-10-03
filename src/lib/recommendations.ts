import type { Property } from '../data/properties';
import type { FilterState, KprScenario } from '../store/useAppStore';
import type { StringKey } from './i18n';

export type FitReason = { text: string; kind: 'budget' | 'commute' | 'preference' | 'trust' };

type Translate = (key: StringKey) => string;

/**
 * Explainable "why this may fit you" reasons (PRD §12): built from actual user
 * state (saved KPR scenarios, active filters), never a hidden composite score.
 * `t` is passed in (rather than using the useTranslate hook) since this is a
 * plain function called from render logic, not a component.
 */
export function getFitReasons(
  property: Property,
  ctx: { filters: FilterState; kprScenarios: KprScenario[] },
  t: Translate
): FitReason[] {
  const reasons: FitReason[] = [];

  if (property.estimatedInstallment && ctx.kprScenarios.length) {
    const bestBudget = Math.max(...ctx.kprScenarios.map((s) => s.monthlyInstallment));
    if (property.estimatedInstallment <= bestBudget) {
      reasons.push({ text: t('fitBudgetKpr'), kind: 'budget' });
    }
  }

  if (ctx.filters.maxInstallment && property.estimatedInstallment && property.estimatedInstallment <= ctx.filters.maxInstallment) {
    reasons.push({ text: t('fitBudgetFilter'), kind: 'budget' });
  }

  if (ctx.filters.bedrooms && property.bedrooms && property.bedrooms >= ctx.filters.bedrooms) {
    reasons.push({ text: `${t('fitBedroomsPrefix')} ${ctx.filters.bedrooms}+ ${t('fitBedroomsSuffix')}`, kind: 'preference' });
  }

  if (ctx.filters.types.includes(property.type)) {
    reasons.push({ text: t('fitTypeMatch'), kind: 'preference' });
  }

  const closeNearby = property.nearby?.find((n) => n.minutes <= 15);
  if (closeNearby) {
    reasons.push({ text: `${closeNearby.minutes} ${t('minutesUnit')} ${t('fromPrefix')} ${closeNearby.label.toLowerCase()}`, kind: 'commute' });
  }

  if (property.advertiser.connected && (property.verification === 'official_developer' || property.verification === 'verified_agency')) {
    reasons.push({ text: t('fitVerifiedAdvertiser'), kind: 'trust' });
  }

  if (reasons.length === 0 && property.fitReason) {
    reasons.push({ text: property.fitReason, kind: 'preference' });
  }

  return reasons;
}
