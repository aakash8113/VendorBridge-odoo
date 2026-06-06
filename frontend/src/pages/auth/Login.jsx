import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { login as loginApi } from '../../services/authApi.js';
import { setCredentials } from '../../store/authSlice.js';
import { showToast } from '../../components/common/Toast.jsx';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707a5.41 5.41 0 010-3.414V4.961H.957a8.997 8.997 0 000 8.078l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0A8.997 8.997 0 00.957 4.961l3.007 2.332C10.673 5.166 8.688 3.58 6.344 3.58H9z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await loginApi({ email, password });
      const { accessToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch(setCredentials({ user }));
      showToast(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect email or password.';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    const api = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');
    window.location.href = `${api.replace(/\/api$/, '')}/api/auth/google`;
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: "var(--font-sans)",
    color: 'var(--text-primary)',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    transition: 'all 0.15s ease',
  };

  return (
    <div>
      <h1 style={{ 
        fontFamily: "var(--font-display)", 
        fontSize: '24px', 
        fontWeight: 600, 
        color: 'var(--text-primary)', 
        marginBottom: '6px',
        letterSpacing: '-0.02em'
      }}>
        Sign in
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
        New here?{' '}
        <Link to="/register" style={{ color: 'var(--brand-amber)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.15s' }} onMouseEnter={(e) => e.target.style.borderBottomColor = 'var(--brand-amber)'} onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}>
          Create an account
        </Link>
      </p>

      {error && (
        <p style={{ 
          fontSize: '13px', 
          color: 'var(--danger-color)', 
          backgroundColor: 'var(--danger-bg)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '10px 14px', 
          marginBottom: '20px',
          fontWeight: 500 
        }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Email address
          </label>
          <input
            type="email" 
            placeholder="you@company.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { 
              e.target.style.borderColor = 'var(--brand-black)'; 
              e.target.style.boxShadow = '0 0 0 3px rgba(9, 9, 11, 0.08)'; 
            }}
            onBlur={(e) => { 
              e.target.style.borderColor = 'var(--border-color)'; 
              e.target.style.boxShadow = 'none'; 
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-secondary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '40px' }}
              onFocus={(e) => { 
                e.target.style.borderColor = 'var(--brand-black)'; 
                e.target.style.boxShadow = '0 0 0 3px rgba(9, 9, 11, 0.08)'; 
              }}
              onBlur={(e) => { 
                e.target.style.borderColor = 'var(--border-color)'; 
                e.target.style.boxShadow = 'none'; 
              }}
            />
            <button 
              type="button" 
              onClick={() => setShowPwd(!showPwd)}
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--text-muted)', 
                padding: '0', 
                display: 'flex',
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: 'var(--brand-black)', 
            border: 'none', 
            borderRadius: 'var(--radius-sm)', 
            color: '#FFFFFF', 
            fontSize: '14px', 
            fontWeight: 600, 
            fontFamily: "var(--font-sans)", 
            cursor: loading ? 'not-allowed' : 'pointer', 
            opacity: loading ? 0.7 : 1, 
            transition: 'opacity 0.15s, background-color 0.15s' 
          }}
          onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#18181B'; }}
          onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = 'var(--brand-black)'; }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>or</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
      </div>

      {/* Google */}
      <button 
        type="button" 
        onClick={handleGoogle}
        style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: '#FFFFFF', 
          border: '1.5px solid var(--border-color)', 
          borderRadius: 'var(--radius-sm)', 
          color: 'var(--text-primary)', 
          fontSize: '14px', 
          fontWeight: 600, 
          fontFamily: "var(--font-sans)", 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px', 
          transition: 'all 0.15s ease' 
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.borderColor = 'var(--border-strong)'; 
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.borderColor = 'var(--border-color)'; 
          e.currentTarget.style.backgroundColor = '#FFFFFF'; 
        }}
      >
        <GoogleIcon /> Continue with Google
      </button>
    </div>
  );
}
