import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, LogOut, User as UserIcon, ChevronDown, Check, Menu } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import { logout } from '../../store/authSlice.js';
import api from '../../services/api.js';
import { markNotificationRead, setNotifications } from '../../store/uiSlice.js';
import { showToast } from '../common/Toast.jsx';

export default function Topbar({ onToggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignored
    } finally {
      dispatch(logout());
      navigate('/login');
      showToast('Logged out successfully');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      dispatch(markNotificationRead(id));
      // We can also call a backend PUT endpoint to mark notification as read
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      notifications.forEach(n => {
        if (!n.read) dispatch(markNotificationRead(n._id));
      });
      await api.patch('/notifications/read-all');
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <header 
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Toggle Sidebar Button for Mobile */}
        <button 
          className="sidebar-toggle-btn" 
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        
        <h2 className="topbar-title" style={{ fontSize: '18px', fontWeight: 500 }}>
          Welcome back, {user?.firstName || 'User'}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notifications Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              padding: '6px'
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: 'var(--danger-color)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div 
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '320px',
                maxWidth: 'calc(100vw - 24px)',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border-color)',
                zIndex: 200,
                maxHeight: '400px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div 
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid var(--border-color)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--accent-color)', 
                      fontSize: '12px', 
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ overflowY: 'auto', flexGrow: 1, maxHeight: '300px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: n.read ? 'transparent' : 'rgba(245, 158, 11, 0.03)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: n.read ? 400 : 600, margin: 0 }}>{n.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{n.message}</p>
                      </div>
                      {!n.read && (
                        <button 
                          onClick={() => handleMarkAsRead(n._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--success-color)',
                            padding: '2px'
                          }}
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px'
            }}
          >
            <Avatar 
              src={user?.avatar?.url} 
              name={`${user?.firstName || ''} ${user?.lastName || ''}`} 
              size="small" 
            />
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.firstName}
            </span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {showProfileMenu && (
            <div 
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '180px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--border-color)',
                zIndex: 200,
                padding: '4px 0'
              }}
            >
              <Link 
                to="/profile" 
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <UserIcon size={16} />
                My Profile
              </Link>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  color: 'var(--danger-color)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}