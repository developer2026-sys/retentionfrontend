// ─── Financial assumptions configuration table ─────────────────────────────
// Per dev rules: financial assumptions live here, not hardcoded in components.
// In production this should be loaded from an audited, versioned config
// table/API (e.g. GET /api/config/financial-assumptions) rather than a
// static JS file, so changes can be logged and reviewed. The shape below is
// what that endpoint should return.

export const DEFAULT_FINANCIAL_CONFIG = {
    version: '1.0.0',
    effectiveDate: null, // set by API; null here means "not yet date-stamped"
  
    // Healthcare industry benchmark replacement cost range. Used ONLY when a
    // client-specific / role-specific replacement cost is not available on
    // the employee record.
    benchmarkReplacementCostMin: 56300,
    benchmarkReplacementCostMax: 60000,
    benchmarkReplacementCostLabel: 'Industry benchmark (healthcare)',
  
    // Productivity disruption factor, applied as a percentage of the
    // employee's annual salary / loaded labor cost when a client-specific
    // productivity disruption cost isn't supplied.
    productivityDisruptionBenchmarkPercent: 18,
  
    // Risk level thresholds (applied to totalScore / retentionScore-derived
    // risk score, on the existing 0–10 scale used elsewhere in the app).
    // riskThresholds: {
    //   high: 7, // score >= 7 -> High Risk (kept consistent with getRiskLevel elsewhere)
    //   medium: 4, // score >= 4 -> Medium Risk
    // },
  
    riskThresholds: {
        high: 0,   // retentionScore <= 0  -> High Risk
        medium: 20, // retentionScore <= 20 -> Medium Risk
      },
    // Days within which a high-risk employee should receive manager action.
    actionWindowDays: 30,
  };
  
  // Helper: is this a "real" client-supplied number, or should we fall back
  // to the benchmark? Treats 0, null, undefined, NaN as "not supplied".
  export function hasClientValue(value) {
    return typeof value === 'number' && !Number.isNaN(value) && value > 0;
  }