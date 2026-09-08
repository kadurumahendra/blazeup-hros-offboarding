import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserX,
  CheckSquare,
  GitFork,
  FileText,
  ShieldAlert,
  History,
  LogOut,
  Zap,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: Object.values(ROLES)
    },
    {
      label: 'Offboarding Cases',
      path: '/offboarding',
      icon: UserX,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE]
    },
    {
      label: 'My Clearance Tasks',
      path: '/tasks',
      icon: CheckSquare,
      roles: [
        ROLES.HR_ADMIN,
        ROLES.HR,
        ROLES.MANAGER,
        ROLES.ADMIN_SYSTEMS,
        ROLES.ACCOUNTS,
        ROLES.PERSONNEL
      ]
    },
    {
      label: 'Employee Directory',
      path: '/employees',
      icon: Users,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR]
    },
    {
      label: 'Workflow Engine',
      path: '/workflows',
      icon: GitFork,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]
    },
    {
      label: 'Documents & Letters',
      path: '/documents',
      icon: FileText,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR, ROLES.EMPLOYEE]
    },
    {
      label: 'Access Revocation',
      path: '/access-revocation',
      icon: ShieldAlert,
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_SYSTEMS, ROLES.HR_ADMIN]
    },
    {
      label: 'Audit Trail',
      path: '/audit-logs',
      icon: History,
      roles: [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN]
    },
    {
      label: 'My Profile',
      path: '/profile',
      icon: User,
      roles: [ROLES.EMPLOYEE]
    }
  ];

  const allowedNav = navItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside className="sidebar-wrapper">
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Zap size={20} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
            BlazeUp <span style={{ color: '#818cf8', fontWeight: 600 }}>HROS</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Offboarding Engine
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px 10px' }}>
          {user?.role?.replace(/_/g, ' ')} Workspace
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#312e81' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Role Info Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#818cf8',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
