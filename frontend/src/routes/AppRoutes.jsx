import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ROLES } from '../context/AuthContext';

// Pages
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Employees } from '../pages/Employees';
import { OffboardingList } from '../pages/OffboardingList';
import { OffboardingCreate } from '../pages/OffboardingCreate';
import { OffboardingDetail } from '../pages/OffboardingDetail';
import { ApproverTasks } from '../pages/ApproverTasks';
import { TaskDetail } from '../pages/TaskDetail';
import { WorkflowConfig } from '../pages/WorkflowConfig';
import { DocumentsPage } from '../pages/DocumentsPage';
import { AccessRevocationPage } from '../pages/AccessRevocationPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { Profile } from '../pages/Profile';
import { NotFound } from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/demo-login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Default redirect to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Offboarding Cases */}
          <Route path="/offboarding" element={<OffboardingList />} />
          <Route path="/offboarding/:id" element={<OffboardingDetail />} />

          {/* HR Only: Initiate Offboarding & Directory */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.HR_ADMIN, ROLES.HR]} />}>
            <Route path="/offboarding/create" element={<OffboardingCreate />} />
            <Route path="/employees" element={<Employees />} />
          </Route>

          {/* Approver Tasks */}
          <Route path="/tasks" element={<ApproverTasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />

          {/* Documents */}
          <Route path="/documents" element={<DocumentsPage />} />

          {/* HR Admin Workflow Designer */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.HR_ADMIN]} />}>
            <Route path="/workflows" element={<WorkflowConfig />} />
            <Route path="/workflows/create" element={<WorkflowConfig />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Admin & Systems Access Revocation */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN_SYSTEMS, ROLES.HR_ADMIN]} />}>
            <Route path="/access-revocation" element={<AccessRevocationPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};
