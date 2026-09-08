import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { ToastContainer } from '../components/common/ToastContainer';

export const DashboardLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
