import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(false);

  const demoCredentials = [
    { role: 'SUPER_ADMIN', name: 'Alexander Pierce (CTO)', email: 'superadmin@blazeup.com', pass: 'Password123!' },
    { role: 'HR_ADMIN', name: 'Sarah Jenkins (People Director)', email: 'hradmin@blazeup.com', pass: 'Password123!' },
    { role: 'HR', name: 'Priya Sharma (Senior HRBP)', email: 'hr@blazeup.com', pass: 'Password123!' },
    { role: 'MANAGER', name: 'Marcus Vance (Engineering Manager)', email: 'manager@blazeup.com', pass: 'Password123!' },
    { role: 'ADMIN_SYSTEMS', name: 'David Chen (Lead IT Admin)', email: 'itadmin@blazeup.com', pass: 'Password123!' },
    { role: 'ACCOUNTS', name: 'Elena Rostova (Head of Finance)', email: 'accounts@blazeup.com', pass: 'Password123!' },
    { role: 'PERSONNEL', name: 'Vikram Mehta (Facilities Lead)', email: 'personnel@blazeup.com', pass: 'Password123!' },
    { role: 'EMPLOYEE', name: 'Rahul Kumar (Full Stack Dev - Offboarding)', email: 'rahul.kumar@blazeup.com', pass: 'Password123!' },
    { role: 'EMPLOYEE', name: 'Neha Verma (Account Exec - Offboarding)', email: 'neha.verma@blazeup.com', pass: 'Password123!' },
    { role: 'EMPLOYEE', name: 'Arun Kumar (Frontend Dev - Active)', email: 'arun.kumar@blazeup.com', pass: 'Password123!' }
  ];

  const handleFillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.warning('Please enter both corporate email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        backgroundImage:
          'radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.22) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(14, 165, 233, 0.18) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.07) 0%, transparent 60%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#111827',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
        }}
      >
        {/* Header Branding */}
        <div
          style={{
            padding: '36px 36px 24px 36px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)'
            }}
          >
            <Zap size={26} color="#ffffff" />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.3px' }}>
            BlazeUp <span style={{ color: '#818cf8' }}>HROS</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Enterprise Offboarding & Separation Platform
          </p>
        </div>

        {/* Login Form Body */}
        <div style={{ padding: '32px 36px 36px 36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Corporate Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
                Corporate Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  color="#64748b"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="e.g. hradmin@blazeup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#e2e8f0' }}>
                  Account Password
                </label>
                <span style={{ fontSize: '11.5px', color: '#818cf8', cursor: 'pointer' }} onClick={() => toast.info('For testing, default password is Password123!')}>
                  Forgot Password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  color="#64748b"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 42px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                style={{ accentColor: '#6366f1', width: '15px', height: '15px', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '12.5px', color: '#94a3b8', cursor: 'pointer' }}>
                Keep me authenticated on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                marginTop: '4px'
              }}
            >
              {loading ? 'Authenticating Credentials...' : 'Sign In to Workspace'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Collapsible Demo Credentials Quick-Reference */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <button
              type="button"
              onClick={() => setShowCredentialsHelp(!showCredentialsHelp)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#94a3b8',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={15} color="#818cf8" />
                <span>View Corporate Credentials List</span>
              </div>
              {showCredentialsHelp ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showCredentialsHelp && (
              <div
                style={{
                  marginTop: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '12px',
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                  Click any email to autofill into the login form:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {demoCredentials.map((c) => (
                    <div
                      key={c.email}
                      onClick={() => handleFillCredentials(c.email, c.pass)}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: '#818cf8', fontFamily: 'monospace' }}>{c.email}</div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#94a3b8'
                        }}
                      >
                        {c.role}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                  Standard Password for all: <strong style={{ color: '#38bdf8' }}>Password123!</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
