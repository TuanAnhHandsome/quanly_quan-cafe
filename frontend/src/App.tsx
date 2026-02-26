import React, { useState } from 'react';
import Header from './components/Header/Header';
import Navbar from './components/Navbar/Navbar';
import type { NavPage } from './types';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Tables from './components/Tables/Tables';
import Transactions from './components/Transactions/Transactions';
import Employees from './components/Employees/Employees';
import './App.css';

const DEFAULT_COLOR = '#16a34a';

const App: React.FC = () => {
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

export default App;