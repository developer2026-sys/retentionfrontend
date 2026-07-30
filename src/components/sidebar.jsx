import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Upload, X, FileText, Menu } from 'lucide-react';

// Apax Group brand kit
// Colors:  #233dff (primary blue) · #12229d (deep navy) · #000000 (near black)
// Fonts:   Anton (display) · Poppins (body)
// Tagline: "Empowering Healthcare Workforce Intelligence"

function Sidebar() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'upload', label: 'Upload', icon: Upload, path: '/upload' },
    { id: 'files', label: 'Results', icon: FileText, path: '/files' },
    // { id: 'prehire files', label: 'Prehire files', icon: FileText, path: '/prehirefiles' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: 'linear-gradient(135deg, #eef1ff 0%, #ffffff 50%, #eef0fb 100%)',
      }}
    >
      {/* Google Fonts: Anton + Poppins */}
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e5f5' }}
      >
        <div className="h-full flex flex-col">
          {/* Brand header */}
          <div className="p-6 border-b" style={{ borderColor: '#e2e5f5' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1782471932/Apax_Group_Logo_1_qcrz5c.png"
                  alt="The Apax Group"
                  className="w-14 h-14 object-contain"
                />
                <div className="flex flex-col leading-tight">
                  <span
                    style={{
                      fontFamily: "'Anton', sans-serif",
                      color: '#000000',
                      fontSize: '1.05rem',
                      letterSpacing: '0.01em',
                    }}
                  >
                    THE APAX GROUP
                  </span>
                  <span
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      color: '#12229d',
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Strategic Workforce Solutions
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden"
                style={{ color: '#12229d' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all"
                      style={
                        isActive
                          ? {
                              background: 'linear-gradient(90deg, #233dff 0%, #12229d 100%)',
                              color: '#ffffff',
                              boxShadow: '0 2px 8px rgba(35, 61, 255, 0.35)',
                              fontWeight: 600,
                            }
                          : {
                              color: '#1c1c2e',
                              fontWeight: 500,
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#eef1ff';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem' }}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t" style={{ borderColor: '#e2e5f5' }}>
            <div
              className="text-center"
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.68rem', color: '#6b7099' }}
            >
              © 2024 The Apax Group
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header
          className="px-6 py-4 lg:hidden"
          style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e5f5' }}
        >
          <button onClick={() => setIsMobileSidebarOpen(true)} style={{ color: '#12229d' }}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Sidebar;