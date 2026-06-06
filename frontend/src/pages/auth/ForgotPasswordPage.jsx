import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../services/authApi.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { showToast } from '../../components/common/Toast.jsx';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPassword({ email });
      showToast('If the email is registered, we have sent a reset OTP.');
      setStep(2);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword({ email, otp, newPassword });
      showToast('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reset password. Check OTP.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
        {step === 1 ? 'Reset Your Password' : 'Verify OTP & Set Password'}
      </h2>

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
            Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </p>

          <Input
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }} loading={loading}>
            Send Reset OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
            We've sent a 6-digit OTP to <strong>{email}</strong>. Enter it below along with your new password.
          </p>

          <Input
            label="6-Digit OTP"
            type="text"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }} loading={loading}>
            Reset Password
          </Button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
              onClick={() => setStep(1)}
            >
              Back to Request OTP
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
