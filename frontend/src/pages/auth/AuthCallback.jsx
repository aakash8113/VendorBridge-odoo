import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from '../../services/authApi.js';
import { setCredentials } from '../../store/authSlice.js';
import { showToast } from '../../components/common/Toast.jsx';
import Spinner from '../../components/common/Spinner.jsx';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get('token');
      const isNew = searchParams.get('isNew') === 'true';
      if (token) {
        try {
          localStorage.setItem('accessToken', token);
          // Fetch user profile info
          const res = await getMe();
          dispatch(setCredentials({ user: res.data.data }));
          
          if (isNew) {
            localStorage.setItem('showGoogleOAuthRoleAlert', 'true');
            showToast('Account created with Google! Defaulting to Procurement Officer.', 'info');
          } else {
            showToast('Successfully signed in with Google!');
          }
          navigate('/dashboard');
        } catch (err) {
          localStorage.removeItem('accessToken');
          showToast('Google login verification failed', 'error');
          navigate('/login');
        }
      } else {
        showToast('OAuth token missing from redirection', 'error');
        navigate('/login');
      }
    }

    handleCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh',
        gap: '16px'
      }}
    >
      <Spinner />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
        Completing Google Workspace authorization...
      </p>
    </div>
  );
}
