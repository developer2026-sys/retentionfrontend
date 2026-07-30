import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Clock, CheckCircle, AlertCircle, Loader, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from './baseurl';

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    Received: {
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fde68a',
      icon: <Clock className="w-3 h-3" />,
    },
    Processing: {
      background: '#e6ebff',
      color: '#233dff',
      border: '1px solid #c7d0ff',
      icon: <Loader className="w-3 h-3" style={{ animation: 'spin 1s linear infinite' }} />,
    },
    Complete: {
      background: '#e3f3e9',
      color: '#1e7a44',
      border: '1px solid #bbf7d0',
      icon: <CheckCircle className="w-3 h-3" />,
    },
    'Ready for Review': {
      background: '#f3e8ff',
      color: '#7e22ce',
      border: '1px solid #e9d5ff',
      icon: <CheckCircle className="w-3 h-3" />,
    },
  };

  const cfg = config[status] || {
    background: '#f5f6fa',
    color: '#5a5f6b',
    border: '1px solid #e5e7eb',
    icon: <AlertCircle className="w-3 h-3" />,
  };

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.background, color: cfg.color, border: cfg.border }}
    >
      {cfg.icon}
      {status}
    </span>
  );
}

// ─── Status History Drawer ─────────────────────────────────────────────────────
function StatusHistory({ history }) {
  const [open, setOpen] = useState(false);

  if (!history || history.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs transition-colors"
        style={{ color: '#9ca3af' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#5a5f6b'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? 'Hide' : 'Show'} history ({history.length})
      </button>

      {open && (
        <ol
          className="mt-3 pl-4 space-y-2"
          style={{ borderLeft: '2px solid #e5e7eb' }}
        >
          {history.map((h, i) => (
            <li key={i} className="text-xs" style={{ color: '#5a5f6b' }}>
              <span className="font-semibold" style={{ color: '#000000' }}>{h.status}</span>
              {h.note && <span style={{ color: '#9ca3af' }}> — {h.note}</span>}
              <div style={{ color: '#9ca3af' }}>
                {new Date(h.changedAt).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function PreHireFilesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/prehire-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const jobsArray = response.data.jobs || [];

      const detailed = await Promise.all(
        jobsArray.map(async (job) => {
          try {
            const res = await axios.get(`${BASE_URL}/prehire-status/${job.jobId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
          } catch {
            return job;
          }
        })
      );

      setJobs(detailed);
    } catch (e) {
      console.error('Error fetching pre-hire jobs:', e);
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: '#f5f6fa', fontFamily: "'Poppins', sans-serif" }}
        >
          <div className="text-center">
            <div
              className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#233dff', borderTopColor: 'transparent' }}
            />
            <p className="text-sm" style={{ color: '#5a5f6b' }}>Loading pre-hire files...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen"
        style={{ background: '#f5f6fa', fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Top bar */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">
          <img
  src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1782471932/Apax_Group_Logo_1_qcrz5c.png"
  alt="The Apax Group"
  className="w-40 h-40 object-contain"
/>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Page heading */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1
                className="text-3xl mb-1"
                style={{ fontFamily: "'Anton', sans-serif", color: '#000000', letterSpacing: '0.5px' }}
              >
                PRE-HIRE FILES
              </h1>
              <p style={{ color: '#5a5f6b', fontSize: '14px' }}>
                Track the status of your submitted pre-hire candidate files
              </p>
            </div>

            <button
              onClick={() => fetchJobs(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: '#ffffff',
                color: '#5a5f6b',
                border: '1px solid #e5e7eb',
                opacity: refreshing ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!refreshing) e.currentTarget.style.background = '#f5f6fa'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Empty state */}
          {jobs.length === 0 ? (
            <div
              className="rounded-xl p-16 text-center"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <FileText className="w-14 h-14 mx-auto mb-4" style={{ color: '#d1d5db' }} />
              <p className="text-lg font-medium mb-1" style={{ color: '#5a5f6b' }}>No pre-hire files yet</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Upload your first pre-hire candidate file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="rounded-xl p-5 transition-all"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c7d0ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#e6ebff' }}
                    >
                      <FileText className="w-5 h-5" style={{ color: '#233dff' }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* File name + status */}
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: '#000000' }}
                        >
                          {job.fileName || job.originalFileName}
                        </p>
                        <StatusBadge status={job.status} />
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {/* Job ID */}
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{ background: '#f5f6fa', color: '#5a5f6b', border: '1px solid #e5e7eb' }}
                        >
                          {job.jobId}
                        </span>

                        {(job.recordCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5a5f6b' }}>
                            <User className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                            {job.recordCount} record{job.recordCount !== 1 ? 's' : ''}
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-xs" style={{ color: '#5a5f6b' }}>
                          <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                          Submitted {formatDate(job.createdAt)}
                        </span>

                        {job.processedAt && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5a5f6b' }}>
                            <Clock className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                            Processed {formatDateTime(job.processedAt)}
                          </span>
                        )}

                        {job.completedAt && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5a5f6b' }}>
                            <CheckCircle className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                            Completed {formatDateTime(job.completedAt)}
                          </span>
                        )}
                      </div>

                      {/* Status history */}
                      <StatusHistory history={job.statusHistory} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File count footer */}
          {jobs.length > 0 && (
            <p className="text-xs mt-4 text-right" style={{ color: '#9ca3af' }}>
              {jobs.length} file{jobs.length !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default PreHireFilesPage;