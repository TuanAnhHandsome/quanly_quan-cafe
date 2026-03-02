import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faBell, faGear, faChevronDown, faFlag,
  faHeadset, faPalette, faBook, faPhone, faComments,
  faVideo, faCheck, faRightFromBracket,
  faShield, faCircleUser,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const THEME_COLORS = [
  { name: 'Xanh lá', value: '#16a34a' },
  { name: 'Xanh dương', value: '#2563eb' },
  { name: 'Đỏ', value: '#dc2626' },
  { name: 'Cam', value: '#ea580c' },
  { name: 'Tím', value: '#7c3aed' },
  { name: 'Xanh cyan', value: '#0891b2' },
];

const SUPPORT_ITEMS = [
  { icon: faBook, label: 'Hướng dẫn sử dụng' },
  { icon: faPhone, label: 'Hotline: 1900 6522' },
  { icon: faComments, label: 'Chat hỗ trợ trực tuyến' },
  { icon: faVideo, label: 'Video hướng dẫn' },
];

interface HeaderProps {
  navColor: string;
  onColorChange: (color: string) => void;
}

const Header: React.FC<HeaderProps> = ({ navColor, onColorChange }) => {
  const { user, logout } = useAuth();

  const [showTheme, setShowTheme] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowTheme(false);
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) setShowSupport(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAll = () => { setShowTheme(false); setShowSupport(false); setShowUser(false); };

  const handleLogout = async () => {
    closeAll();
    await logout();
  };

  // Avatar initials
  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : 'U';

  const roleLabel: Record<string, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon" style={{ background: `linear-gradient(135deg, ${navColor}, ${navColor}cc)` }}>K</span>
          <span className="logo-text" style={{ color: navColor }}>KiotViet</span>
        </div>
      </div>

      {/* Top nav */}
      <nav className="header-top-nav">
        {/* Chủ đề */}
        <div className="top-nav-wrapper" ref={themeRef}>
          <a href="#" className={`top-nav-item ${showTheme ? 'active-nav' : ''}`}
            onClick={e => { e.preventDefault(); setShowTheme(!showTheme); setShowSupport(false); setShowUser(false); }}>
            <FontAwesomeIcon icon={faPalette} className="nav-icon" style={{ color: navColor }} />
            <span>Chủ đề</span>
            <FontAwesomeIcon icon={faChevronDown} className={`nav-icon small ${showTheme ? 'rotated' : ''}`} />
          </a>
          {showTheme && (
            <div className="dropdown-panel theme-panel">
              <p className="panel-title">Chọn màu giao diện</p>
              <div className="color-grid">
                {THEME_COLORS.map(c => (
                  <button key={c.value} className="color-swatch" style={{ background: c.value }} title={c.name}
                    onClick={() => { onColorChange(c.value); setShowTheme(false); }}>
                    {navColor === c.value && <FontAwesomeIcon icon={faCheck} className="color-check" />}
                  </button>
                ))}
              </div>
              <div className="color-names">
                {THEME_COLORS.map(c => (
                  <span key={c.value}
                    className={`color-label ${navColor === c.value ? 'color-label-active' : ''}`}
                    style={navColor === c.value ? { color: c.value } : {}}
                    onClick={() => { onColorChange(c.value); setShowTheme(false); }}>
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hỗ trợ */}
        <div className="top-nav-wrapper" ref={supportRef}>
          <a href="#" className={`top-nav-item ${showSupport ? 'active-nav' : ''}`}
            onClick={e => { e.preventDefault(); setShowSupport(!showSupport); setShowTheme(false); setShowUser(false); }}>
            <FontAwesomeIcon icon={faHeadset} className="nav-icon gray" />
            <span>Hỗ trợ</span>
            <FontAwesomeIcon icon={faChevronDown} className={`nav-icon small ${showSupport ? 'rotated' : ''}`} />
          </a>
          {showSupport && (
            <div className="dropdown-panel support-panel">
              <p className="panel-title">Hỗ trợ khách hàng</p>
              {SUPPORT_ITEMS.map(item => (
                <a href="#" key={item.label} className="support-item" onClick={e => e.preventDefault()}>
                  <span className="support-icon-wrap" style={{ background: `${navColor}18`, color: navColor }}>
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Chi nhánh */}
        <a href="#" className="top-nav-item branch">
          <span>Chi nhánh trung tâm</span>
          <FontAwesomeIcon icon={faLocationDot} className="nav-icon red" />
        </a>

        {/* Ngôn ngữ */}
        <a href="#" className="top-nav-item lang">
          <FontAwesomeIcon icon={faFlag} className="nav-icon red" />
          <span>Tiếng Việt (VN)</span>
          <FontAwesomeIcon icon={faChevronDown} className="nav-icon small" />
        </a>
      </nav>

      {/* Actions */}
      <div className="header-actions">
        <button className="icon-btn"><FontAwesomeIcon icon={faBell} /></button>
        <button className="icon-btn"><FontAwesomeIcon icon={faGear} /></button>

        {/* ── User wrapper ── */}
        <div className="user-wrapper" ref={userRef}>
          <button
            className={`user-trigger ${showUser ? 'user-trigger-active' : ''}`}
            onClick={() => { setShowUser(!showUser); setShowTheme(false); setShowSupport(false); }}
            style={{ borderColor: showUser ? navColor : 'transparent' }}
          >
            <div className="user-avatar" style={{ background: navColor }}>
              {initials}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.fullName ?? 'Người dùng'}</span>
              <span className="user-role">{roleLabel[user?.role ?? ''] ?? user?.role}</span>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className={`nav-icon small ${showUser ? 'rotated' : ''}`} />
          </button>

          {showUser && (
            <div className="dropdown-panel user-panel">
              {/* Header info */}
              <div className="user-panel-header" style={{ background: `${navColor}12` }}>
                <div className="user-panel-avatar" style={{ background: navColor }}>{initials}</div>
                <div>
                  <p className="user-panel-name">{user?.fullName}</p>
                  <p className="user-panel-email">{user?.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="user-panel-menu">
                <a href="#" className="user-menu-item" onClick={e => e.preventDefault()}>
                  <FontAwesomeIcon icon={faCircleUser} className="user-menu-icon" style={{ color: navColor }} />
                  <span>Thông tin tài khoản</span>
                </a>
                <a href="#" className="user-menu-item" onClick={e => e.preventDefault()}>
                  <FontAwesomeIcon icon={faShield} className="user-menu-icon" style={{ color: navColor }} />
                  <span>Đổi mật khẩu</span>
                </a>
              </div>

              <div className="user-panel-divider" />

              <button className="user-logout-btn" onClick={handleLogout}>
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;