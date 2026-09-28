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
