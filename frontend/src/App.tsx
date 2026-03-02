import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import Navbar from './components/Navbar/Navbar';
import type { NavPage } from './components/Navbar/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Tables from './components/Tables/Tables';
import Transactions from './components/Transactions/Transactions';
import Employees from './components/Employees/Employees';
import Login from './components/Login/Login';
import './App.css';

const DEFAULT_COLOR = '#16a34a';

/* ── Main app shell (chỉ render khi đã login) ── */
const AppShell: React.FC = () => {
  const [activePage, setActivePage] = useState<NavPage>('Tổng quan');
  const [navColor, setNavColor] = useState<string>(
    () => localStorage.getItem('navColor') || DEFAULT_COLOR
  );

  const handleColorChange = (color: string) => {
    setNavColor(color);
    localStorage.setItem('navColor', color);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Tổng quan': return <Dashboard />;
      case 'Hàng hóa':  return <Products />;
      case 'Phòng/Bàn': return <Tables />;
      case 'Giao dịch': return <Transactions />;
      case 'Nhân viên': return <Employees />;
      default: return (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontFamily: 'Segoe UI, sans-serif' }}>
          <p style={{ fontSize: 16 }}>Trang <strong>{activePage}</strong> đang được phát triển.</p>
        </div>
      );
    }
  };

  return (
    <div className="app">
      <Header navColor={navColor} onColorChange={handleColorChange} />
      <Navbar activePage={activePage} onNavigate={setActivePage} navColor={navColor} />
      {renderPage()}
    </div>
  );
};

/* ── Route guard ── */
const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [navColor] = useState<string>(
    () => localStorage.getItem('navColor') || DEFAULT_COLOR
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Segoe UI, sans-serif', color: '#9ca3af' }}>
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!user) return <Login navColor={navColor} />;
  return <AppShell />;
};

/* ── Root ── */
const App: React.FC = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;