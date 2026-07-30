import React from 'react';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';


const TEMPLATE_FILES = [
  {
    id: 'prehire-template',
    name: 'Pre-hire Applicants Template',
    description: 'Standard template for submitting pre-hire applicant data (name, contact info, source job, department).',
    fileName: 'Pre-hire_Applicants_03_2026_-_04_2026_-_Hancock (3).xlsx',
    path: '/assets/templates/' + encodeURIComponent('Pre-hire_Applicants_03_2026_-_04_2026_-_Hancock (3).xlsx'),
    type: 'xlsx',
  },
  {
    id: 'staff-template',
    name: 'Current Staff Template',
    description: 'Standard template for current staff roster exports/imports, including employment and department details.',
    fileName: 'current_staff.csv',
    path: '/assets/templates/current_staff.csv',
    type: 'csv',
  },
];

const FILE_TYPE_CONFIG = {
  xlsx: { icon: FileSpreadsheet, bg: '#e3f3e9', color: '#1e7a44', label: 'Excel Workbook' },
  csv:  { icon: FileText,        bg: '#eff6ff', color: '#1d4ed8', label: 'CSV File' },
};

const TemplateCard = ({ file }) => {
  const cfg = FILE_TYPE_CONFIG[file.type];
  const Icon = cfg.icon;

  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: '#000000' }}>
            {file.name}
          </h3>
          <span
            className="inline-block text-xs font-medium mt-1 px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      <p className="text-sm mb-4 flex-1" style={{ color: '#5a5f6b' }}>
        {file.description}
      </p>

      <p
        className="text-xs font-mono truncate px-1.5 py-0.5 rounded mb-4 inline-block"
        style={{ color: '#5a5f6b', background: '#f5f6fa' }}
      >
        {file.fileName}
      </p>

      <a
        href={file.path}
        download={file.fileName}
        className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
        style={{ background: '#233dff', color: '#ffffff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#12229d'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#233dff'; }}
      >
        <Download className="w-4 h-4" />
        Download
      </a>
    </div>
  );
};

export default function TemplateFiles() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen p-6"
        style={{ background: '#f5f6fa', fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="max-w-7xl mx-auto">

       
          <div className="mb-8">
            <h1
              className="text-3xl mb-2"
              style={{ fontFamily: "'Anton', sans-serif", color: '#000000', letterSpacing: '0.5px' }}
            >
              TEMPLATE FILES
            </h1>
            <p style={{ color: '#5a5f6b' }}>
              Download standard templates to use when submitting pre-hire applicants or current staff data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TEMPLATE_FILES.map(file => (
              <TemplateCard key={file.id} file={file} />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}