import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  User as UserIcon,
  CheckCheck,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const toast = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.');
    navigate('/login');
  };

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roleDisplay = user?.role?.replace(/_/g, ' ') || 'GUEST';

  return (
    <header className="top-navbar">
      {/* Title & Organization Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
          Enterprise Offboarding Platform
        </div>
      </div>

      {/* Right Controls: User Identity, Notifications & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Real Authenticated User Identity Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '12.5px'
          }}
        >
          <UserIcon size={15} color="#4f46e5" />
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Logged in as: </span>
            <strong style={{ color: '#0f172a' }}>{user?.name || 'User'}</strong>
            <span style={{ color: '#6366f1', fontWeight: 600, marginLeft: '6px' }}>({roleDisplay})</span>
            <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '11.5px' }}>• {user?.email}</span>
          </div>
        </div>

        {/* Notifications Icon & Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="btn btn-outline"
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff'
            }}
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} color="var(--text-main)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger-color)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Notifications ({unreadCount} unread)
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{
                      border: 'none',
                      background: 'none',
                      fontSize: '11.5px',
                      color: 'var(--primary-color)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: n.isRead ? '#ffffff' : '#f0f9ff',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{n.title}</strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Secure Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-outline"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#dc2626',
            borderColor: '#fecaca',
            backgroundColor: '#fef2f2'
          }}
          title="Sign Out"
        >
          <LogOut size={14} color="#dc2626" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
export default Navbar;
