import React, { useMemo, useState } from 'react';
import { DEFAULT_FINANCIAL_CONFIG } from './financialConfig';
import {
  calculateAggregateExposure,
  calculatePotentialLoss,
  calculateExpectedExposure,
  getRiskLevel,
  formatCurrency,
} from './financialCalculations';

const BRAND = {
  navy: '#102f4f',
  blue: '#1867a5',
  blueSoft: '#eaf3fb',
  ink: '#152235',
  muted: '#637185',
  line: '#dce4ed',
  danger: '#a72d37',
  dangerSoft: '#fff0f1',
  warning: '#9a6700',
  success: '#1f7654',
};

const RISK_DOMAINS = [
  { key: 'work life', label: 'Work-Life Balance' },
  { key: 'schedule', label: 'Scheduling' },
  { key: 'finances', label: 'Communication' }, // placeholder mapping note below
  { key: 'family', label: 'Family' },
];
// NOTE: the current scoring API only returns finances / work life / schedule
// / family as categoryScores (see mapResults on the backend). Communication,
// Experience, and Attendance are listed in the spec's required fields but
// are not yet produced by /enrich. They're rendered as "Not available" below
// rather than invented from unrelated categories.

function getPrimaryDomains(employee) {
  const scores = employee?.categoryScores || {};
  return Object.entries(scores)
    .filter(([, score]) => score >= 5)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

/**
 * Staff Retention Financial Impact Dashboard.
 *
 * Props:
 *  - employees: array of employee result objects (same shape as `result` /
 *    `filteredResult` in UploadFile.jsx)
 *  - config: optional override of the financial assumptions config table
 *  - isExecutiveView: when true, employee names are masked. This should be
 *    wired to the signed-in user's role/permissions once that field exists
 *    on the backend (see engineering note in FinancialImpactDashboard.jsx).
 *    Defaults to false so nothing is silently hidden today.
 */
export default function FinancialImpactDashboard({
  employees = [],
  config: configProp = DEFAULT_FINANCIAL_CONFIG,
  isExecutiveView = false,
}) {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [jobClassFilter, setJobClassFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [selectedEmployeeIdx, setSelectedEmployeeIdx] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // ─── Calculation settings (developer-testing overrides) ──────────────────
  // Mirrors the editable inputs in the static HTML reference: lets engineers
  // sanity-check the KPI math against different assumptions without touching
  // the underlying config table. These are explicitly dev/test controls —
  // production values should come from an audited configuration table.
  const [highRiskOverride, setHighRiskOverride] = useState(
    configProp.benchmarkHighRiskEmployees ?? 318
  );
  const [replacementMinOverride, setReplacementMinOverride] = useState(
    configProp.benchmarkReplacementCostMin ?? 56300
  );
  const [replacementMaxOverride, setReplacementMaxOverride] = useState(
    configProp.benchmarkReplacementCostMax ?? 60000
  );

  // Feed the overrides into the config object used for every calculation
  // below, so adjusting a setting actually changes the KPI cards and lists —
  // not just cosmetic display.
  const config = useMemo(() => {
    const min = Math.max(0, Number(replacementMinOverride) || 0);
    const max = Math.max(min, Number(replacementMaxOverride) || min);
    return {
      ...configProp,
      benchmarkReplacementCostMin: min,
      benchmarkReplacementCostMax: max,
    };
  }, [configProp, replacementMinOverride, replacementMaxOverride]);

  const highRiskEmployeesOverride = Math.max(0, Number(highRiskOverride) || 0);

  const calculatedAt = useMemo(() => new Date(), [employees]);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department).filter(Boolean))].sort(),
    [employees]
  );
  const jobClasses = useMemo(
    () => [...new Set(employees.map((e) => e.jobClass).filter(Boolean))].sort(),
    [employees]
  );


  
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (departmentFilter !== 'all' && emp.department !== departmentFilter) return false;
      if (jobClassFilter !== 'all' && emp.jobClass !== jobClassFilter) return false;
    //   if (riskFilter !== 'all') {
    //     const level = getRiskLevel(emp.totalScore || 0, config).toLowerCase();
    //     if (level !== riskFilter) return false;
    //   }

    if (riskFilter !== 'all') {
        const level = getRiskLevel(emp.retentionScore ?? 0, config).toLowerCase();
        if (level !== riskFilter) return false;
      }
      if (domainFilter !== 'all') {
        const domains = getPrimaryDomains(emp);
        if (!domains.includes(domainFilter)) return false;
      }
      return true;
    });
  }, [employees, departmentFilter, jobClassFilter, riskFilter, domainFilter, config]);

  // ─── Primary intervention signals ─────────────────────────────────────────
  // Only domains the /enrich API actually produces (work life, schedule) get
  // a computed average; Attendance, Communication, and Experience are listed
  // per the spec's required fields but aren't yet produced by the backend,
  // so they're shown as "Not available" rather than invented.
  const interventionSignals = useMemo(() => {
    const domainDefs = [
      { key: 'work life', label: 'Work-Life Balance', available: true },
      { key: null, label: 'Attendance', available: false },
      { key: null, label: 'Communication', available: false },
      { key: null, label: 'Experience', available: false },
      { key: 'schedule', label: 'Scheduling', available: true },
    ];

    const pool = filteredEmployees.length > 0 ? filteredEmployees : employees;

    const averages = domainDefs.map((d) => {
      if (!d.available) return { ...d, avg: null };
      const scores = pool
        .map((e) => e?.categoryScores?.[d.key])
        .filter((v) => typeof v === 'number' && !Number.isNaN(v));
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      return { ...d, avg };
    });

    const maxAvg = Math.max(
      ...averages.filter((d) => d.avg !== null).map((d) => d.avg),
      -Infinity
    );

    return averages.map((d) => ({
      ...d,
      status:
        d.avg === null
          ? 'Not available'
          : d.avg === maxAvg
          ? 'Largest decline'
          : 'Monitor',
      priority: d.avg !== null && d.avg === maxAvg,
    }));
  }, [filteredEmployees, employees]);

  const aggregate = useMemo(
    () => calculateAggregateExposure(filteredEmployees, config),
    [filteredEmployees, config]
  );



  const highRiskEnriched = useMemo(() => {
    console.log('DEBUG aggregate.enriched:', aggregate.enriched.map(e => ({
      name: e.employee.name,
      totalScore: e.employee.totalScore,
      riskLevel: e.riskLevel,
    })));
    console.log('DEBUG config.riskThresholds:', config.riskThresholds);
    return aggregate.enriched
      .filter((e) => e.riskLevel === 'High')
      .sort((a, b) => b.potentialLoss.total - a.potentialLoss.total);
  }, [aggregate, config]);



  const selectedEmployee = selectedEmployeeIdx !== null ? highRiskEnriched[selectedEmployeeIdx] : highRiskEnriched[0];

  const clearFilters = () => {
    setDepartmentFilter('all');
    setJobClassFilter('all');
    setRiskFilter('all');
    setDomainFilter('all');
  };

  const anyFilterActive = [departmentFilter, jobClassFilter, riskFilter, domainFilter].some((v) => v !== 'all');

  return (
    <div style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", color: BRAND.ink }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>
            Staff Retention Financial Impact
          </h2>
          <p className="text-sm mt-1" style={{ color: BRAND.muted }}>
            Connect workforce risk to replacement cost, operational exposure, and manager action.
          </p>
        </div>
        <div className="text-xs text-right" style={{ color: BRAND.muted }}>
          Calculated {calculatedAt.toLocaleString('en-US')}
          <br />
          Config v{config.version}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f4f7fa', border: `1px solid ${BRAND.line}` }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FilterSelect label="Department" value={departmentFilter} onChange={setDepartmentFilter} options={departments} allLabel="All departments" />
          <FilterSelect label="Job class" value={jobClassFilter} onChange={setJobClassFilter} options={jobClasses} allLabel="All job classes" />
          <FilterSelect
            label="Risk level"
            value={riskFilter}
            onChange={setRiskFilter}
            options={['high', 'medium', 'low']}
            optionLabels={{ high: 'High risk', medium: 'Medium risk', low: 'Low risk' }}
            allLabel="All risk levels"
          />
          <FilterSelect
            label="Primary risk domain"
            value={domainFilter}
            onChange={setDomainFilter}
            options={['finances', 'work life', 'schedule', 'family']}
            optionLabels={{ finances: 'Finances', 'work life': 'Work Life', schedule: 'Schedule', family: 'Family' }}
            allLabel="All domains"
          />
        </div>
        {anyFilterActive && (
          <button onClick={clearFilters} className="mt-3 text-sm font-medium" style={{ color: BRAND.blue }}>
            Clear all filters
          </button>
        )}
        <p className="text-xs mt-3" style={{ color: BRAND.muted }}>
          Location, manager, and tenure-range filters require fields not yet present on employee records returned by the API — add them here once available.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Employees analyzed" value={aggregate.employeesAnalyzed.toLocaleString('en-US')} note="Current staff population" />
        <KpiCard
          danger
          label="High-risk employees"
          value={aggregate.highRiskCount.toLocaleString('en-US')}
          note={`${aggregate.highRiskPercent.toFixed(1).replace('.0', '')}% need manager attention within ${config.actionWindowDays} days`}
        />
        <KpiCard
          label="Avg. loss per employee exit"
          value={formatCurrency(aggregate.avgLossPerExit)}
          note="Across filtered employees"
        />
        <KpiCard
          danger
          label="High-risk financial exposure"
          value={formatCurrency(aggregate.highRiskExposureTotal)}
          note="Scenario if every flagged employee exits"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-4 items-start">
      <div>
          {/* Selected employee financial impact */}
          {!selectedEmployee && (
            <Card>
              <h3 className="font-bold text-base">Financial impact of selected high-risk employee</h3>
              <p className="text-xs mt-1" style={{ color: BRAND.muted }}>
                Use role-specific client data when available. Industry benchmarks are clearly labeled below.
              </p>
              <p className="text-sm mt-4" style={{ color: BRAND.muted }}>
                No high-risk employee selected — connect employee-level records, or adjust filters to include at least one high-risk employee.
              </p>
            </Card>
          )}
          {selectedEmployee && (
            <Card>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-base">Financial impact of selected high-risk employee</h3>
                  <p className="text-xs mt-1" style={{ color: BRAND.muted }}>
                    Use role-specific client data when available. Industry benchmarks are clearly labeled below.
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap"
                  style={{ backgroundColor: BRAND.dangerSoft, color: BRAND.danger }}
                >
                  HIGH RISK
                </span>
              </div>

              <div className="mb-1 text-sm font-medium">
                {isExecutiveView ? `Employee #${selectedEmployee.employee.employeeNumber || 'N/A'}` : (selectedEmployee.employee.name || 'Unknown')}
                <span style={{ color: BRAND.muted }}> · {selectedEmployee.employee.department || 'N/A'} · {selectedEmployee.employee.jobClass || 'N/A'}</span>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end py-4 my-2"
                style={{ borderTop: `1px solid ${BRAND.line}`, borderBottom: `1px solid ${BRAND.line}` }}
              >
                <div>
                  <div className="text-xs" style={{ color: BRAND.muted }}>Potential loss if this employee leaves</div>
                  <div className="text-2xl font-bold mt-1" style={{ color: BRAND.danger, letterSpacing: '-0.03em' }}>
                    {formatCurrency(selectedEmployee.potentialLoss.total)}
                  </div>
                </div>
                <div className="text-xs text-left sm:text-right font-semibold" style={{ color: BRAND.danger }}>
                  Potential loss<br />Not probability-weighted
                </div>
              </div>

              <div className="grid gap-2 py-2">
                <CostRow label="Replacement and recruiting cost" comp={selectedEmployee.potentialLoss.components.replacement} />
                <CostRow label="Vacancy cost" comp={selectedEmployee.potentialLoss.components.vacancy} />
                <CostRow label="Overtime or contract labor" comp={selectedEmployee.potentialLoss.components.overtime} />
                <CostRow label="Productivity disruption" comp={selectedEmployee.potentialLoss.components.productivity} />
              </div>

              <div className="mt-3 p-3 rounded-lg text-xs leading-relaxed" style={{ backgroundColor: BRAND.blueSoft, color: '#173d61' }}>
                <strong>Potential loss</strong> = replacement + vacancy + overtime/contract labor + productivity disruption<br />
                <strong>Expected financial exposure</strong> = calibrated exit probability × potential loss
                {selectedEmployee.expectedExposure !== null ? (
                  <div className="mt-1 font-semibold">= {formatCurrency(selectedEmployee.expectedExposure)}</div>
                ) : (
                  <div className="mt-1" style={{ color: BRAND.muted }}>Not shown — no validated calibrated exit probability for this employee.</div>
                )}
              </div>
            </Card>
          )}

          {/* Employee-level table */}
          <Card className="mt-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-bold text-base">High-risk employee action list</h3>
                <p className="text-xs mt-1" style={{ color: BRAND.muted }}>
                  {isExecutiveView ? 'Names hidden in executive view.' : 'Click a row for the full financial and risk breakdown.'}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: BRAND.muted, textAlign: 'left' }}>
                    <th className="py-2 pr-3 font-semibold">Employee ID</th>
                    <th className="py-2 pr-3 font-semibold">Department</th>
                    <th className="py-2 pr-3 font-semibold">Job class</th>
                    <th className="py-2 pr-3 font-semibold">Right Fit</th>
                    <th className="py-2 pr-3 font-semibold">Retention Delta</th>
                    <th className="py-2 pr-3 font-semibold">Risk</th>
                    <th className="py-2 pr-3 font-semibold">Potential loss</th>
                    <th className="py-2 pr-3 font-semibold">Action status</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskEnriched.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-6" style={{ color: BRAND.muted }}>
                        No high-risk employees in the current filter.
                      </td>
                    </tr>
                  )}
                  {highRiskEnriched.map((e, idx) => (
                    <React.Fragment key={e.employee.employeeNumber || idx}>
                      <tr
                        style={{ borderBottom: `1px solid ${BRAND.line}`, cursor: 'pointer' }}
                        onClick={() => { setSelectedEmployeeIdx(idx); setExpandedRow(expandedRow === idx ? null : idx); }}
                      >
                        <td className="py-2 pr-3">{e.employee.employeeNumber || 'N/A'}</td>
                        <td className="py-2 pr-3">{e.employee.department || 'N/A'}</td>
                        <td className="py-2 pr-3">{e.employee.jobClass || 'N/A'}</td>
                        <td className="py-2 pr-3">{e.employee.rightFitCandidate ? 'Yes' : 'No'}</td>
                        <td className="py-2 pr-3">
                          {(e.employee.retentionScore || 0) >= 0 ? `+${e.employee.retentionScore}%` : `${e.employee.retentionScore}%`}
                        </td>
                        <td className="py-2 pr-3">
                          <span className="font-semibold" style={{ color: BRAND.danger }}>High</span>
                        </td>
                        <td className="py-2 pr-3 font-semibold">{formatCurrency(e.potentialLoss.total)}</td>
                        <td className="py-2 pr-3" style={{ color: BRAND.muted }}>Not started</td>
                      </tr>
                      {expandedRow === idx && (
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <td colSpan={8} className="p-3">
                            <div className="text-xs mb-2" style={{ color: BRAND.muted }}>
                              Primary risk domains: {getPrimaryDomains(e.employee).join(', ') || 'None'}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <BreakdownCell label="Replacement" comp={e.potentialLoss.components.replacement} />
                              <BreakdownCell label="Vacancy" comp={e.potentialLoss.components.vacancy} />
                              <BreakdownCell label="Overtime" comp={e.potentialLoss.components.overtime} />
                              <BreakdownCell label="Productivity" comp={e.potentialLoss.components.productivity} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          {/* Risk concentration */}
          <Card>
            <h3 className="font-bold text-base mb-1">Workforce risk concentration</h3>
            <p className="text-xs mb-3" style={{ color: BRAND.muted }}>Current high-risk population requiring manager attention.</p>
            <div className="relative h-4 rounded-full overflow-hidden my-3" style={{ backgroundColor: '#edf1f5' }}>
              <div
                className="h-full"
                style={{ width: `${Math.min(100, aggregate.highRiskPercent)}%`, backgroundColor: BRAND.danger }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: BRAND.muted }}>
              <span><strong>{aggregate.highRiskCount.toLocaleString('en-US')}</strong> high risk</span>
              <span>{aggregate.highRiskPercent.toFixed(1).replace('.0', '')}% of staff</span>
            </div>
          </Card>

          {/* Primary intervention signals */}
          <Card className="mt-4">
            <h3 className="font-bold text-base mb-1">Primary intervention signals</h3>
            <p className="text-xs mb-3" style={{ color: BRAND.muted }}>
              Show the risk drivers beside the dollars so managers know where to intervene.
            </p>
            <div className="grid gap-3">
              {interventionSignals.map((d) => (
                <div key={d.label} className="flex justify-between items-center text-sm">
                  <span>{d.label}</span>
                  <span
                    className="text-xs"
                    style={{
                      color: d.priority ? BRAND.warning : BRAND.muted,
                      fontWeight: d.priority ? 700 : 400,
                    }}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

         

          {/* Exposure by department */}
          <Card className="mt-4">
            <h3 className="font-bold text-base mb-3">Exposure by department</h3>
            <ExposureList groups={aggregate.byDept} />
          </Card>

          {/* Exposure by job class */}
          <Card className="mt-4">
            <h3 className="font-bold text-base mb-3">Exposure by job class</h3>
            <ExposureList groups={aggregate.byJobClass} />
          </Card>

          {/* Calculation settings (dev-testing overrides) */}
          <Card className="mt-4">
            <h3 className="font-bold text-base mb-1">Calculation settings</h3>
            <p className="text-xs mb-3" style={{ color: BRAND.muted }}>
              These values are configurable for developer testing. Production values should come from an audited configuration table.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SettingInput
                label="High-risk employees"
                value={highRiskOverride}
                onChange={setHighRiskOverride}
                min={0}
                step={1}
              />
              <SettingInput
                label="Minimum replacement cost"
                value={replacementMinOverride}
                onChange={setReplacementMinOverride}
                min={0}
                step={100}
              />
              <SettingInput
                label="Maximum replacement cost"
                value={replacementMaxOverride}
                onChange={setReplacementMaxOverride}
                min={0}
                step={100}
              />
            </div>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <h3 className="font-bold text-base mb-3">Understanding this dashboard</h3>
            <LegendItem title="Risk level">
              Based on Retention Delta: High = retention score ≤ {config.riskThresholds.high}, Medium = retention score ≤ {config.riskThresholds.medium}, Low = above that.
            </LegendItem>
            <LegendItem title="Right Fit">
              Whether the employee's profile aligns well with their role, from the existing sentiment model.
            </LegendItem>
            <LegendItem title="Retention Delta">
              Estimated percentage change in retention likelihood vs. baseline. It is a model score, not a probability of leaving.
            </LegendItem>
            <LegendItem title="Financial values">
              Green/labeled "client-specific" figures come from actual client data on the employee record; unlabeled or "benchmark" figures use the {config.benchmarkReplacementCostLabel.toLowerCase()} of {formatCurrency(config.benchmarkReplacementCostMin)}–{formatCurrency(config.benchmarkReplacementCostMax)}.
            </LegendItem>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: BRAND.warning }}>
              <strong>Calculation safeguard:</strong> Retention Delta and risk level are never treated as an exit probability. Expected financial exposure is only shown for employees with a validated, calibrated exit probability.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Small presentational helpers ──────────────────────────────────────────

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl p-4 sm:p-5 bg-white ${className}`} style={{ border: `1px solid ${BRAND.line}`, boxShadow: '0 8px 24px rgba(16,47,79,0.07)' }}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, note, danger }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: `1px solid ${BRAND.line}`,
        boxShadow: '0 8px 24px rgba(16,47,79,0.07)',
        backgroundColor: danger ? BRAND.dangerSoft : '#fff',
      }}
    >
      <div className="text-xs" style={{ color: BRAND.muted }}>{label}</div>
      <div className="text-2xl font-bold my-1" style={{ color: danger ? BRAND.danger : BRAND.ink, letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div className="text-xs leading-snug" style={{ color: BRAND.muted }}>{note}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, allLabel, optionLabels }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: BRAND.muted }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{ border: `1px solid ${BRAND.line}` }}
      >
        <option value="all">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{optionLabels ? optionLabels[opt] : opt}</option>
        ))}
      </select>
    </div>
  );
}

function SettingInput({ label, value, onChange, min = 0, step = 1 }) {
  return (
    <label className="grid gap-1 text-xs" style={{ color: BRAND.muted }}>
      {label}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm"
        style={{ border: `1px solid ${BRAND.line}`, background: '#fff', color: BRAND.ink }}
      />
    </label>
  );
}

function CostRow({ label, comp }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-4 items-center py-1.5">
      <strong className="text-sm">{label}</strong>
      <span className="text-xs sm:text-right" style={{ color: comp.source === 'unavailable' ? BRAND.muted : BRAND.ink }}>
        {comp.source === 'unavailable' ? comp.label : `${formatCurrency(comp.value)} — ${comp.label}`}
      </span>
    </div>
  );
}

function BreakdownCell({ label, comp }) {
  return (
    <div className="bg-white rounded-lg p-2 text-center" style={{ border: `1px solid ${BRAND.line}` }}>
      <div className="text-xs" style={{ color: BRAND.muted }}>{label}</div>
      <div className="text-sm font-bold mt-1">{formatCurrency(comp.value)}</div>
      <div className="text-[10px] mt-0.5" style={{ color: comp.source === 'client' ? BRAND.success : BRAND.muted }}>
        {comp.source === 'client' ? 'Client data' : comp.source === 'benchmark' ? 'Benchmark' : 'N/A'}
      </div>
    </div>
  );
}

function ExposureList({ groups }) {
  if (!groups || groups.length === 0) {
    return <p className="text-xs" style={{ color: BRAND.muted }}>No data for current filter.</p>;
  }
  const max = Math.max(...groups.map((g) => g.exposure), 1);
  return (
    <div className="grid gap-3">
      {groups.slice(0, 8).map((g) => (
        <div key={g.key}>
          <div className="flex justify-between text-xs mb-1">
            <span>{g.key}</span>
            <span className="font-semibold">{formatCurrency(g.exposure)}</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#edf1f5' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${(g.exposure / max) * 100}%`, backgroundColor: BRAND.blue }} />
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: BRAND.muted }}>
            {g.count} employees · {g.highRiskCount} high risk
          </div>
        </div>
      ))}
    </div>
  );
}

function LegendItem({ title, children }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold mb-0.5">{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: BRAND.muted }}>{children}</p>
    </div>
  );
}