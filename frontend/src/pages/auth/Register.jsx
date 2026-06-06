import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Globe, ArrowRight, CheckCircle2, Upload, ClipboardList, BadgeCheck, Building2, ShieldCheck } from 'lucide-react';
import { register as registerApi, verifyOtp as verifyOtpApi } from '../../services/authApi.js';
import { setCredentials } from '../../store/authSlice.js';
import { uploadFile } from '../../services/api.js';
import { showToast } from '../../components/common/Toast.jsx';

const ROLES = [
  { value: 'officer', label: 'Procurement Officer', desc: 'Creates RFQs, manages vendors', Icon: ClipboardList },
  { value: 'manager', label: 'Procurement Manager', desc: 'Approves quotes & POs', Icon: BadgeCheck },
  { value: 'vendor', label: 'Vendor Partner', desc: 'Submits quotes for RFQs', Icon: Building2 },
  { value: 'admin', label: 'Administrator', desc: 'Full system management', Icon: ShieldCheck },
];

const FieldInput = ({ label, type = 'text', placeholder, value, onChange, icon: Icon, rightNode }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </label>
    )}
    <div style={{ position: 'relative' }}>
      {Icon && (
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <Icon size={16} />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', 
          padding: Icon ? '10px 14px 10px 38px' : '10px 14px',
          paddingRight: rightNode ? '40px' : undefined,
          fontSize: '14px', 
          fontFamily: "var(--font-sans)",
          color: 'var(--text-primary)', 
          backgroundColor: '#FFFFFF',
          border: '1.5px solid var(--border-color)', 
          borderRadius: 'var(--radius-sm)',
          outline: 'none', 
          transition: 'all 0.15s ease',
        }}
        onFocus={(e) => { 
          e.target.style.borderColor = 'var(--brand-black)'; 
          e.target.style.boxShadow = '0 0 0 3px rgba(9, 9, 11, 0.08)'; 
        }}
        onBlur={(e) => { 
          e.target.style.borderColor = 'var(--border-color)'; 
          e.target.style.boxShadow = 'none'; 
        }}
      />
      {rightNode && (
        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {rightNode}
        </span>
      )}
    </div>
  </div>
);

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=form, 2=otp

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState('officer');
  const [phone, setPhone]         = useState('');
  const [country, setCountry]     = useState('');
  const [avatar, setAvatar]       = useState(null);
  const [otp, setOtp]             = useState('');

  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) { setError('Please fill in all required fields.'); return; }
    setLoading(true); setError('');
    try {
      await registerApi({ firstName, lastName, email, password, role, phone, country, avatar });
      showToast('Account created! Check your email for the OTP.');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg); showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) { setError('Please enter the OTP.'); return; }
    setLoading(true); setError('');
    try {
      const res = await verifyOtpApi({ email, otp });
      const { accessToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      dispatch(setCredentials({ user }));
      showToast('Account verified! Welcome to VendorBridge.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(msg); showToast(msg, 'error');
    } finally { setLoading(false); }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    try {
      const res = await uploadFile(file, '/avatars');
      setAvatar({ url: res.url, fileId: res.fileId, name: res.name });
      showToast('Photo uploaded!');
    } catch { showToast('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  /* ── OTP Step ── */
  if (step === 2) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', border: '2px solid var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={28} color="var(--warning-color)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Verify your email
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            We sent a 6-digit code to<br /><strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-color)', fontSize: '13px', marginBottom: '20px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%', padding: '14px', textAlign: 'center',
                fontFamily: "var(--font-mono)",
                fontSize: '24px', fontWeight: 700, letterSpacing: '12px',
                color: 'var(--text-primary)', backgroundColor: 'var(--hover-bg)',
                border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none',
                transition: 'all 0.15s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--brand-black)'; e.target.style.boxShadow = '0 0 0 3px rgba(9, 9, 11, 0.08)'; e.target.style.backgroundColor = '#FFFFFF'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = 'var(--hover-bg)'; }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: 'var(--brand-black)', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: "var(--font-sans)", fontSize: '14px', fontWeight: 600, color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#18181B'; }}
            onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = 'var(--brand-black)'; }}
          >
            {loading ? 'Verifying…' : (<>Verify & Continue <ArrowRight size={16} /></>)}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}>
          Wrong email?{' '}
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--brand-amber)', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "var(--font-sans)", textDecoration: 'underline' }}>
            Go back
          </button>
        </p>
      </div>
    );
  }

  /* ── Registration Step ── */
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: '24px', 
          fontWeight: 600, 
          color: 'var(--text-primary)', 
          marginBottom: '6px',
          letterSpacing: '-0.02em'
        }}>
          Create your account
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have one?{' '}
          <Link to="/login" style={{ color: 'var(--brand-amber)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'border-color 0.15s' }} onMouseEnter={(e) => e.target.style.borderBottomColor = 'var(--brand-amber)'} onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}>Sign in</Link>
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger-color)', fontSize: '13px', marginBottom: '20px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleRegister}>
        {/* Avatar upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '12px 14px', backgroundColor: 'var(--hover-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border-color)', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar ? (
              <img src={avatar.url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} color="var(--text-muted)" />
            )}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>Profile Photo</p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--brand-amber)', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
              <Upload size={13} />{uploading ? 'Uploading…' : 'Upload photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldInput label="First Name" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} icon={User} />
          <FieldInput label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <FieldInput label="Email Address" type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} />

        <FieldInput
          label="Password"
          type={showPwd ? 'text' : 'password'}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          rightNode={<span onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', alignItems: 'center' }}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</span>}
        />

        {/* Role selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Your Role
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {ROLES.map(({ value, label, desc, Icon: RoleIcon }) => {
              const isSelected = role === value;
              return (
                <button
                  key={value} 
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    padding: '12px', 
                    borderRadius: 'var(--radius-sm)', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    border: isSelected ? '1.5px solid var(--brand-black)' : '1.5px solid var(--border-color)',
                    backgroundColor: isSelected ? '#FFFFFF' : 'var(--hover-bg)',
                    boxShadow: isSelected ? '0 2px 4px rgba(9, 9, 11, 0.05)' : 'none',
                    transition: 'all 0.15s ease', 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '10px',
                  }}
                >
                  <div style={{ marginTop: '2px', color: isSelected ? 'var(--brand-amber)' : 'var(--text-muted)', flexShrink: 0 }}>
                    <RoleIcon size={16} strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', fontFamily: "var(--font-sans)" }}>
                      {label}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>
                      {desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phone + Country */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FieldInput label="Phone" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} icon={Phone} />
          <FieldInput label="Country" placeholder="India" value={country} onChange={(e) => setCountry(e.target.value)} icon={Globe} />
        </div>

        <button
          type="submit" disabled={loading || uploading}
          style={{ 
            width: '100%', 
            padding: '13px', 
            backgroundColor: 'var(--brand-black)', 
            border: 'none', 
            borderRadius: 'var(--radius-sm)', 
            fontFamily: "var(--font-sans)", 
            fontSize: '14px', 
            fontWeight: 600, 
            color: '#FFFFFF', 
            cursor: (loading || uploading) ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            marginTop: '8px', 
            transition: 'all 0.15s ease' 
          }}
          onMouseEnter={(e) => { if (!loading && !uploading) e.currentTarget.style.backgroundColor = '#18181B'; }}
          onMouseLeave={(e) => { if (!loading && !uploading) e.currentTarget.style.backgroundColor = 'var(--brand-black)'; }}
        >
          {loading ? 'Creating account…' : (<>Create Account <ArrowRight size={16} /></>)}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px', lineHeight: 1.6 }}>
        By registering you agree to our{' '}
        <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
        {' '}&amp;{' '}
        <span style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
      </p>
    </div>
  );
}
