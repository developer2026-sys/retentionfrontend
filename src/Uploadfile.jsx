import React, { useEffect, useState } from 'react';
import ConfirmationPopup from './components/ConfirmationPopup';
import PasscodePopup from './components/PasscodePopup';
import PaymentPopup from './components/PaymentPopup';
import StripePaymentPopup from './components/StripePaymentPopup';
import { BASE_URL } from './baseurl';

// ─── Apax Group brand kit ──────────────────────────────────────────────────
// Colors:  #233dff (primary blue) · #12229d (deep navy) · #000000 (near black)
// Fonts:   Anton (display) · Poppins (body)
// Tagline: "Empowering Healthcare Workforce Intelligence"
// Note: risk-status colors (#41d756 green / #fdc002 amber / #fb0000 red) are
// functional indicators, not brand colors, so they're left as-is throughout.

const BRAND = {
  primary: '#233dff',
  navy: '#12229d',
  black: '#000000',
  primaryHover: '#1c30d6',
};



const ResultsLegend = () => (
  <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
    <h3 className="text-sm font-semibold text-gray-800 mb-3">Understanding This Report</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-semibold text-gray-700 mb-1">Retention Likelihood</p>
        <p className="text-gray-600 text-xs leading-relaxed">
          Predicts whether this person is likely to stay or leave based on their score.
          <span className="block mt-1"><span className="font-medium">Promoter</span> = likely to stay · <span className="font-medium">Neutral</span> = uncertain · <span className="font-medium">Detractor</span> = at risk of leaving</span>
        </p>
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-1">Retention Delta</p>
        <p className="text-gray-600 text-xs leading-relaxed">
          The estimated percentage change in retention likelihood compared to baseline. A positive number (e.g. +20%) means improved retention odds; negative means increased flight risk.
        </p>
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-1">Right Fit</p>
        <p className="text-gray-600 text-xs leading-relaxed">
          Indicates whether the candidate/employee's profile aligns well with the role.
          <span className="block mt-1"><span className="font-medium" style={{color:'#41d756'}}>✓ Yes</span> = good fit · <span className="font-medium" style={{color:'#fb0000'}}>✗ No</span> = potential mismatch</span>
        </p>
      </div>
      <div>
        <p className="font-semibold text-gray-700 mb-1">Domains</p>
        <p className="text-gray-600 text-xs leading-relaxed">
          Risk category tags (Finances, Work Life, Schedule, Family, Job Satisfaction, General). Color shows severity: <span style={{color:'#41d756', fontWeight:600}}>green</span> = low risk, <span style={{color:'#fdc002', fontWeight:600}}>gold</span> = medium risk, <span style={{color:'#fb0000', fontWeight:600}}>red</span> = high risk.
        </p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-3">Click any row to see the full scoring breakdown, including Age, Distance, Tenure, and category-level detail.</p>
  </div>
);


const RISK_CATEGORIES = [
  { apiKey: 'finances', displayName: 'Finances' },
  { apiKey: 'work life', displayName: 'Work Life' },
  { apiKey: 'schedule', displayName: 'Schedule' },
  { apiKey: 'family', displayName: 'Family' },
  { apiKey: 'job satisfaction', displayName: 'Job Satisfaction' },
  { apiKey: 'general', displayName: 'General' },
];


