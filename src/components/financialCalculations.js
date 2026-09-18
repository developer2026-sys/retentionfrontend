import { hasClientValue } from './financialConfig';

// ─── Per-employee financial calculations ───────────────────────────────────
//
// Reads financial inputs from `employee.financials` if the backend supplies
// them (see field names below). Falls back to config-table benchmarks when
// a client-specific value isn't available, and flags which was used so the
// UI can label benchmark vs. actual data per the "never blend unlabeled"
// rule.
//
// Expected (optional) shape of employee.financials, once the backend adds
// it:
//   {
//     replacementCost: number,       // role-specific replacement cost ($)
//     vacancyDays: number,           // average vacancy days for this role
//     dailyLoadedLaborCost: number,  // $ per day
//     overtimeOrContractCost: number,// $ actual overtime/contract-labor cost
//     productivityDisruptionCost: number, // $ if client has an actual figure
//     annualSalary: number,          // loaded labor cost, for benchmark %s
//     calibratedExitProbability: number, // 0–1, ONLY if model is validated
//   }

export function getReplacementCost(employee, config) {
  const f = employee?.financials || {};
  if (hasClientValue(f.replacementCost)) {
    return { value: f.replacementCost, source: 'client', label: 'Client-specific role cost' };
  }
  // Benchmark is a range; return midpoint for point calculations, but
  // callers that need the range should read config directly.
  const mid = (config.benchmarkReplacementCostMin + config.benchmarkReplacementCostMax) / 2;
  return { value: mid, source: 'benchmark', label: config.benchmarkReplacementCostLabel };
}

export function getVacancyCost(employee) {
  const f = employee?.financials || {};
  if (hasClientValue(f.vacancyDays) && hasClientValue(f.dailyLoadedLaborCost)) {
    return {
      value: f.vacancyDays * f.dailyLoadedLaborCost,
      source: 'client',
      label: `${f.vacancyDays} vacancy days × $${f.dailyLoadedLaborCost}/day`,
    };
  }
  return { value: 0, source: 'unavailable', label: 'Vacancy data not available' };
}

export function getOvertimeCost(employee) {
  const f = employee?.financials || {};
  if (hasClientValue(f.overtimeOrContractCost)) {
    return { value: f.overtimeOrContractCost, source: 'client', label: 'Actual overtime/contract-labor cost' };
  }
  return { value: 0, source: 'unavailable', label: 'Overtime/contract cost not available' };
}

export function getProductivityDisruption(employee, config) {
  const f = employee?.financials || {};
  if (hasClientValue(f.productivityDisruptionCost)) {
    return { value: f.productivityDisruptionCost, source: 'client', label: 'Client-approved productivity disruption cost' };
  }
  if (hasClientValue(f.annualSalary)) {
    const value = f.annualSalary * (config.productivityDisruptionBenchmarkPercent / 100);
    return {
      value,
      source: 'benchmark',
      label: `${config.productivityDisruptionBenchmarkPercent}% of salary (benchmark)`,
    };
  }
  return { value: 0, source: 'unavailable', label: 'Productivity disruption not available' };
}

// Potential Employee Loss = Replacement + Vacancy + Overtime/Contract + Productivity Disruption
export function calculatePotentialLoss(employee, config) {
  const replacement = getReplacementCost(employee, config);
  const vacancy = getVacancyCost(employee);
  const overtime = getOvertimeCost(employee);
  const productivity = getProductivityDisruption(employee, config);

  const total = replacement.value + vacancy.value + overtime.value + productivity.value;
  const usesBenchmark = [replacement, vacancy, overtime, productivity].some((c) => c.source === 'benchmark');
  const usesClientData = [replacement, vacancy, overtime, productivity].some((c) => c.source === 'client');

  return {
    total,
    components: { replacement, vacancy, overtime, productivity },
    usesBenchmark,
    usesClientData,
  };
}

// Expected Financial Exposure = Calibrated Exit Probability × Potential Loss
// Only calculated when a validated calibrated probability exists. Retention
// Delta / risk classification must NEVER be substituted as a probability.
export function calculateExpectedExposure(employee, potentialLoss) {
  const p = employee?.financials?.calibratedExitProbability;
  if (typeof p !== 'number' || Number.isNaN(p) || p < 0 || p > 1) {
    return null; // not available — do not fabricate a probability
  }
  return p * potentialLoss.total;
}

// export function getRiskLevel(score, config) {
//   if (score >= config.riskThresholds.high) return 'High';
//   if (score >= config.riskThresholds.medium) return 'Medium';
//   return 'Low';
// }


export function getRiskLevel(retentionScore, config) {
    const score = retentionScore ?? 0;
    if (score <= config.riskThresholds.high) return 'High';
    if (score <= config.riskThresholds.medium) return 'Medium';
    return 'Low';
  }


// Aggregate dashboard-level figures across a set of employees.
// export function calculateAggregateExposure(employees, config) {
//   const enriched = employees.map((emp) => {
//     const riskLevel = getRiskLevel(emp.totalScore || 0, config);


export function calculateAggregateExposure(employees, config) {
    const enriched = employees.map((emp) => {
      const riskLevel = getRiskLevel(emp.retentionScore ?? 0, config);
    const potentialLoss = calculatePotentialLoss(emp, config);
    const expectedExposure = calculateExpectedExposure(emp, potentialLoss);
    return { employee: emp, riskLevel, potentialLoss, expectedExposure };
  });

  const highRisk = enriched.filter((e) => e.riskLevel === 'High');
  const highRiskExposureTotal = highRisk.reduce((sum, e) => sum + e.potentialLoss.total, 0);
  const avgLossPerExit = enriched.length > 0
    ? enriched.reduce((sum, e) => sum + e.potentialLoss.total, 0) / enriched.length
    : 0;

  const byDept = groupExposure(enriched, (e) => e.employee.department || 'N/A');
  const byJobClass = groupExposure(enriched, (e) => e.employee.jobClass || 'N/A');

  return {
    enriched,
    employeesAnalyzed: employees.length,
    highRiskCount: highRisk.length,
    highRiskPercent: employees.length > 0 ? (highRisk.length / employees.length) * 100 : 0,
    avgLossPerExit,
    highRiskExposureTotal,
    byDept,
    byJobClass,
  };
}

function groupExposure(enriched, keyFn) {
  const groups = {};
  enriched.forEach((e) => {
    const key = keyFn(e);
    if (!groups[key]) groups[key] = { key, count: 0, exposure: 0, highRiskCount: 0 };
    groups[key].exposure += e.potentialLoss.total;
    groups[key].count += 1;
    if (e.riskLevel === 'High') groups[key].highRiskCount += 1;
  });
  return Object.values(groups).sort((a, b) => b.exposure - a.exposure);
}

export function formatCurrency(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1).replace('.0', '')}K`;
  return `$${Math.round(value).toLocaleString('en-US')}`;
}