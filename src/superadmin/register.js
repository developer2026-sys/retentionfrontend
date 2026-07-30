import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, EyeOff, Eye, Shield } from 'lucide-react';
import {ToastContainer,toast} from 'react-toastify'
import { Link } from 'react-router-dom';
import axios from 'axios'
import { BASE_URL } from '../baseurl';
import {useNavigate} from 'react-router-dom'

function SuperAdminRegister({ onSwitchPage }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  const navigate=useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit =async(e) => {
    e.preventDefault();
   try{
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    let response=await axios.post(`${BASE_URL}/adminRegister`,formData)
    localStorage.setItem('adminToken',response.data.token)
    setIsLoading(false)
    setFormData({
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
    })
    toast.success("Registeration was sucessfull",{containerId:"adminRegister"})
    navigate('/admin/dashboard')
   }catch(e){
    setIsLoading(false)
if(e?.response?.data?.error){
    toast.error(e?.response?.data?.error,{containerId:"adminRegister"})
}else{
    toast.error("Error occured while trying to register",{containerId:"adminRegister"})
}
   }
   
  };

  return (
   <>
   <ToastContainer containerId={"adminRegister"}/>

   {/* Brand fonts: Anton (display) + Poppins (body) */}
   <link
     href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600&display=swap"
     rel="stylesheet"
   />

   <div
     className="min-h-screen flex items-center justify-center p-4 relative"
     style={{ background: '#000000', fontFamily: "'Poppins', sans-serif" }}
   >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full filter blur-3xl opacity-20" style={{ background: '#233dff' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full filter blur-3xl opacity-20" style={{ background: '#12229d' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: '#ffffff' }}>
          <div className="px-8 py-10 text-center" style={{ background: '#12229d' }}>
          <div className="flex justify-center mb-6">
          <img
  src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1782471932/Apax_Group_Logo_1_qcrz5c.png"
  alt="The Apax Group"
  className="w-40 h-40 object-contain"
/>
    </div>
            <h1
              className="text-2xl mb-2"
              style={{ fontFamily: "'Anton', sans-serif", color: '#ffffff', letterSpacing: '0.5px' }}
            >
              CREATE ADMIN ACCOUNT
            </h1>
            <p className="text-sm" style={{ color: '#c7cdf5' }}>Register to access the admin panel</p>
          </div>

          <div className="px-8 py-10">
           <Link to='/adminlogin'>
           <button
              className="flex items-center mb-6 transition-colors text-sm font-medium"
              style={{ color: '#5a5f6b' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#233dff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#5a5f6b'; }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
           </Link>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5" style={{ color: '#9ca3af' }} />
                  </div>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none transition-colors"
                    style={{ border: `1px solid ${errors.name ? '#e24b4a' : '#d1d5db'}`, boxShadow: 'none' }}
                    onFocus={(e) => { if (!errors.name) { e.target.style.borderColor = '#233dff'; e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)'; } }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; if (!errors.name) e.target.style.borderColor = '#d1d5db'; }}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-2 text-sm" style={{ color: '#a13333' }}>{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" style={{ color: '#9ca3af' }} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none transition-colors"
                    style={{ border: `1px solid ${errors.email ? '#e24b4a' : '#d1d5db'}`, boxShadow: 'none' }}
                    onFocus={(e) => { if (!errors.email) { e.target.style.borderColor = '#233dff'; e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)'; } }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; if (!errors.email) e.target.style.borderColor = '#d1d5db'; }}
                    placeholder="admin@example.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm" style={{ color: '#a13333' }}>{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: '#9ca3af' }} />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none transition-colors"
                    style={{ border: `1px solid ${errors.password ? '#e24b4a' : '#d1d5db'}`, boxShadow: 'none' }}
                    onFocus={(e) => { if (!errors.password) { e.target.style.borderColor = '#233dff'; e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)'; } }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; if (!errors.password) e.target.style.borderColor = '#d1d5db'; }}
                    placeholder="Minimum 8 characters"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: '#9ca3af' }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: '#9ca3af' }} />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm" style={{ color: '#a13333' }}>{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#000000' }}>Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: '#9ca3af' }} />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none transition-colors"
                    style={{ border: `1px solid ${errors.confirmPassword ? '#e24b4a' : '#d1d5db'}`, boxShadow: 'none' }}
                    onFocus={(e) => { if (!errors.confirmPassword) { e.target.style.borderColor = '#233dff'; e.target.style.boxShadow = '0 0 0 2px rgba(35,61,255,0.2)'; } }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; if (!errors.confirmPassword) e.target.style.borderColor = '#d1d5db'; }}
                    placeholder="Re-enter password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" style={{ color: '#9ca3af' }} />
                    ) : (
                      <Eye className="h-5 w-5" style={{ color: '#9ca3af' }} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm" style={{ color: '#a13333' }}>{errors.confirmPassword}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold transition-colors"
                style={{
                  background: isLoading ? '#7c8cf7' : '#233dff',
                  color: '#ffffff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#12229d'; }}
                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#233dff'; }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: '#ffffff' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
              <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: '#9ca3af' }}>
                <Shield className="w-3.5 h-3.5" />
                By registering, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-6 opacity-75" style={{ color: '#ffffff' }}>
          © 2026 The Apax Group. All rights reserved.
        </p>
      </div>
    </div>
   </>
  );
}

export default SuperAdminRegister;