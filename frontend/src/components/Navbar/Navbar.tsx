import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie, faBoxes, faChair, faExchangeAlt,
  faUsers, faChartBar, faFileInvoice, faTag, faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { can, type Permission } from '../../rbac/permissions';
import './Navbar.css';

export type NavPage =
  | 'Tổng quan' | 'Hàng hóa' | 'Phòng/Bàn' | 'Giao dịch'
  | 'Nhân viên' | 'Báo cáo';

interface NavItemDef {
  label: NavPage;
  icon: any;
  permission: Permission;
  subItems?: string[];
}

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Tổng quan', icon: faChartPie,    permission: 'dashboard:read'    },
  { label: 'Hàng hóa',  icon: faBoxes,       permission: 'products:read',
    subItems: ['Danh mục', 'Kiểm kho'] },
  { label: 'Phòng/Bàn', icon: faChair,       permission: 'tables:read',
    subItems: ['Danh sách phòng bàn', 'Gọi món qua mã QR'] },
  { label: 'Giao dịch', icon: faExchangeAlt, permission: 'transactions:read' },
  { label: 'Nhân viên', icon: faUsers,       permission: 'employees:read',
    subItems: ['Danh mục', 'Ca làm việc'] },
  { label: 'Báo cáo',   icon: faChartBar,    permission: 'reports:read'      },
];

interface NavbarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage, sub?: string) => void;  // thêm sub
  navColor: string;
  userRole: string;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, navColor, userRole }) => {
  const [openDropdown, setOpenDropdown] = useState<NavPage | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const visibleItems = NAV_ITEMS.filter(item => can(userRole, item.permission));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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

  // Click vào sub-item — truyền cả page lẫn tên sub
  const handleSubClick = (e: React.MouseEvent, item: NavItemDef, sub: string) => {
    e.preventDefault();
    setOpenDropdown(null);
    onNavigate(item.label, sub);
  };

  return (
    <nav className="navbar" ref={navRef} style={{ background: navColor, transition: 'background 0.3s' }}>
      <ul className="navbar-list">
        {visibleItems.map((item) => (
          <li key={item.label} className={`navbar-item ${activePage === item.label ? 'active' : ''}`}>
            <a href="#" className="navbar-link" onClick={(e) => handleNavClick(item, e)}>
              <FontAwesomeIcon icon={item.icon} className="navbar-icon" />
              <span>{item.label}</span>
              {item.subItems && (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`dropdown-arrow ${openDropdown === item.label ? 'open' : ''}`}
                />
              )}
            </a>
            {item.subItems && openDropdown === item.label && (
              <ul className="dropdown-menu">
                {item.subItems.map((sub, idx) => (
                  <li key={sub} className="dropdown-item">
                    <a
                      href="#"
                      className="dropdown-link"
                      onClick={(e) => handleSubClick(e, item, sub)}
                    >
                      {sub}
                      {item.label === 'Phòng/Bàn' && idx === 1 && (
                        <span className="badge-new" style={{ color: navColor, background: `${navColor}22` }}>
                          Mới
                        </span>
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
        <button className="navbar-action-btn" title="Đặt bàn">
          <FontAwesomeIcon icon={faFileInvoice} />
        </button>
        <button className="navbar-action-btn" title="Thu ngân">
          <FontAwesomeIcon icon={faTag} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;