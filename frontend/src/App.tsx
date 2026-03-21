import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header/Header';
import Navbar from './components/Navbar/Navbar';
import type { NavPage } from './components/Navbar/Navbar';
import Dashboard    from './components/Dashboard/Dashboard';
import Products     from './components/Products/Products';
import StockCheck   from './components/Products/StockCheck';
import Tables       from './components/Tables/Tables';
import Transactions from './components/Transactions/Transactions';
import Employees    from './components/Employees/Employees';
import Login        from './components/Login/Login';
import { can }      from './rbac/permissions';
import './App.css';

const DEFAULT_COLOR = '#16a34a';

const Forbidden: React.FC = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '60vh', gap: 12, color: '#9ca3af',
    fontFamily: 'Segoe UI, sans-serif',
  }}>
    <span style={{ fontSize: 48 }}>🔒</span>
    <p style={{ fontSize: 16, fontWeight: 600 }}>Bạn không có quyền truy cập trang này.</p>
  </div>
);

const AppShell: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? '';

  const [activePage, setActivePage] = useState<NavPage>('Tổng quan');
  const [subPage,    setSubPage]    = useState<string | null>(null);
  const [navColor,   setNavColor]   = useState<string>(
    () => localStorage.getItem('navColor') || DEFAULT_COLOR
  );

  const handleColorChange = (color: string) => {
    setNavColor(color);
    localStorage.setItem('navColor', color);
  };

  const handleNavigate = (page: NavPage, sub?: string) => {
    setActivePage(page);
    setSubPage(sub ?? null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Tổng quan':
        return <Dashboard />;

      case 'Hàng hóa':
        if (!can(role, 'products:read')) return <Forbidden />;
        if (subPage === 'Kiểm kho') return <StockCheck />;
        return <Products />;

      case 'Phòng/Bàn':
        return can(role, 'tables:read') ? <Tables /> : <Forbidden />;

      case 'Giao dịch':
        return can(role, 'transactions:read') ? <Transactions /> : <Forbidden />;

      case 'Nhân viên':
        return can(role, 'employees:read') ? <Employees /> : <Forbidden />;

      default:
        return (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontFamily: 'Segoe UI, sans-serif' }}>
            <p style={{ fontSize: 16 }}>Trang <strong>{activePage}</strong> đang được phát triển.</p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Header navColor={navColor} onColorChange={handleColorChange} />
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        navColor={navColor}
        userRole={role}
      />
      {renderPage()}
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const [navColor] = useState<string>(
    () => localStorage.getItem('navColor') || DEFAULT_COLOR
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Segoe UI, sans-serif', color: '#9ca3af',
      }}>
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!user) return <Login navColor={navColor} />;
  return <AppShell />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;