function UploadFile() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState([]);
  const [landingVisible, setLandingVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sameFile, setSameFile] = useState(null);
  const [showSampleFormat, setShowSampleFormat] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Popup states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showPasscodePopup, setShowPasscodePopup] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');
  const [isReportLocked, setIsReportLocked] = useState(false);
  const [correctPasscode, setCorrectPasscode] = useState('DEMO2024');
  const [recordCount, setRecordCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [credits, setCredits] = useState(0);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [activeTab, setActiveTab] = useState('prehire');
  const [showBackendProcess, setShowBackendProcess] = useState(false);
  const [backendSteps, setBackendSteps] = useState([]);
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedJobClass, setSelectedJobClass] = useState('all');
  const [selectedHireDate, setSelectedHireDate] = useState('all');
  const [selectedTermDate, setSelectedTermDate] = useState('all');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('all');

  const [filters] = useState({
    Organization: ['Healthcare Services'],
    Division: ['Clinical Operations'],
    Department: ['Administration', 'Physical Therapy', 'Nursing'],
    'Job Class': ['Receptionist', 'Therapist', 'Nurse'],
    'Hire Date': ['03/20/2025', '03/20/2023', '03/20/2022', '03/20/2021', '03/20/2020'],
    'Term Date': ['01/10/2025'],
    'Salary Range': ['40k-50k', '60k-80k', '70k-90k'],
  });

  const [filteredResult, setFilteredResult] = useState([]);
  const [filteredEmployeesData, setFilteredEmployeesData] = useState(null);

  // ─── Pre-hire states ────────────────────────────────────────────────────────
  const [preHireFile, setPreHireFile] = useState(null);
  const [preHireError, setPreHireError] = useState('');
  const [preHireSuccess, setPreHireSuccess] = useState(false);
  const [preHireLoading, setPreHireLoading] = useState(false);
  const [preHireDragging, setPreHireDragging] = useState(false);
  const [preHireRecordCount, setPreHireRecordCount] = useState(0);
  const [preHireResult, setPreHireResult] = useState([]);

  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    applyFilters();
  }, [result, selectedDepartment, selectedJobClass, selectedHireDate, selectedTermDate, selectedOrganization, selectedDivision, selectedSalaryRange]);

  useEffect(() => {
    getCredits();
  }, []);

  const applyFilters = () => {
    let filtered = [...result];
    if (selectedDepartment !== 'all') filtered = filtered.filter(emp => emp.department === selectedDepartment);
    if (selectedJobClass !== 'all') filtered = filtered.filter(emp => emp.jobClass === selectedJobClass);
    if (selectedOrganization !== 'all') filtered = filtered.filter(emp => emp.organization === selectedOrganization);
    if (selectedDivision !== 'all') filtered = filtered.filter(emp => emp.division === selectedDivision);
    if (selectedHireDate !== 'all') filtered = filtered.filter(emp => emp.hireDate === selectedHireDate);
    if (selectedTermDate !== 'all') filtered = filtered.filter(emp => emp.termDate === selectedTermDate);
    if (selectedSalaryRange !== 'all') filtered = filtered.filter(emp => emp.salaryRange === selectedSalaryRange);
    setFilteredResult(filtered);
  };

  const getUniqueSalaryRanges = () => [...new Set(result.map(emp => emp.salaryRange).filter(Boolean))].sort();
  const getUniqueOrganizations = () => [...new Set(result.map(emp => emp.organization).filter(Boolean))].sort();
  const getUniqueDivisions = () => [...new Set(result.map(emp => emp.division).filter(Boolean))].sort();
  const getUniqueHireDates = () => [...new Set(result.map(emp => emp.hireDate).filter(Boolean))].sort();
  const getUniqueTermDates = () => [...new Set(result.map(emp => emp.termDate).filter(Boolean))].sort();
  const getUniqueDepartments = () => [...new Set(result.map(emp => emp.department).filter(Boolean))].sort();
  const getUniqueJobClasses = () => [...new Set(result.map(emp => emp.jobClass).filter(Boolean))].sort();

  const getCredits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/getCurrentCredits`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setCredits(data.user.credits);
    } catch (e) {
      console.log(e.message);
    }
  };

  // ─── Pre-hire file handling ─────────────────────────────────────────────────

  const PREHIRE_ACCEPTED_EXT = ['.csv', '.xls', '.xlsx'];
  const PREHIRE_ACCEPTED_TYPES = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const validatePreHireCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      return 'Your file appears to be blank or contains no records. Please upload a file with at least one candidate row.';
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, '').toLowerCase());
    const hasName = headers.some(h => h.includes('candidate') || h.includes('name'));
    const hasAddress = headers.some(h => h.includes('address') || h.includes('address 1'));
    if (!hasName || !hasAddress) {
      return 'Your file could not be accepted because it is missing required fields. Please ensure your file includes Candidate Name and Address columns.';
    }
    return null;
  };


  const watchBackendProgress = async (progressId) => {
    const token = localStorage.getItem('token');
  
    for (let attempt = 0; attempt < 150; attempt++) {
      try {
        const response = await fetch(
          `${BASE_URL}/enrich-progress/${progressId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.ok) {
          const data = await response.json();
  
          setBackendSteps(data.steps || []);
  
          if (
            data.status === 'completed' ||
            data.status === 'failed'
          ) {
            return;
          }
        }
      } catch (error) {
        console.error('Progress check failed:', error);
      }
  
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };
  
  const submitEnrich = async (formData, token) => {
    const progressId =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random()}`;
  
    formData.append('progressId', progressId);
  
    setBackendSteps([
      {
        message: 'Upload started',
        time: new Date().toISOString(),
      },
    ]);
  
    setShowBackendProcess(true);
  
    watchBackendProgress(progressId);
  
    return fetch(`${BASE_URL}/enrich`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  };


  const processPreHireFile = async (selectedFile) => {
    setPreHireError('');
    setPreHireSuccess(false);
    setPreHireResult([]);

    const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!PREHIRE_ACCEPTED_EXT.includes(ext)) {
      setPreHireError(
        'Your file could not be accepted because it is not in an accepted format. Please upload a CSV, XLS, or XLSX file that includes Name, Address, Email, and Phone when available.'
      );
      return;
    }

    try {
      if (ext === '.xlsx' || ext === '.xls') {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length <= 1) {
          setPreHireRecordCount(0);
          return;
        }

        const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
        const nameIdx = headers.findIndex(h => h.includes('name'));

        // Count valid records
        const validCount = rows.slice(1).filter(row => String(row[nameIdx] || '').trim().length > 0).length;
        setPreHireRecordCount(validCount);

      } else {
        // CSV handling
        const text = await selectedFile.text();
        const err = validatePreHireCSV(text);
        if (err) {
          setPreHireError(err);
          return;
        }
        const lines = text.trim().split('\n');
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/['"]/g, '').toLowerCase());
        const nameIdx = headers.findIndex(h => h.includes('name'));

        let validCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map(cell => cell.trim().replace(/['"]/g, ''));
          const name = (cols[nameIdx] || '').trim();

          if (name.length > 0) {
            validCount++;
          }
        }

        setPreHireRecordCount(validCount);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setPreHireError('Error reading the file. Please ensure it is a valid file.');
      return;
    }

    setPreHireFile(selectedFile);
  };



  const handlePreHireFileChange = async (e) => {
    const f = e.target.files[0];
    if (f) await processPreHireFile(f);
  };

  const handlePreHireDrop = async (e) => {
    e.preventDefault();
    setPreHireDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) await processPreHireFile(f);
  };

  const handlePreHireUpload = async () => {
    if (!preHireFile) return;
    if (preHireRecordCount === 0) {
      alert('No valid records found in the file.');
      return;
    }
    setPreHireLoading(true);
    setPreHireError('');
    setPreHireResult([]); // Clear previous results

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('employeeFile', preHireFile);
      formData.append('recordCount', preHireRecordCount);
      formData.append('creditsUsed', '0');
      formData.append('isPreHire', 'true');
      setShowBackendProcess(true);
      
      const res = await submitEnrich(formData, token);
      // const res = await fetch(`${BASE_URL}/enrich`, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` },
      //   body: formData,
      // });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed. Please try again.');
      }

      const data = await res.json();
      console.log('Pre-hire results received:', data.results);

      // Only set results if we actually got data back
      if (data.results && data.results.length > 0) {
        setPreHireResult(data.results);
        setPreHireSuccess(true);
        await getCredits();
      } else {
        throw new Error('No results returned from the server. Please try again.');
      }
    } catch (error) {
      console.log('Upload error:', error.message);
      setPreHireError(error.message || 'An unexpected error occurred. Please try again.');
      setPreHireResult([]); // Clear results on error
    } finally {
      setPreHireLoading(false);
    }
  };


  // ─── Current staff file handling ────────────────────────────────────────────

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!selectedFile || !allowedTypes.includes(selectedFile.type)) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);

    const REQUIRED_COLUMNS = [
      { key: 'employee name', label: 'Employee Name' },
      { key: 'address line 1', label: 'Address Line 1' },
      { key: 'e-mail address', label: 'E-mail Address' },
      { key: 'date of birth', label: 'Date of Birth' },
      { key: 'hire date', label: 'Hire Date' },
      { key: 'organization', label: 'Organization' },
      { key: 'division', label: 'Division' },
      { key: 'department', label: 'Department' },
      { key: 'job class', label: 'Job Class' },
      { key: 'finance score', label: 'Finance Score (1-10)' },
      { key: 'schedule score', label: 'Schedule Score (1-10)' },
      { key: 'work life balance', label: 'Work Life Balance Score (1-10)' },
      { key: 'family score', label: 'Family Score (1-10)' },
    ];

    try {
      const isXlsx = selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      if (isXlsx) {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rows.length <= 1) { setRecordCount(0); return; }

        const headers = rows[0].map(h => String(h || '').trim());
        const headersJoined = headers.join('|').toLowerCase();
        const missingColumns = REQUIRED_COLUMNS.filter(({ key }) => !headersJoined.includes(key.toLowerCase()));

        if (missingColumns.length > 0) {
          alert(`❌ Invalid file format. Missing required columns:\n\n${missingColumns.map(c => c.label).join('\n')}\n\nPlease check the sample file format and try again.`);
          setFile(null); setRecordCount(0); e.target.value = ''; return;
        }

        const empNameIdx = headers.findIndex(h => h.toLowerCase().includes('employee name'));
        const validCount = rows.slice(1).filter(row => String(row[empNameIdx] || '').trim().length > 0).length;
        setRecordCount(validCount);
      } else {
        const text = await selectedFile.text();
        const lines = text.trim().split('\n');
        if (lines.length <= 1) { setRecordCount(0); return; }

        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/['"]/g, ''));
        const headersJoined = headers.join('|').toLowerCase();
        const missingColumns = REQUIRED_COLUMNS.filter(({ key }) => !headersJoined.includes(key.toLowerCase()));

        if (missingColumns.length > 0) {
          alert(`❌ Invalid file format. Missing required columns:\n\n${missingColumns.map(c => c.label).join('\n')}\n\nPlease check the sample file format and try again.`);
          setFile(null); setRecordCount(0); e.target.value = ''; return;
        }

        const empNameIdx = headers.findIndex(h => h.toLowerCase().includes('employee name'));
        let validCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const columns = lines[i].split(delimiter);
          const name = columns[empNameIdx]?.trim().replace(/['"]/g, '') || '';
          if (name.length > 0) validCount++;
        }
        setRecordCount(validCount);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error reading file. Please ensure it is a valid CSV or Excel file.');
      setFile(null); setRecordCount(0);
    }
  };

  const LoadingOverlay = () => {
    const displayCount = activeTab === 'prehire' ? preHireRecordCount : recordCount;
    const displayType = activeTab === 'prehire' ? 'candidate' : 'employee';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full" style={{ border: `4px solid ${BRAND.primary}33` }}></div>
              <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: BRAND.primary, borderTopColor: 'transparent' }}></div>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anton', sans-serif", color: BRAND.black, letterSpacing: '0.01em' }}>
              PROCESSING YOUR FILE
            </h3>
            <p className="text-gray-600 text-center mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Analyzing {displayCount} {displayType} record{displayCount !== 1 ? 's' : ''}...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full animate-pulse" style={{ width: '60%', backgroundColor: BRAND.primary }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4" style={{ fontFamily: "'Poppins', sans-serif" }}>This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  };


  const calculateCategoryAverages = () => {
    if (!filteredResult || filteredResult.length === 0) return [];
    const totals = {}; const counts = {};
    RISK_CATEGORIES.forEach(({ displayName }) => { totals[displayName] = 0; counts[displayName] = 0; });
    filteredResult.forEach(employee => {
      if (employee.categoryScores) {
        RISK_CATEGORIES.forEach(({ apiKey, displayName }) => {
          totals[displayName] += employee.categoryScores[apiKey] || 0;
          counts[displayName] += 1;
        });
      }
    });
    return RISK_CATEGORIES.map(({ displayName }) => ({
      name: displayName,
      score: parseFloat((counts[displayName] > 0 ? totals[displayName] / counts[displayName] : 0).toFixed(1)),
    }));
  };

  const categoryAverages = calculateCategoryAverages();

  const handleUploadClick = async () => {
    if (!file) return;
    if (recordCount === 0) {
      alert('No valid employee records found in the file. Please ensure your file contains records with Employee Names.');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const filtersPayload = { department: selectedDepartment, jobClass: selectedJobClass, hireDate: selectedHireDate, termDate: selectedTermDate, organization: selectedOrganization, division: selectedDivision, salaryRange: selectedSalaryRange };
      formData.append('filters', JSON.stringify(filtersPayload));

      const response = await fetch(`${BASE_URL}/filter-and-count`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const { recordCount: filteredCount, totalAmount, originalCount, tempId, filteredEmployees } = await response.json();
      setFilteredEmployeesData(filteredEmployees);

      if (filteredCount === 0) {
        setIsLoading(false);
        setShowFilterPopup(true);
        alert(`No records match the selected filters. Found 0 records out of ${originalCount} total records. Please adjust your filters and try again.`);
        return;
      }

      setRecordCount(filteredCount);
      setOriginalAmount(totalAmount);
      localStorage.setItem('tempId', tempId);

      const creditsInCents = credits * 100;
      let finalAmount = totalAmount;
      if (creditsInCents > 0) {
        finalAmount = creditsInCents >= totalAmount ? 0 : totalAmount - creditsInCents;
      }
      setTotalAmount(finalAmount);
      setIsLoading(false);

      if (finalAmount > 0) {
        alert(`Insufficient Credits. Filtered ${filteredCount} out of ${originalCount} records. Please contact admin support rsmith@prognosticare.org`);
      } else {
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      setIsLoading(false);
      alert('Error calculating price');
    }
  };

  const handleConfirmUpload = async () => {
    setShowConfirmation(false);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const creditsToUse = originalAmount / 100;
      const deductResponse = await fetch(`${BASE_URL}/deductCredits`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditsToDeduct: creditsToUse }),
      });
      if (!deductResponse.ok) throw new Error('Failed to deduct credits. Please contact support.');

      const formData = new FormData();
      formData.append('employeeFile', file);
      formData.append('recordCount', recordCount);
      formData.append('creditsUsed', '0');

      setShowBackendProcess(true);
      const res = await submitEnrich(formData, token);
      // const res = await fetch(`${BASE_URL}/enrich`, {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` },
      //   body: formData,
      // });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to process file'); }

      const data = await res.json();
      setCorrectPasscode(data.passcode);
      setResult(data.results);
      setIsReportLocked(false);
      await getCredits();
    } catch (error) {
      console.error('Upload error:', error.message);
      alert(error.message || 'Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setShowStripePayment(false);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('employeeFile', file);
      formData.append('paymentIntentId', paymentIntentId);
      setSameFile(file);
      const token = localStorage.getItem('token');
      setShowBackendProcess(true);
      const res = await submitEnrich(formData, token);
      // const res = await fetch(`${BASE_URL}/enrich`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      setCorrectPasscode(data.passcode);
      setResult(data.results);
      setIsReportLocked(false);
      await getCredits();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreeProcessing = async (creditsUsed) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('employeeFile', file);
      formData.append('recordCount', recordCount);
      formData.append('creditsUsed', creditsUsed);
      setSameFile(file);
      const token = localStorage.getItem('token');
      setShowBackendProcess(true);
      const res = await submitEnrich(formData, token);
      // const res = await fetch(`${BASE_URL}/enrich`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      setCorrectPasscode(data.passcode);
      setResult(data.results);
      setIsReportLocked(false);
      await getCredits();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setIsLoading(false);
    }
  };

  const getTopCategory = (employee) => {
    if (!employee || !employee.categoryScores) return 'No categories';
    let minScore = Infinity; let topCategory = 'No categories';
    RISK_CATEGORIES.forEach(({ apiKey, displayName }) => {
      const score = employee.categoryScores[apiKey] || 0;
      if (score < minScore) { minScore = score; topCategory = displayName; }
    });
    return topCategory;
  };

  const getRiskLevel = (score) => {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
  };

  const getCategoryRiskLevel = (score) => {
    if (score >= 7) return 'HIGH RISK';
    if (score >= 4) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  const getCategoryRiskColor = (score) => {
    if (score >= 7) return 'text-[#fb0000]';
    if (score >= 4) return 'text-[#fdc002]';
    return 'text-[#41d756]';
  };

  const getImprovementArea = (employee) => {
    if (!employee || !employee.categoryScores) return 'N/A';
    const areas = RISK_CATEGORIES.filter(({ apiKey }) => (employee.categoryScores[apiKey] || 0) >= 5).map(({ displayName }) => displayName);
    return areas.length > 0 ? areas.join(', ') : 'None';
  };
  const handlePasscodeSubmit = (passcode) => {
    if (passcode === correctPasscode) {
      setPasscodeError('');
      setShowPasscodePopup(false);
      setIsReportLocked(false);
      alert('Report unlocked successfully! You can now download your report.');
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
    }
  };


  const exportPreHireToCSV = () => {
    if (!preHireResult || preHireResult.length === 0) { alert('No data to export'); return; }

    const headers = [
      'Candidate Number', 'Candidate Name', 'Email', 'Phone', 'Department',
      'Job Class', ...RISK_CATEGORIES.map(c => c.displayName),
      'Final Score', 'Improvement Areas'
    ];

    const csvRows = preHireResult.map((emp, index) => [
      emp.employeeNumber || (index + 1), emp.name || 'Unknown', emp.email || '',
      emp.phone || '', emp.department || '', emp.jobClass || '',
      ...RISK_CATEGORIES.map(({ apiKey }) => emp.categoryScores?.[apiKey] || 0),
      emp.overallScore || emp.totalScore || 0,
      emp.improvementArea || getImprovementArea(emp) || 'N/A',
    ]);

    const csvContent = [headers, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prehire_candidate_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToCSV = () => {
    if (isReportLocked) { setShowPasscodePopup(true); return; }
    if (!filteredResult || filteredResult.length === 0) { alert('No data to export'); return; }

    const headers = ['Employee Number','Employee Name (Last Suffix, First MI)','Address Line 1 + Address Line 2','City, State Zip Code (Formatted)','E-mail Address','Alternate Email','Home Phone (Formatted)','Organization','Division','Department','Job Class','Hire Date','Term Date','Salary Range', ...RISK_CATEGORIES.map(c => c.displayName),'Final Score','Improvement Areas'];
    const csvRows = filteredResult.map((emp, index) => [
      emp.employeeNumber || (3321 + index), emp.name || 'Unknown', emp.address || '', emp.cityStateZip || '',
      emp.email || '', emp.alternateEmail || '', emp.phone || '', emp.organization || '', emp.division || '',
      emp.department || '', emp.jobClass || '', emp.hireDate || '', emp.termDate || '', emp.salaryRange || '',
      ...RISK_CATEGORIES.map(({ apiKey }) => emp.categoryScores?.[apiKey] || 0),
      emp.overallScore || emp.totalScore || 0, emp.improvementArea || getImprovementArea(emp) || 'N/A',
    ]);

    const csvContent = [headers, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employee_engagement_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Sub-components ──────────────────────────────────────────────────────────

  // ─── Landing Screen ──────────────────────────────────────────────────────────
  const LandingScreen = () => {
    const cardBase = {
      width: '100%',
      maxWidth: '400px',
      background: '#ffffff',
      border: '1.5px solid #e5e7eb',
      borderRadius: '14px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '12px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'border-color 0.18s, box-shadow 0.18s',
      fontFamily: "'Poppins', sans-serif",
    };

    const handleCardHoverIn = (e) => {
      e.currentTarget.style.borderColor = BRAND.primary;
      e.currentTarget.style.boxShadow = `0 4px 12px ${BRAND.primary}1f`;
    };
    const handleCardHoverOut = (e) => {
      e.currentTarget.style.borderColor = '#e5e7eb';
      e.currentTarget.style.boxShadow = 'none';
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 mb-6 flex flex-col items-center" style={{ fontFamily: "'Poppins', sans-serif" }}>

        {/* Logo */}
        <div className="mb-4">
        <img
  src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1782471932/Apax_Group_Logo_1_qcrz5c.png"
  alt="The Apax Group"
  className="w-40 h-40 object-contain"
/>
        </div>

        {/* Brand name */}
        <h1
          className="text-2xl mb-1 text-center"
          style={{ fontFamily: "'Anton', sans-serif", color: BRAND.black, letterSpacing: '0.01em' }}
        >
          THE APAX GROUP
        </h1>

        {/* Tagline */}
        <p className="text-sm mb-1" style={{ color: BRAND.primary, fontWeight: 500 }}>Empowering Healthcare Workforce Intelligence</p>

        {/* Section label */}
        <p className="text-gray-400 text-sm tracking-wide mb-6">Staff Retention Application</p>

        {/* Credits pill */}
        <div
          className="rounded-full px-6 py-2 shadow-sm mb-8"
          style={{ background: `linear-gradient(to right, ${BRAND.primary}, ${BRAND.navy})` }}
        >
          <p className="text-white font-semibold text-sm">Available Credits: {credits.toFixed(2)}</p>
        </div>

        {/* Pre-Hire card */}
        <button
          style={cardBase}
          onClick={() => { setActiveTab('prehire'); setLandingVisible(false); }}
          onMouseEnter={handleCardHoverIn}
          onMouseLeave={handleCardHoverOut}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.primary}14` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="font-semibold text-sm" style={{ color: BRAND.black }}>Pre-Hire</p>
            <p className="text-gray-400 text-xs mt-0.5">Analyze candidates before hiring</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Current Staff card */}
        <button
          style={{ ...cardBase, marginBottom: 0 }}
          onClick={() => { setActiveTab('current'); setLandingVisible(false); }}
          onMouseEnter={handleCardHoverIn}
          onMouseLeave={handleCardHoverOut}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${BRAND.navy}14` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND.navy} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="font-semibold text-sm" style={{ color: BRAND.black }}>Current Staff</p>
            <p className="text-gray-400 text-xs mt-0.5">Retention risk for existing employees</p>
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    );
  };

  const PreHireScreen = () => (
    <div className="mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <h3 className="text-xl sm:text-2xl mb-2" style={{ fontFamily: "'Anton', sans-serif", color: BRAND.black, letterSpacing: '0.01em' }}>
        UPLOAD PRE-HIRE DATA
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
        Please upload your pre-hire candidate file for processing. The file must include the required candidate information so The Apax Group can begin the retention risk analysis.
      </p>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center mb-5 transition-all duration-300 cursor-pointer ${
          preHireDragging ? 'bg-blue-50' : 'bg-white hover:bg-blue-50'
        }`}
        style={{ borderColor: preHireDragging ? BRAND.primary : `${BRAND.primary}66` }}
        onDragOver={(e) => { e.preventDefault(); setPreHireDragging(true); }}
        onDragLeave={() => setPreHireDragging(false)}
        onDrop={handlePreHireDrop}
        onClick={() => document.getElementById('preHireFileInput').click()}
      >
        <input
          type="file"
          id="preHireFileInput"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={handlePreHireFileChange}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={BRAND.primary} className="mx-auto mb-3 w-10 h-10 sm:w-12 sm:h-12">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
        </svg>
        <p className="text-sm sm:text-base text-gray-700 mb-1">
          Drag and drop your file here, or click to browse
        </p>
        <p className="text-xs text-gray-500">Accepted formats: .CSV &nbsp;·&nbsp; .XLS &nbsp;·&nbsp; .XLSX</p>
        {preHireFile && (
          <p className="font-medium text-sm mt-2" style={{ color: BRAND.primary }}>Selected: {preHireFile.name}</p>
        )}
      </div>

      {/* Required fields */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required fields</p>
        <div className="grid grid-cols-2 gap-2">
  {[
    { label: 'Candidate (Last, Suffix First MI)', required: true },
    { label: 'Source Job', required: true },
    { label: 'Opportunity Title', required: true },
    { label: 'Source Job Code', required: true },
    { label: 'Department Name', required: true },
    { label: 'Email Address', required: true },
    { label: 'Primary Phone', required: true },
    { label: 'Address 1', required: true },
    { label: 'City', required: true },
    { label: 'State/Province Code', required: true },
    { label: 'Zip/Postal Code', required: true },
  ].map(({ label, required }) => (
    <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
      <span>{label}</span>
      {required ? (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BRAND.primary}1a`, color: BRAND.navy }}>Required</span>
      ) : (
        <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">If available</span>
      )}
    </div>
  ))}
