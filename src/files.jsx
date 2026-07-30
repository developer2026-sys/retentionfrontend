import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, User, Lock } from 'lucide-react';
import axios from 'axios';
import { BASE_URL } from './baseurl';

function PaymentPopup({ isOpen, onClose, onDownload }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="rounded-2xl max-w-md w-full p-8 relative"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#5a5f6b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#e6ebff' }}
          >
            <Lock className="w-7 h-7" style={{ color: '#233dff' }} />
          </div>
          <h2
            className="text-2xl mb-2"
            style={{ fontFamily: "'Anton', sans-serif", color: '#000000', letterSpacing: '0.5px' }}
          >
            REPORT LOCKED
          </h2>
          <p className="text-sm" style={{ color: '#5a5f6b' }}>
            Your report has been processed successfully! To download it, please complete the payment.
            You will receive a passcode to unlock your report.
          </p>
        </div>

        <div
          className="rounded-xl p-5 mb-6 text-center"
          style={{ background: '#f5f6fa', border: '1px solid #e5e7eb' }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <FileText className="w-5 h-5" style={{ color: '#233dff' }} />
            <span className="text-sm font-semibold" style={{ color: '#000000' }}>Report Ready</span>
          </div>
          <p className="text-xs" style={{ color: '#5a5f6b' }}>Complete payment to receive your unlock passcode</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onDownload}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#233dff', color: '#ffffff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#12229d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#233dff'; }}
          >
            Proceed to Payment
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#f5f6fa', color: '#5a5f6b', border: '1px solid #e5e7eb' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f6fa'; }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function PasscodePopup({ isOpen, onClose, onSubmit, error }) {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = () => onSubmit(passcode);
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const inputFocusStyle = (e) => {
    e.target.style.borderColor = '#233dff';
    e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)';
  };
  const inputBlurStyle = (e) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow = 'none';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="rounded-2xl max-w-md w-full p-8 relative"
        style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#5a5f6b'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#e3f3e9' }}
          >
            <Lock className="w-7 h-7" style={{ color: '#22c55e' }} />
          </div>
          <h2
            className="text-2xl mb-2"
            style={{ fontFamily: "'Anton', sans-serif", color: '#000000', letterSpacing: '0.5px' }}
          >
            ENTER PASSCODE
          </h2>
          <p className="text-sm" style={{ color: '#5a5f6b' }}>
            Enter the passcode you received after payment to unlock and download your report.
          </p>
        </div>

        <input
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter your passcode"
          className="w-full px-4 py-3 rounded-lg text-center text-lg font-mono focus:outline-none mb-3"
          style={{ border: '2px solid #d1d5db', fontFamily: 'monospace' }}
          onFocus={inputFocusStyle}
          onBlur={inputBlurStyle}
          autoFocus
        />

        {error && (
          <div
            className="px-4 py-3 rounded-lg mb-4 text-sm"
            style={{ background: '#fdeeee', border: '1px solid #f3c9c9', color: '#a13333' }}
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#233dff', color: '#ffffff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#12229d'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#233dff'; }}
          >
            Unlock Report
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#f5f6fa', color: '#5a5f6b', border: '1px solid #e5e7eb' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f6fa'; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showPasscodePopup, setShowPasscodePopup] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');

  useEffect(() => {
    fetchAllFiles();
  }, []);

  const fetchAllFiles = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('token');
      let response = await axios.get(`${BASE_URL}/get-files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filesArray = response.data.files || [];
      const transformedFiles = filesArray.map(file => ({
        id: file._id,
        fileName: file.file,
        userEmail: file.user.email,
        uploadDate: file.createdAt,
        passcode: file.passcode,
        paid: file.paid,
        outputUrl: file.output,
      }));
      setFiles(transformedFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
    } catch (e) {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = async (file) => {
    try {
      const link = document.createElement('a');
      link.href = file.outputUrl;
      link.download = `output_${file.id}.csv`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentPopup(false);
    setShowPasscodePopup(true);
  };

  const handlePasscodeSubmit = async (enteredPasscode) => {
    if (!selectedFile) return;
    if (enteredPasscode === selectedFile.passcode) {
      setPasscodeError('');
      setShowPasscodePopup(false);
      try {
        const link = document.createElement('a');
        link.href = selectedFile.outputUrl;
        link.download = selectedFile.fileName.replace('.csv', '.xlsx');
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download error:', error);
      }
      setSelectedFile(null);
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
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
            <p className="text-sm" style={{ color: '#5a5f6b' }}>Loading files...</p>
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
          <div className="mb-8">
            <h1
              className="text-3xl mb-1"
              style={{ fontFamily: "'Anton', sans-serif", color: '#000000', letterSpacing: '0.5px' }}
            >
              YOUR FILES
            </h1>
            <p style={{ color: '#5a5f6b', fontSize: '14px' }}>
              Manage and download your processed reports
            </p>
          </div>

          {/* Empty state */}
          {files.length === 0 ? (
            <div
              className="rounded-xl p-16 text-center"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <FileText className="w-14 h-14 mx-auto mb-4" style={{ color: '#d1d5db' }} />
              <p className="text-lg font-medium mb-1" style={{ color: '#5a5f6b' }}>No files yet</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Upload your first file to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="rounded-xl p-5 transition-all"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c7d0ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Icon + info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#e6ebff' }}
                      >
                        <FileText className="w-5 h-5" style={{ color: '#233dff' }} />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold truncate mb-1.5"
                          style={{ color: '#000000' }}
                        >
                          {file.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5a5f6b' }}>
                            <User className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                            {file.userEmail}
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: '#5a5f6b' }}>
                            <Calendar className="w-3.5 h-3.5" style={{ color: '#9ca3af' }} />
                            {formatDate(file.uploadDate)}
                          </span>
                          {file.paid && (
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: '#e3f3e9', color: '#1e7a44' }}
                            >
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Download button */}
                    <button
                      onClick={() => handleDownloadClick(file)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                      style={{ background: '#233dff', color: '#ffffff' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#12229d'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#233dff'; }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* File count footer */}
          {files.length > 0 && (
            <p className="text-xs mt-4 text-right" style={{ color: '#9ca3af' }}>
              {files.length} file{files.length !== 1 ? 's' : ''} total
            </p>
          )}
        </div>
      </div>

      <PaymentPopup
        isOpen={showPaymentPopup}
        onClose={() => { setShowPaymentPopup(false); setSelectedFile(null); }}
        onDownload={handlePaymentComplete}
      />

      <PasscodePopup
        isOpen={showPasscodePopup}
        onClose={() => { setShowPasscodePopup(false); setSelectedFile(null); setPasscodeError(''); }}
        onSubmit={handlePasscodeSubmit}
        error={passcodeError}
      />
    </>
  );
}

export default FilesPage;