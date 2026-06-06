import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import ChatPanel from '../chat/ChatPanel.jsx';

export default function AppLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Backdrop for Mobile */}
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="main-content">
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
      <ChatPanel />
    </div>
  );
}
