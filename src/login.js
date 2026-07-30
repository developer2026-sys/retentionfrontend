import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import {BASE_URL} from './baseurl'

export default function Login({ onSwitchToRegister, onSwitchToReset, users = [] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate=useNavigate();
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async(e) => {
    e.preventDefault();
  try{
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    let response=await axios.post(`${BASE_URL}/login`,{email,password})
    setLoading(true);

    setSuccess('Login successful!');
    setEmail('');
    setPassword('');
    setLoading(false)
    localStorage.setItem('token',response.data.token)
    navigate('/upload')
  }catch(e){
    setLoading(false)
if(e?.response?.data?.error){
    setError(e?.response?.data?.error)
}else{
    setError("Error occured while trying to login")
}
  }
  };

  return (
    <>
      {/* Brand fonts: Anton (display) + Poppins (body) */}
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{ background: '#f5f6fa', fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
          <img
  src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1782471932/Apax_Group_Logo_1_qcrz5c.png"
  alt="The Apax Group"
  className="w-40 h-40 object-contain"
/>
          </div>
          <div
            className="rounded-2xl shadow-xl p-8"
            style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
          >
            <h2
              className="text-3xl mb-1 text-center"
              style={{ fontFamily: "'Anton', sans-serif", color: '#000000', letterSpacing: '0.5px' }}
            >
              WELCOME BACK
            </h2>
            <p className="mb-6 text-center" style={{ color: '#5a5f6b' }}>Login to your account</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#fdeeee', border: '1px solid #f3c9c9' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#d64545' }} />
                <p className="text-sm" style={{ color: '#a13333' }}>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: '#e9f1ff', border: '1px solid #b9cdfb' }}>
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#233dff' }} />
                <p className="text-sm" style={{ color: '#12229d' }}>{success}</p>
              </div>
            )}

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                    style={{ border: '1px solid #d1d5db', boxShadow: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = '#233dff'; e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                    style={{ border: '1px solid #d1d5db', boxShadow: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = '#233dff'; e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-lg font-medium transition-colors"
                style={{
                  background: loading ? '#7c8cf7' : '#233dff',
                  color: '#ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.background = '#12229d'; }}
                onMouseLeave={(e) => { if (!loading) e.target.style.background = '#233dff'; }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to='/resetpassword'>
                <button
                  onClick={onSwitchToReset}
                  className="text-sm font-medium"
                  style={{ color: '#233dff' }}
                >
                  Forgot Password?
                </button>
              </Link>
            </div>

            <div className="mt-6 text-center text-sm" style={{ color: '#5a5f6b' }}>
              Don't have an account?{' '}
              <Link to='/register'>
                <button
                  onClick={onSwitchToRegister}
                  className="font-medium"
                  style={{ color: '#233dff' }}
                >
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}