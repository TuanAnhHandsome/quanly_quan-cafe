import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie, faBoxes, faChair, faExchangeAlt, faHandshake,
  faUsers, faStore, faCashRegister, faChartBar, faCalculator,
  faFileInvoice, faClipboardList, faTag, faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

export type NavPage =
  | 'Tổng quan' | 'Hàng hóa' | 'Phòng/Bàn' | 'Giao dịch'
  | 'Nhân viên'
  | 'Báo cáo';

interface NavItemDef { label: NavPage; icon: any; subItems?: string[]; }

const navItems: NavItemDef[] = [
  { label: 'Tổng quan', icon: faChartPie },
  { label: 'Hàng hóa', icon: faBoxes,       subItems: ['Danh mục', 'Kiểm kho'] },
  { label: 'Phòng/Bàn', icon: faChair,      subItems: ['Danh sách phòng bàn', 'Gọi món qua mã QR'] },
  { label: 'Giao dịch', icon: faExchangeAlt },
  { label: 'Nhân viên', icon: faUsers,      subItems: ['Danh mục', 'Kiểm kho'] },
  { label: 'Báo cáo', icon: faChartBar },
];

interface NavbarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  navColor: string;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, navColor }) => {
  const [openDropdown, setOpenDropdown] = useState<NavPage | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (item: NavItemDef, e: React.MouseEvent) => {
    e.preventDefault();
    if (item.subItems) {
      setOpenDropdown(openDropdown === item.label ? null : item.label);
    } else {
      setOpenDropdown(null);
      onNavigate(item.label);
    }
  };

  return (
    <nav className="navbar" ref={navRef} style={{ background: navColor, transition: 'background 0.3s' }}>
      <ul className="navbar-list">
        {navItems.map((item) => (
          <li key={item.label} className={`navbar-item ${activePage === item.label ? 'active' : ''}`}>
            <a href="#" className="navbar-link" onClick={(e) => handleNavClick(item, e)}>
              <FontAwesomeIcon icon={item.icon} className="navbar-icon" />
              <span>{item.label}</span>
              {item.subItems && (
                <FontAwesomeIcon icon={faChevronDown} className={`dropdown-arrow ${openDropdown === item.label ? 'open' : ''}`} />
              )}
            </a>
            {item.subItems && openDropdown === item.label && (
              <ul className="dropdown-menu">
                {item.subItems.map((sub, idx) => (
                  <li key={sub} className="dropdown-item">
                    <a href="#" className="dropdown-link" onClick={(e) => { e.preventDefault(); setOpenDropdown(null); onNavigate(item.label); }}>
                      {sub}
                      {item.label === 'Phòng/Bàn' && idx === 1 && (
                        <span className="badge-new" style={{ color: navColor, background: `${navColor}22` }}>Mới</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="navbar-actions">
        <button className="navbar-action-btn" title="Đặt bàn"><FontAwesomeIcon icon={faFileInvoice} /></button>
        <button className="navbar-action-btn" title="Thu ngân"><FontAwesomeIcon icon={faTag} /></button>
      </div>
    </nav>
  );
};

export default Navbar;