</div>
      </div>

      {/* Error message */}
      {preHireError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-800 text-sm mb-1">Upload error</p>
          <p className="text-red-700 text-sm leading-relaxed">{preHireError}</p>
        </div>
      )}

<button
        onClick={handlePreHireUpload}
        disabled={!preHireFile || preHireLoading}
        className={`w-full sm:w-auto mx-auto block px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
          !preHireFile || preHireLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'text-white hover:scale-105 active:scale-95'
        }`}
        style={!preHireFile || preHireLoading ? {} : { backgroundColor: BRAND.primary }}
        onMouseEnter={(e) => { if (preHireFile && !preHireLoading) e.currentTarget.style.backgroundColor = BRAND.primaryHover; }}
        onMouseLeave={(e) => { if (preHireFile && !preHireLoading) e.currentTarget.style.backgroundColor = BRAND.primary; }}
      >
        {preHireLoading ? 'Processing...' : 'Upload & Analyze'}
      </button>
      {preHireResult.length > 0 && (
        <button
          onClick={exportPreHireToCSV}
          className="w-full sm:w-auto mx-auto block mt-3 px-8 py-3 rounded-full font-semibold text-sm sm:text-base text-white hover:scale-105 active:scale-95 transition-all duration-300"
          style={{ backgroundColor: BRAND.navy }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d1b80'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND.navy}
        >
          Export CSV
        </button>
      )}

  
    </div>
  );

  const FilterPopup = () => {
    if (!showFilterPopup) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: "'Anton', sans-serif", color: BRAND.black, letterSpacing: '0.01em' }}>
                FILTER DATA BEFORE PROCESSING
              </h2>
              <p className="text-sm text-gray-600">Select filters to apply to your {recordCount} employee records</p>
            </div>
            <button onClick={() => setShowFilterPopup(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Organization', value: selectedOrganization, setter: setSelectedOrganization, options: filters.Organization, allLabel: 'All Organizations' },
                { label: 'Division', value: selectedDivision, setter: setSelectedDivision, options: filters.Division, allLabel: 'All Divisions' },
                { label: 'Department', value: selectedDepartment, setter: setSelectedDepartment, options: filters.Department, allLabel: 'All Departments' },
                { label: 'Job Class', value: selectedJobClass, setter: setSelectedJobClass, options: filters['Job Class'], allLabel: 'All Job Classes' },
                { label: 'Hire Date', value: selectedHireDate, setter: setSelectedHireDate, options: filters['Hire Date'], allLabel: 'All Hire Dates' },
                { label: 'Term Date', value: selectedTermDate, setter: setSelectedTermDate, options: filters['Term Date'], allLabel: 'All Term Dates' },
                { label: 'Salary Range', value: selectedSalaryRange, setter: setSelectedSalaryRange, options: filters['Salary Range'], allLabel: 'All Salary Ranges' },
              ].map(({ label, value, setter, options, allLabel }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <select value={value} onChange={e => setter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2" style={{ '--tw-ring-color': BRAND.primary }}>
                    <option value="all">{allLabel}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button onClick={() => setShowFilterPopup(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => { setShowFilterPopup(false); handleUploadClick(); }}
              className="px-6 py-2 text-white rounded-lg font-semibold"
              style={{ backgroundColor: BRAND.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND.primary}
            >
              Proceed to Upload
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SampleFormatModal = () => {
    if (!showSampleFormat) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl" style={{ fontFamily: "'Anton', sans-serif", color: BRAND.black, letterSpacing: '0.01em' }}>SAMPLE FILE FORMAT</h2>
            <button onClick={() => setShowSampleFormat(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="border rounded-lg p-4 overflow-x-auto mb-4" style={{ backgroundColor: `${BRAND.primary}0d`, borderColor: `${BRAND.primary}40` }}>
              <pre className="text-xs font-mono whitespace-pre">{`Employee Name,E-mail Address,Address Line 1,Date of Birth,Hire Date,Organization,Division,Department,Job Class,Finance Score,Schedule Score,Work Life Balance Score,Family Score
Abernathy, Rita K.,rabernathy@company.org,9790 North 100 West,01/15/1985,03/20/2020,Healthcare Services,Clinical Ops,Emergency,Nurse,6,8,6,9`}</pre>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => setShowSampleFormat(false)}
              className="px-6 py-2 text-white rounded-lg font-semibold"
              style={{ backgroundColor: BRAND.primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRAND.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRAND.primary}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EmployeeDashboard = ({ overrideResult } = {}) => {
    const dataToDisplay = overrideResult || filteredResult;
    const [expandedEmployee, setExpandedEmployee] = useState(null);

    const getRiskColor = (risk) => {
      if (risk >= 7) return 'bg-red-500';
      if (risk >= 4) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getRetentionPercentage = (score) => {
      if (score === 0) return 'Neutral';
      if (score > 5) return 'Promoter';
      return 'Detractor';
    };

    const getNPSLabel = (score) => {
      if (score >= 7) return 'Promoter';
      if (score >= 4) return 'Neutral';
      return 'Detractor';
    };

    const totalAverage = dataToDisplay.length > 0
    ? Math.round(dataToDisplay.reduce((sum, e) => sum + (e.totalScore || 0), 0) / dataToDisplay.length)
    : 0;

    return (
      <div className="mt-8" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-row items-center gap-4 mb-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-sm text-center leading-tight px-2 flex-shrink-0"
              style={{ backgroundColor: totalAverage >= 7 ? '#41d756' : totalAverage >= 4 ? '#fdc002' : '#fb0000' }}
            >
              {getRiskLevel(totalAverage)}
            </div>
            <div>
              <h1 className="text-2xl mb-1" style={{ fontFamily: "'Anton', sans-serif", color: BRAND.black, letterSpacing: '0.01em' }}>
                EMPLOYEE SENTIMENT DASHBOARD
              </h1>
              <p className="text-lg text-gray-700 mb-1">Overall Sentiment Risk Score</p>
              <p className="text-sm text-gray-500">Showing {dataToDisplay.length} {overrideResult ? 'candidates' : `of ${result.length} employees`}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Organization', value: selectedOrganization, setter: setSelectedOrganization, options: getUniqueOrganizations(), allLabel: 'All Organizations' },
                { label: 'Division', value: selectedDivision, setter: setSelectedDivision, options: getUniqueDivisions(), allLabel: 'All Divisions' },
                { label: 'Department', value: selectedDepartment, setter: setSelectedDepartment, options: getUniqueDepartments(), allLabel: 'All Departments' },
                { label: 'Job Class', value: selectedJobClass, setter: setSelectedJobClass, options: getUniqueJobClasses(), allLabel: 'All Job Classes' },
                { label: 'Hire Date', value: selectedHireDate, setter: setSelectedHireDate, options: getUniqueHireDates(), allLabel: 'All Hire Dates' },
                { label: 'Term Date', value: selectedTermDate, setter: setSelectedTermDate, options: getUniqueTermDates(), allLabel: 'All Term Dates' },
                { label: 'Salary Range', value: selectedSalaryRange, setter: setSelectedSalaryRange, options: getUniqueSalaryRanges(), allLabel: 'All Salary Ranges' },
              ].map(({ label, value, setter, options, allLabel }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <select value={value} onChange={e => setter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2" style={{ '--tw-ring-color': BRAND.primary }}>
                    <option value="all">{allLabel}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {[selectedDepartment, selectedJobClass, selectedHireDate, selectedTermDate, selectedOrganization, selectedDivision, selectedSalaryRange].some(v => v !== 'all') && (
              <button onClick={() => { setSelectedDepartment('all'); setSelectedJobClass('all'); setSelectedHireDate('all'); setSelectedTermDate('all'); setSelectedOrganization('all'); setSelectedDivision('all'); setSelectedSalaryRange('all'); }} className="mt-3 text-sm font-medium" style={{ color: BRAND.primary }}>
                Clear all filters
              </button>
            )}
          </div>

          <ResultsLegend />
          
          {isReportLocked && (
            <div className="mb-6 rounded-lg p-4 flex items-center gap-3" style={{ backgroundColor: '#fef3e2', border: '2px solid #fdc002' }}>
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: '#fdc002' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="font-semibold" style={{ color: '#b88a00' }}>Report Locked</p>
                <p className="text-sm" style={{ color: '#996f00' }}>Complete payment to unlock and download</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Applicant</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Department</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Job Class</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Retention Likelihood</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Retention Delta</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm">Right Fit</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm">Domains</th>
                </tr>
              </thead>
              <tbody>
              {dataToDisplay?.map((employee, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedEmployee(expandedEmployee === index ? null : index)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: BRAND.navy }}>👤</div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{employee?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">ID: {employee?.employeeNumber || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700 text-sm">{employee?.department || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-700 text-sm">{employee?.jobClass || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className="inline-block px-5 py-2 rounded-full font-semibold text-sm text-white" style={{ backgroundColor: (employee?.totalScore || 0) >= 7 ? '#41d756' : (employee?.totalScore || 0) >= 4 ? '#fdc002' : '#fb0000' }}>
                            {getRetentionPercentage(employee?.totalScore || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className="inline-block px-5 py-2 rounded-full font-semibold text-sm text-white" style={{ backgroundColor: (employee?.totalScore || 0) >= 7 ? '#41d756' : (employee?.totalScore || 0) >= 4 ? '#fdc002' : '#fb0000' }}>
                            {getNPSLabel(employee?.totalScore || 0)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className="inline-block px-4 py-2 rounded-full text-white font-bold text-sm" style={{ backgroundColor: (employee?.retentionScore || 0) >= 20 ? '#41d756' : (employee?.retentionScore || 0) >= 0 ? '#fdc002' : '#fb0000' }}>
                            {(employee?.retentionScore || 0) >= 0 ? `+${employee?.retentionScore}%` : `${employee?.retentionScore}%`}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: employee?.rightFitCandidate ? '#41d756' : '#fb0000' }}>
                            {employee?.rightFitCandidate ? '✓ Yes' : '✗ No'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-2">
                          {Object.entries(employee?.categoryScores || {}).map(([category, score]) => (
                            <span key={category} className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: score >= 7 ? '#41d756' : score >= 4 ? '#fdc002' : '#fb0000' }}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {expandedEmployee === index && (
                      <tr className="bg-gray-50">
                        <td colSpan="8" className="p-6 border-b border-gray-200">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {[
                              { label: 'Name', value: employee?.name },
                              { label: 'Department', value: employee?.department },
                              { label: 'Job Class', value: employee?.jobClass },
                              { label: 'Hire Date', value: employee?.hireDate },
                              { label: 'Salary Range', value: employee?.salaryRange },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <p className="text-xs text-gray-500 mb-1">{label}</p>
                                <p className="text-sm font-medium text-gray-900">{value || 'N/A'}</p>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Category Scores</p>
                            <div className="space-y-3">
                              {RISK_CATEGORIES.map(({ apiKey, displayName }) => {
                                const score = employee?.categoryScores?.[apiKey] || 0;
                                return (
                                  <div key={apiKey}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-gray-600">{displayName}</span>
                                      <span className={`font-bold ${getCategoryRiskColor(score)}`}>{getCategoryRiskLevel(score)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div className="h-2 rounded-full transition-all" style={{ width: `${score * 10}%`, backgroundColor: score >= 7 ? '#fb0000' : score >= 4 ? '#fdc002' : '#41d756' }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4 mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Scoring Breakdown</p>
                            <p className="text-xs text-gray-500 mb-3">
                              Points contributed by each factor toward the total risk score. Positive (green) points reduce risk; negative (red) points increase it.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">

  {[
    { label: 'Age', value: employee?.agePoints ?? 0 },
    { label: 'Distance', value: employee?.distancePoints ?? 0 },
    { label: 'Tenure', value: employee?.tenurePoints ?? 0 },
    { label: 'Turnover Risk', value: employee?.turnoverPoints ?? 0 },
    { label: 'Finance', value: employee?.financePoints ?? 0 },
    { label: 'Schedule', value: employee?.schedulePoints ?? 0 },
    { label: 'Work Life', value: employee?.wlbPoints ?? 0 },
    { label: 'Family', value: employee?.familyPoints ?? 0 },
  ].map(({ label, value }) => (
    <div key={label} className="bg-white border border-gray-200 rounded-lg p-2 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-bold ${value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {value >= 0 ? `+${value}` : value}
      </p>
    </div>
  ))}
</div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Total Score</p>
                                <p className={`text-lg font-bold ${getCategoryRiskColor(employee?.totalScore || 0)}`}>{getCategoryRiskLevel(employee?.totalScore || 0)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Retention Likelihood Delta</p>
                                <p className={`text-lg font-bold ${(employee?.retentionScore || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {(employee?.retentionScore || 0) >= 0 ? `+${employee?.retentionScore}%` : `${employee?.retentionScore}%`}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Improvement Area</p>
                                <p className="text-sm font-semibold" style={{ color: '#fb0000' }}>{getImprovementArea(employee)}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
        {(isLoading || preHireLoading) && <LoadingOverlay />}

      <div className="max-w-4xl mx-auto">

        {/* ── Landing screen ─────────────────────────────────────────────────── */}
        {landingVisible ? (
          <LandingScreen />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6">

            {/* Back button + active tab label */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setLandingVisible(true)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-semibold text-gray-700">
                {activeTab === 'prehire' ? 'Pre-Hire' : 'Current Staff'}
              </span>
            </div>

            {/* Logo (compact inside tab view) */}
            <div className="flex justify-center items-center text-center mb-4">
              <img
                src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1782471932/Apax_Group_Logo_1_qcrz5c.png"
                alt="The Apax Group"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>

            {/* Credits badge */}
            <div className="flex justify-center mb-6">
              <div className="rounded-full px-6 py-2 shadow-lg" style={{ background: `linear-gradient(to right, ${BRAND.primary}, ${BRAND.navy})` }}>
                <p className="text-white font-semibold text-sm sm:text-base">
                  Available Credits: {credits.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Upload and Backend Process tabs */}
<div className="flex justify-center gap-2 mb-6 border-b border-gray-200">
  <button
    onClick={() => setShowBackendProcess(false)}
    className={`px-5 py-2 text-sm font-semibold border-b-2 ${
      !showBackendProcess
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-400'
    }`}
  >
    Upload
  </button>

  <button
    onClick={() => setShowBackendProcess(true)}
    className={`px-5 py-2 text-sm font-semibold border-b-2 ${
      showBackendProcess
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-400'
    }`}
  >
    Backend Process
  </button>
</div>

{showBackendProcess ? (
  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
    <h3
      className="text-xl mb-2"
      style={{
        fontFamily: "'Anton', sans-serif",
        color: BRAND.black,
      }}
    >
      BACKEND PROCESS
    </h3>

    <p className="text-sm text-gray-600 mb-4">
      This shows the processing activity completed by the backend.
    </p>

    {backendSteps.length > 0 ? (
      <div className="space-y-3">
        {backendSteps.map((step, index) => (
          <div
            key={`${step.time || 'step'}-${index}`}
            className="flex items-center gap-3 bg-white rounded-lg border border-blue-100 p-3"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
              ✓
            </span>

            <div>
              <p className="text-sm font-medium text-gray-800">
                {step.message}
              </p>

              {step.time && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(step.time).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">
        Start an upload to view backend processing steps.
      </p>
    )}
  </div>
) : (
  <>
    {/* Pre-hire tab */}
    {activeTab === 'prehire' && <PreHireScreen />}

    {/* Current staff tab */}
    {activeTab === 'current' && (
      <>
        <div className="mb-3 flex justify-end">
          <button
            onClick={() => setShowSampleFormat(true)}
            className="text-sm underline"
            style={{ color: BRAND.primary }}
          >
            View sample file format
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center mb-4 sm:mb-6 transition-all duration-300 ${
            isDragging ? 'bg-blue-50' : 'bg-white hover:bg-blue-50'
          }`}
          style={{
            borderColor: isDragging
              ? BRAND.primary
              : `${BRAND.primary}66`,
          }}
        >
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            accept=".csv, .xlsx"
            className="hidden"
          />

          <label htmlFor="fileInput" className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill={BRAND.primary}
              className="mx-auto mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16"
            >
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
            </svg>

            <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-2">
              Drag and drop your CSV/Excel file here or click to browse
            </p>

            {file && (
              <p
                className="font-medium text-sm sm:text-base mt-2"
                style={{ color: BRAND.primary }}
              >
                Selected file: {file.name}
              </p>
            )}
          </label>
        </div>

        <button
          onClick={() => setShowFilterPopup(true)}
          disabled={!file || isLoading}
          className={`w-full sm:w-auto mx-auto block px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
            !file || isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'text-white hover:scale-105 active:scale-95'
          }`}
          style={
            !file || isLoading
              ? {}
              : { backgroundColor: BRAND.primary }
          }
        >
          {isLoading ? 'Processing...' : 'Upload & Analyze'}
        </button>

        {result.length > 0 && (
          <button
            onClick={exportToCSV}
            className={`w-full sm:w-auto mx-auto block mt-3 px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 ${
              isReportLocked
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'text-white hover:scale-105 active:scale-95'
            }`}
            style={
              isReportLocked
                ? {}
                : { backgroundColor: BRAND.navy }
            }
          >
            {isReportLocked ? 'Export Locked' : 'Export CSV'}
          </button>
        )}
      </>
    )}
  </>

            )}
          </div>

          
        )}



{!landingVisible && activeTab === 'current' && result.length > 0 && <EmployeeDashboard />}
        {!landingVisible && activeTab === 'prehire' && preHireResult.length > 0 && (
          <EmployeeDashboard overrideResult={preHireResult} />
        )}

      </div>

      <ConfirmationPopup
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmUpload}
        isLoading={isLoading}
        title="Confirm File Processing"
        message={`File Count: ${recordCount} contact${recordCount !== 1 ? 's' : ''}\nContact Rate: 2.95\nAmount: ${isNaN(originalAmount) || originalAmount === 0 ? '0.00' : (originalAmount / 100).toFixed(2)}\n\nAre you sure you want to proceed?`}
      />

      <PaymentPopup isOpen={showPaymentPopup} onClose={() => setShowPaymentPopup(false)} onDownload={() => { setShowPaymentPopup(false); setShowPasscodePopup(true); }} />

      <PasscodePopup isOpen={showPasscodePopup} onClose={() => { setShowPasscodePopup(false); setPasscodeError(''); }} onSubmit={handlePasscodeSubmit} error={passcodeError} />

      <StripePaymentPopup isOpen={showStripePayment} onClose={() => setShowStripePayment(false)} onSuccess={handlePaymentSuccess} amount={totalAmount} recordCount={recordCount} />

      <SampleFormatModal />
      <FilterPopup />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}

export default UploadFile;