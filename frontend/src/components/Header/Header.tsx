import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faUser,
  faChevronDown,
  faFlag,
  faHeadset,
  faPalette,
  faBook,
  faPhone,
  faComments,
  faVideo,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const THEME_COLORS = [
  { name: 'Xanh lá', value: '#16a34a', light: '#dcfce7' },
  { name: 'Xanh dương', value: '#2563eb', light: '#dbeafe' },
  { name: 'Đỏ', value: '#dc2626', light: '#fee2e2' },
  { name: 'Cam', value: '#ea580c', light: '#ffedd5' },
  { name: 'Tím', value: '#7c3aed', light: '#ede9fe' },
  { name: 'Xanh cyan', value: '#0891b2', light: '#cffafe' },
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
  const [showTheme, setShowTheme] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setShowTheme(false);
      if (supportRef.current && !supportRef.current.contains(e.target as Node)) setShowSupport(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleColorPick = (color: string) => {
    onColorChange(color);
    setShowTheme(false);
  };

  const [showUserMenu, setShowUserMenu] = useState(false);

  // giả lập login (sau này nối backend)
  const [user, setUser] = useState<{ name: string } | null>({
    name: "Admin"
  });

  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {

      if (themeRef.current && !themeRef.current.contains(e.target as Node))
        setShowTheme(false);

      if (supportRef.current && !supportRef.current.contains(e.target as Node))
        setShowSupport(false);

      if (userRef.current && !userRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);

  }, []);

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
          <a
            href="#"
            className={`top-nav-item ${showTheme ? 'active-nav' : ''}`}
            onClick={(e) => { e.preventDefault(); setShowTheme(!showTheme); setShowSupport(false); }}
          >
            <FontAwesomeIcon icon={faPalette} className="nav-icon" style={{ color: navColor }} />
            <span>Chủ đề</span>
            <FontAwesomeIcon icon={faChevronDown} className={`nav-icon small ${showTheme ? 'rotated' : ''}`} />
          </a>

          {showTheme && (
            <div className="dropdown-panel theme-panel">
              <div className="color-grid">
                {THEME_COLORS.map(c => (
                  <button
                    key={c.value}
                    className="color-swatch"
                    style={{ background: c.value }}
                    title={c.name}
                    onClick={() => handleColorPick(c.value)}
                  >
                    {navColor === c.value && (
                      <FontAwesomeIcon icon={faCheck} className="color-check" />
                    )}
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Hỗ trợ */}
        <div className="top-nav-wrapper" ref={supportRef}>
          <a
            href="#"
            className={`top-nav-item ${showSupport ? 'active-nav' : ''}`}
            onClick={(e) => { e.preventDefault(); setShowSupport(!showSupport); setShowTheme(false); }}
          >
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
        <div className="user-wrapper" ref={userRef}>

          <button
            className="icon-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <FontAwesomeIcon icon={faUser} />
          </button>

          {showUserMenu && (
            <div className="user-menu">

              {user ? (
                <>
                  <div className="user-name">
                    {user.name}
                  </div>

                  <a href="#">Tài khoản</a>
                  <a href="#">Thông tin gian hàng</a>
                  <a href="#">Lịch sử thao tác</a>

                  <hr />

                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setUser(null);
                    }}
                  >
                    Đăng xuất
                  </a>

                </>
              ) : (

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setUser({ name: "Admin" });
                  }}
                >
                  Đăng nhập
                </a>

              )}

            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;