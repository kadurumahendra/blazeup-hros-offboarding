import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { approvalService } from '../services/approvalService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { CheckSquare, Clock, AlertTriangle, ArrowRight, User, Calendar } from 'lucide-react';

export const ApproverTasks = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await approvalService.getMyTasks();
      if (res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      toast.error('Failed to load clearance tasks: ' + (err.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>Loading assigned tasks...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            My Clearance Tasks
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Active clearance reviews assigned to your role (<strong>{user?.role?.replace('_', ' ')}</strong>)
          </p>
        </div>

        <span
          style={{
            backgroundColor: tasks.length > 0 ? '#e0e7ff' : '#f1f5f9',
            color: tasks.length > 0 ? '#4338ca' : '#64748b',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 700
          }}
        >
          {tasks.length} Pending {tasks.length === 1 ? 'Task' : 'Tasks'}
        </span>
      </div>

      {/* Task Cards Grid */}
      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}
          >
            <CheckSquare size={28} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            All Clear! No Pending Clearance Tasks
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            You have reviewed and signed off on all clearance items assigned to your role.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            const completedCount = task.checklist.filter((i) => i.isCompleted).length;
            const totalCount = task.checklist.length;

            return (
              <div
                key={task.taskId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isOverdue ? '4px solid #ef4444' : '4px solid #4f46e5'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: '#4f46e5',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {task.stageName}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
                    {task.employee?.firstName} {task.employee?.lastName}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {task.employee?.designation} • {task.employee?.department}
                  </div>

                  {/* Meta Chips */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      margin: '16px 0',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Last Working Day:</span>
                      <strong style={{ color: '#4338ca' }}>
                        {task.lastWorkingDay ? new Date(task.lastWorkingDay).toLocaleDateString() : 'N/A'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Checklist Progress:</span>
                      <strong>
                        {completedCount} of {totalCount} verified
                      </strong>
                    </div>
                    {task.dueDate && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Target Deadline:</span>
                        <span style={{ color: isOverdue ? '#dc2626' : 'var(--text-main)', fontWeight: 600 }}>
                          {new Date(task.dueDate).toLocaleDateString()}{' '}
                          {isOverdue && '(OVERDUE)'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    to={`/tasks/${task.workflowInstanceId}_${task.stageId}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Open Clearance Review <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
