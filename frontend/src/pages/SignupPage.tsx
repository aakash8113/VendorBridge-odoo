import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiFetch } from '../lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PROCUREMENT_OFFICER'); // Default role

  // Vendor-specific fields
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!name || !email || !password || !role) {
      return setError('Please fill in all required fields.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    setLoading(true);
    try {
      const payload: any = { 
        name, 
        email, 
        password, 
        role 
      };

      // Include vendor-specific fields
      if (role === 'VENDOR') {
        payload.companyName = companyName;
        payload.category = category;
        payload.gstNumber = gstNumber;
        payload.contactPhone = contactPhone;
        payload.address = address;
      }

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      alert('Registration successful! Please login.');
      navigate('/login');
      
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#121212]">
      <div className="w-full max-w-2xl bg-[#1E1E1E] border border-zinc-800 rounded-lg p-8 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gray-400 mb-6">
          <User className="w-8 h-8" />
        </div>
        
        <form onSubmit={handleRegister} className="w-full space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-900/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Full Name *</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe" 
                className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Email Address *</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400">Password *</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400">Confirm Password *</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-gray-400">System Role *</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors appearance-none"
            >
              <option value="PROCUREMENT_OFFICER">Procurement Officer (Create RFQs, Compare Quotes)</option>
              <option value="MANAGER">Manager / Approver (Approve Workflows)</option>
              <option value="VENDOR">Vendor (Submit Quotations)</option>
              <option value="ADMIN">Administrator (Full Access)</option>
            </select>
          </div>
          
          {/* Vendor-specific fields */}
          {role === 'VENDOR' && (
            <div className="space-y-4 border border-zinc-700 rounded-lg p-4 bg-black/20">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Vendor Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ABC Corp"
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. IT Equipment"
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">GST Number *</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="e.g. 27AADCB2230M1Z2"
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-400">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Registered business address"
                  className="w-full bg-black/50 border border-zinc-700 text-gray-100 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-4 border-t border-zinc-800">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full max-w-50 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Account'}
            </button>
            <div className="text-sm text-gray-400">
              Already have an account? <Link to="/login" className="text-blue-500 hover:text-blue-400">Login here</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}