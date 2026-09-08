import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { approvalService } from '../services/approvalService';
import { offboardingService } from '../services/offboardingService';
import { useAuth, ROLES } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { StageTimeline } from '../components/workflow/StageTimeline';
import {
  Users,
  UserMinus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Shield,
  Server,
  CreditCard,
  KeyRound,
  FileText,
  CheckSquare,
  History,
  Lock,
  ExternalLink
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [employeeOffboarding, setEmployeeOffboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setEmployeeOffboarding(null);
        setTasks([]);

        const [dashRes] = await Promise.all([dashboardService.getMetrics()]);
        if (dashRes.data) {
          setData(dashRes.data);
        }

        // If approver role, load my clearance tasks
        if (
          [
            ROLES.MANAGER,
            ROLES.ADMIN_SYSTEMS,
            ROLES.ACCOUNTS,
            ROLES.PERSONNEL,
            ROLES.HR,
            ROLES.HR_ADMIN
          ].includes(user?.role)
        ) {
          try {
            const taskRes = await approvalService.getMyTasks();
            if (taskRes.data) setTasks(taskRes.data);
          } catch (e) {
            console.warn(e);
          }
        }

        // If employee role, load own offboarding case
        if (user?.role === ROLES.EMPLOYEE) {
          try {
            const offbRes = await offboardingService.getOffboardings({ limit: 1 });
            if (offbRes.data && offbRes.data.length > 0) {
              const fullCase = await offboardingService.getOffboardingById(offbRes.data[0]._id);
              setEmployeeOffboarding(fullCase.data);
            }
          } catch (e) {
            console.warn(e);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role, user?._id, user?.email]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>Loading {user?.role?.replace('_', ' ')} workspace...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const departmentBreakdown = data?.departmentBreakdown || [];
  const recentOffboardings = data?.recentOffboardings || [];
  const rolePendingMap = data?.rolePendingMap || {};
  const recentAudits = data?.recentAudits || [];

  // ==========================================
  // 1. SUPER ADMIN DASHBOARD
  // ==========================================
  if (user?.role === ROLES.SUPER_ADMIN) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
              System Administration & Governance
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>
              Welcome, {user.name} (Super Admin)
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              Global platform controls, workflow architecture governance, and compliance audit trail.
            </p>
          </div>
          <Link to="/audit-logs" className="btn" style={{ backgroundColor: '#ffffff', color: '#312e81', fontWeight: 700 }}>
            <History size={16} /> Audit Trail
          </Link>
        </div>

        <div className="stat-grid">
          <StatCard title="Total Employees" value={metrics.totalEmployees || 0} icon={Users} color="#6366f1" bg="#eef2ff" trend="Master personnel records" />
          <StatCard title="Active Offboardings" value={metrics.activeOffboardings || 0} icon={UserMinus} color="#f59e0b" bg="#fffbeb" trend="In-flight workflows" />
          <StatCard title="Completed Cases" value={metrics.completedOffboardings || 0} icon={CheckCircle2} color="#10b981" bg="#ecfdf5" trend="Successfully archived" />
          <StatCard title="Documents Issued" value={metrics.totalDocumentsGenerated || 0} icon={FileText} color="#0ea5e9" bg="#f0f9ff" trend="Official PDF letters" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Platform Administrative Tools</h3>
                <p className="card-subtitle">Quick shortcuts to platform modules</p>
              </div>
              <Shield size={20} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/workflows" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                <span>Workflow Engine Designer</span> <ArrowRight size={14} />
              </Link>
              <Link to="/audit-logs" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                <span>Compliance & Security Audit Logs</span> <ArrowRight size={14} />
              </Link>
              <Link to="/employees" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                <span>Employee Master Directory</span> <ArrowRight size={14} />
              </Link>
              <Link to="/access-revocation" className="btn btn-secondary" style={{ justifyContent: 'space-between' }}>
                <span>IT Access Revocation Hub</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent System Audit Events</h3>
                <p className="card-subtitle">Latest immutable platform events</p>
              </div>
              <History size={20} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {recentAudits.slice(0, 5).map((log) => (
                <div key={log._id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.action}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{log.remarks} • {new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. HR ADMIN & HR DASHBOARD
  // ==========================================
  if (user?.role === ROLES.HR_ADMIN || user?.role === ROLES.HR) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.3)'
          }}
        >
          <div>
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
              {user.role === ROLES.HR_ADMIN ? 'HR Administration & Operations' : 'HR Operations & Final Clearance'}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>
              Welcome, {user.name}
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              Centralized separation oversight, department clearance tracking, and statutory document generation.
            </p>
          </div>
          <button
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#4338ca', fontWeight: 700, padding: '12px 20px' }}
            onClick={() => navigate('/offboarding/create')}
          >
            <PlusCircle size={18} /> Initiate Offboarding
          </button>
        </div>

        <div className="stat-grid">
          <StatCard title="Active Offboardings" value={metrics.activeOffboardings || 0} icon={UserMinus} color="#6366f1" bg="#eef2ff" trend="In clearance progress" />
          <StatCard title="Pending Clearances" value={metrics.pendingApprovals || 0} icon={Clock} color="#f59e0b" bg="#fffbeb" trend={`${metrics.overdueApprovals || 0} overdue`} />
          <StatCard title="Completed Cases" value={metrics.completedOffboardings || 0} icon={CheckCircle2} color="#10b981" bg="#ecfdf5" trend={`${metrics.completedThisMonth || 0} this month`} />
          <StatCard title="Avg Cycle Time" value={`${metrics.avgCompletionDays || 0} Days`} icon={TrendingUp} color="#0ea5e9" bg="#f0f9ff" trend="Initiation to release" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Clearances by Department</h2>
                <p className="card-subtitle">Active vs completed separations</p>
              </div>
              <Building2 size={20} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {departmentBreakdown.map((dept) => (
                <div key={dept._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{dept._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}><strong>{dept.activeCases}</strong> active / {dept.totalCases} total</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (dept.activeCases / (dept.totalCases || 1)) * 100)}%`, height: '100%', backgroundColor: '#6366f1', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Pending Clearances by Role</h2>
                <p className="card-subtitle">Active review tasks across stages</p>
              </div>
              <ShieldCheck size={20} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {Object.entries({
                MANAGER: 'Project Manager',
                ADMIN_SYSTEMS: 'Admin & Systems',
                ACCOUNTS: 'Accounts & Finance',
                PERSONNEL: 'Personnel',
                HR: 'HR Final Sign-off'
              }).map(([roleKey, roleLabel]) => {
                const count = rolePendingMap[roleKey] || 0;
                return (
                  <div key={roleKey} style={{ padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: count > 0 ? '#fffbeb' : '#ffffff' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{roleLabel}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: count > 0 ? '#b45309' : 'var(--text-main)', marginTop: '4px' }}>{count}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{count === 1 ? 'task pending' : 'tasks pending'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Active Offboarding Pipelines</h2>
              <p className="card-subtitle">Latest initiated employee cases</p>
            </div>
            <Link to="/offboarding" className="btn btn-secondary btn-sm">View All <ArrowRight size={14} /></Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Resignation Date</th>
                  <th>Last Working Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOffboardings.map((caseItem) => (
                  <tr key={caseItem._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{caseItem.employeeId?.firstName} {caseItem.employeeId?.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{caseItem.employeeId?.employeeCode}</div>
                    </td>
                    <td>{caseItem.employeeId?.department}</td>
                    <td>{new Date(caseItem.resignationDate).toLocaleDateString()}</td>
                    <td>{new Date(caseItem.lastWorkingDay).toLocaleDateString()}</td>
                    <td><StatusBadge status={caseItem.status} /></td>
                    <td><Link to={`/offboarding/${caseItem._id}`} className="btn btn-secondary btn-sm">Details</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. MANAGER DASHBOARD
  // ==========================================
  if (user?.role === ROLES.MANAGER) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: '#ffffff' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
            Project & Reporting Manager Workspace
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>Welcome, {user.name}</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Review project deliverables, code repositories, client handovers, and knowledge transfer completions.
          </p>
        </div>

        <div className="stat-grid">
          <StatCard title="My Pending Clearances" value={tasks.length} icon={CheckSquare} color="#0284c7" bg="#e0f2fe" trend="Awaiting manager sign-off" />
          <StatCard title="Total Department Clearances" value={metrics.activeOffboardings || 0} icon={UserMinus} color="#6366f1" bg="#eef2ff" trend="Active team separations" />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Project Clearance Tasks ({tasks.length})</h2>
              <p className="card-subtitle">Tasks assigned to Reporting Managers for review</p>
            </div>
            <CheckSquare size={20} color="var(--primary)" />
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✓ You have completed all project clearance handovers assigned to you.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {tasks.map((task) => (
                <div key={task.taskId} className="card" style={{ borderLeft: '4px solid #0284c7' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{task.employee?.firstName} {task.employee?.lastName}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                    {task.employee?.designation} • {task.employee?.department}
                  </div>
                  <div style={{ fontSize: '12.5px', marginBottom: '16px' }}>
                    <div>Last Working Day: <strong>{new Date(task.lastWorkingDay).toLocaleDateString()}</strong></div>
                    <div>Checklist: {task.checklist?.filter((i) => i.isCompleted).length} of {task.checklist?.length} verified</div>
                  </div>
                  <Link to={`/tasks/${task.workflowInstanceId}_${task.stageId}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Review Handover & Approve <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. ADMIN & SYSTEMS (IT) DASHBOARD
  // ==========================================
  if (user?.role === ROLES.ADMIN_SYSTEMS) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
              IT Infrastructure & Asset Clearance Workspace
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>Welcome, {user.name}</h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              Hardware return verification, corporate credentials revocation, and VPN/cloud access de-provisioning.
            </p>
          </div>
          <Link to="/access-revocation" className="btn" style={{ backgroundColor: '#ffffff', color: '#0f766e', fontWeight: 700 }}>
            <Server size={16} /> Access Revocation Hub
          </Link>
        </div>

        <div className="stat-grid">
          <StatCard title="My Pending IT Clearances" value={tasks.length} icon={CheckSquare} color="#0f766e" bg="#ccfbf1" trend="Hardware & Access sign-off" />
          <StatCard title="Access Revocation Cases" value={metrics.activeOffboardings || 0} icon={KeyRound} color="#6366f1" bg="#eef2ff" trend="Active de-provisioning" />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pending IT Clearances ({tasks.length})</h2>
              <p className="card-subtitle">Verify returned hardware assets & revoke single sign-on access</p>
            </div>
            <Server size={20} color="#0f766e" />
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✓ All IT asset clearances and digital revocations are currently up to date.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {tasks.map((task) => (
                <div key={task.taskId} className="card" style={{ borderLeft: '4px solid #0f766e' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{task.employee?.firstName} {task.employee?.lastName}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                    {task.employee?.employeeCode} • {task.employee?.department}
                  </div>
                  <div style={{ fontSize: '12.5px', marginBottom: '16px' }}>
                    <div>Last Working Day: <strong>{new Date(task.lastWorkingDay).toLocaleDateString()}</strong></div>
                    <div>Asset Checklist: {task.checklist?.filter((i) => i.isCompleted).length} of {task.checklist?.length} items</div>
                  </div>
                  <Link to={`/tasks/${task.workflowInstanceId}_${task.stageId}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Verify Assets & Revoke Access <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. ACCOUNTS & FINANCE DASHBOARD
  // ==========================================
  if (user?.role === ROLES.ACCOUNTS) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: '#ffffff' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
            Finance & Accounts Clearance Workspace
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>Welcome, {user.name}</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Review travel advances, staff loans, salary advances, petty cash imprest, and finalize financial dues.
          </p>
        </div>

        <div className="stat-grid">
          <StatCard title="Financial Clearances Pending" value={tasks.length} icon={CreditCard} color="#15803d" bg="#dcfce7" trend="Awaiting finance sign-off" />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Accounts Clearance Tasks ({tasks.length})</h2>
              <p className="card-subtitle">Verify settlement of all financial dues and expense claims</p>
            </div>
            <CreditCard size={20} color="#15803d" />
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✓ All financial clearance tasks are completed.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {tasks.map((task) => (
                <div key={task.taskId} className="card" style={{ borderLeft: '4px solid #15803d' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{task.employee?.firstName} {task.employee?.lastName}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                    {task.employee?.employeeCode} • {task.employee?.department}
                  </div>
                  <div style={{ fontSize: '12.5px', marginBottom: '16px' }}>
                    <div>Last Working Day: <strong>{new Date(task.lastWorkingDay).toLocaleDateString()}</strong></div>
                    <div>Checklist: {task.checklist?.filter((i) => i.isCompleted).length} of {task.checklist?.length} items verified</div>
                  </div>
                  <Link to={`/tasks/${task.workflowInstanceId}_${task.stageId}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Review Financial Dues & Sign Off <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. PERSONNEL & FACILITIES DASHBOARD
  // ==========================================
  if (user?.role === ROLES.PERSONNEL) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: '#ffffff' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
            Personnel & Facilities Clearance Workspace
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>Welcome, {user.name}</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Employee ID card recovery, RFID building access badge deactivation, and physical facilities return.
          </p>
        </div>

        <div className="stat-grid">
          <StatCard title="Personnel Clearances Pending" value={tasks.length} icon={CheckSquare} color="#7c3aed" bg="#f5f3ff" trend="Awaiting physical ID/badge return" />
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">My Personnel Clearance Tasks ({tasks.length})</h2>
              <p className="card-subtitle">Verify ID badge return and revoke building access</p>
            </div>
            <CheckSquare size={20} color="#7c3aed" />
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              ✓ All personnel clearance tasks are currently signed off.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {tasks.map((task) => (
                <div key={task.taskId} className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{task.employee?.firstName} {task.employee?.lastName}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 12px' }}>
                    {task.employee?.employeeCode} • {task.employee?.department}
                  </div>
                  <div style={{ fontSize: '12.5px', marginBottom: '16px' }}>
                    <div>Last Working Day: <strong>{new Date(task.lastWorkingDay).toLocaleDateString()}</strong></div>
                    <div>Checklist: {task.checklist?.filter((i) => i.isCompleted).length} of {task.checklist?.length} items verified</div>
                  </div>
                  <Link to={`/tasks/${task.workflowInstanceId}_${task.stageId}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Confirm ID & Facilities Return <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 7. EMPLOYEE SELF-SERVICE DASHBOARD
  // ==========================================
  const empCase = employeeOffboarding?.offboarding;
  const empStages = empCase?.workflowInstanceId?.stages || [];
  const empDocs = employeeOffboarding?.documents || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 32px', color: '#ffffff' }}>
        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>
          Employee Separation Portal
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px' }}>Welcome, {user.name}</h1>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Track real-time clearance status across departments and download your official release letters.
        </p>
      </div>

      {empCase ? (
        <>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 className="card-title">My Offboarding Status</h2>
              <StatusBadge status={empCase.status} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Resignation Date</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{new Date(empCase.resignationDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#4338ca', textTransform: 'uppercase', fontWeight: 700 }}>Last Working Day</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#4338ca' }}>{new Date(empCase.lastWorkingDay).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{empCase.employeeId?.department}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Live Clearance Progress</h2>
                <p className="card-subtitle">Real-time status of your departmental handovers</p>
              </div>
            </div>
            <StageTimeline stages={empStages} />
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">My Official Documents & Letters ({empDocs.length})</h2>
                <p className="card-subtitle">Download accepted resignation letter, clearance certificate, and relieving letters</p>
              </div>
              <FileText size={20} color="var(--primary)" />
            </div>
            {empDocs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Your official letters will appear here once clearances are approved by HR.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {empDocs.map((doc) => (
                  <div key={doc._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{doc.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Generated on {new Date(doc.generatedAt).toLocaleDateString()}</div>
                    </div>
                    <Link to="/documents" className="btn btn-primary btn-sm">
                      View Document <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <CheckCircle2 size={36} color="#10b981" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>No Active Offboarding Case</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            You are an active employee at BlazeUp Technologies with full system privileges.
          </p>
        </div>
      )}
    </div>
  );
};
