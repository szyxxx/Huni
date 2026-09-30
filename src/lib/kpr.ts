export type KprInput = {
  price: number;
  downPaymentPercent: number;
  tenorYears: number;
  ratePercent: number;
};

export type KprResult = {
  downPaymentAmount: number;
  loanAmount: number;
  monthlyInstallment: number;
  totalPayment: number;
};

/** Standard fixed-rate annuity estimate. Output is an estimate, not an offer or approval. */
export function calculateKpr({ price, downPaymentPercent, tenorYears, ratePercent }: KprInput): KprResult {
  const downPaymentAmount = Math.round(price * (downPaymentPercent / 100));
  const loanAmount = Math.max(price - downPaymentAmount, 0);
  const monthlyRate = ratePercent / 100 / 12;
  const months = Math.max(tenorYears * 12, 1);

  let monthlyInstallment: number;
  if (monthlyRate === 0) {
    monthlyInstallment = loanAmount / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyInstallment = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  return {
    downPaymentAmount,
    loanAmount,
    monthlyInstallment: Math.round(monthlyInstallment),
    totalPayment: Math.round(monthlyInstallment * months + downPaymentAmount),
  };
}

export type TakeOverInput = {
  remainingPrincipal: number;
  remainingTenorYears: number;
  currentInstallment: number;
  newRatePercent: number;
};

export type TakeOverResult = {
  newInstallment: number;
  monthlySavings: number;
  totalSavings: number;
};

/** Take-over KPR estimator (PRD §14): refinance the remaining balance at a new rate assumption. */
export function calculateTakeOver({
  remainingPrincipal,
  remainingTenorYears,
  currentInstallment,
  newRatePercent,
}: TakeOverInput): TakeOverResult {
  const { monthlyInstallment: newInstallment } = calculateKpr({
    price: remainingPrincipal,
    downPaymentPercent: 0,
    tenorYears: remainingTenorYears,
    ratePercent: newRatePercent,
  });
  const monthlySavings = currentInstallment - newInstallment;
  const totalSavings = monthlySavings * remainingTenorYears * 12;
  return { newInstallment, monthlySavings, totalSavings };
}

export type BankProgram = {
  id: string;
  bankName: string;
  badge?: string;
  fixRatePercent: number;
  fixYears: number;
  minTenorYears: number;
  maxTenorYears: number;
  /** Estimated floating-rate assumption after the fix period — banks don't publish this far out, so it's a clearly-labeled estimate. */
  estimatedFloatingRatePercent: number;
};

/**
 * Illustrative bank programs — no real bank partnerships exist yet, so
 * these are seed data for the simulator, not live offers. Rates/tenors
 * are representative of typical Indonesian KPR structures (a fixed
 * "promo" rate for the first few years, then floating), not sourced
 * from any actual bank. Move to a Supabase table once real programs
 * are available so they can be updated without a code change.
 */
export const BANK_PROGRAMS: BankProgram[] = [
  { id: 'btn-fix25', bankName: 'BTN', badge: 'Proses Cepat', fixRatePercent: 2.65, fixYears: 3, minTenorYears: 5, maxTenorYears: 30, estimatedFloatingRatePercent: 12 },
  { id: 'bca-fix3', bankName: 'BCA', fixRatePercent: 3.5, fixYears: 2, minTenorYears: 5, maxTenorYears: 25, estimatedFloatingRatePercent: 11 },
  { id: 'mandiri-fix5', bankName: 'Bank Mandiri', badge: 'Populer', fixRatePercent: 4.75, fixYears: 5, minTenorYears: 5, maxTenorYears: 20, estimatedFloatingRatePercent: 10.5 },
  { id: 'bni-griya', bankName: 'BNI', fixRatePercent: 5.25, fixYears: 3, minTenorYears: 5, maxTenorYears: 25, estimatedFloatingRatePercent: 11.5 },
];

/** Rough all-in estimate for provisi/asuransi/notaris etc. — always labeled as an estimate, never a quote. */
export const OTHER_COST_RATE = 0.06;

export type BankProgramInput = {
  price: number;
  downPaymentPercent: number;
  tenorYears: number;
  program: BankProgram;
};

export type BankProgramResult = {
  downPaymentAmount: number;
  loanAmount: number;
  fixInstallment: number;
  floatingInstallment: number;
  remainingPrincipalAfterFix: number;
  estimatedOtherCosts: number;
  firstPaymentTotal: number;
  totalEstimatedInterest: number;
};

/**
 * Fix-then-floating amortization: the fixed-rate installment is computed
 * over the FULL tenor (as banks quote it), paid for `fixYears`, then the
 * remaining balance is re-amortized at the floating-rate assumption over
 * the remaining tenor — not one flat annuity for the whole loan.
 */
export function calculateBankProgram({ price, downPaymentPercent, tenorYears, program }: BankProgramInput): BankProgramResult {
  const downPaymentAmount = Math.round(price * (downPaymentPercent / 100));
  const loanAmount = Math.max(price - downPaymentAmount, 0);
  const totalMonths = Math.max(tenorYears * 12, 1);
  const fixMonths = Math.min(program.fixYears * 12, totalMonths);

  const fixMonthlyRate = program.fixRatePercent / 100 / 12;
  const fixFactor = Math.pow(1 + fixMonthlyRate, totalMonths);
  const fixInstallment = fixMonthlyRate === 0
    ? loanAmount / totalMonths
    : (loanAmount * fixMonthlyRate * fixFactor) / (fixFactor - 1);

  // Walk the fix-period schedule month by month to find the true
  // remaining balance (interest first, principal from the remainder).
  let balance = loanAmount;
  let interestPaid = 0;
  for (let m = 0; m < fixMonths; m++) {
    const interest = balance * fixMonthlyRate;
    const principal = Math.min(fixInstallment - interest, balance);
    balance -= principal;
    interestPaid += interest;
  }
  const remainingPrincipalAfterFix = Math.max(balance, 0);
  const remainingMonths = Math.max(totalMonths - fixMonths, 1);

  let floatingInstallment = 0;
  if (remainingPrincipalAfterFix > 0 && remainingMonths > 0) {
    const floatMonthlyRate = program.estimatedFloatingRatePercent / 100 / 12;
    const floatFactor = Math.pow(1 + floatMonthlyRate, remainingMonths);
    floatingInstallment = floatMonthlyRate === 0
      ? remainingPrincipalAfterFix / remainingMonths
      : (remainingPrincipalAfterFix * floatMonthlyRate * floatFactor) / (floatFactor - 1);

    let floatBalance = remainingPrincipalAfterFix;
    for (let m = 0; m < remainingMonths; m++) {
      const interest = floatBalance * floatMonthlyRate;
      const principal = Math.min(floatingInstallment - interest, floatBalance);
      floatBalance -= principal;
      interestPaid += interest;
    }
  }

  const estimatedOtherCosts = Math.round(loanAmount * OTHER_COST_RATE);

  return {
    downPaymentAmount,
    loanAmount,
    fixInstallment: Math.round(fixInstallment),
    floatingInstallment: Math.round(floatingInstallment),
    remainingPrincipalAfterFix: Math.round(remainingPrincipalAfterFix),
    estimatedOtherCosts,
    firstPaymentTotal: downPaymentAmount + Math.round(fixInstallment) + estimatedOtherCosts,
    totalEstimatedInterest: Math.round(interestPaid),
  };
}

/** Inverse: comfortable monthly installment -> affordable price envelope, for affordability-first search. */
export function affordablePriceFromInstallment(
  monthlyInstallment: number,
  downPaymentPercent: number,
  tenorYears: number,
  ratePercent: number
): number {
  const monthlyRate = ratePercent / 100 / 12;
  const months = Math.max(tenorYears * 12, 1);
  let loanAmount: number;
  if (monthlyRate === 0) {
    loanAmount = monthlyInstallment * months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    loanAmount = (monthlyInstallment * (factor - 1)) / (monthlyRate * factor);
  }
  const price = loanAmount / (1 - downPaymentPercent / 100);
  return Math.round(price);
}
