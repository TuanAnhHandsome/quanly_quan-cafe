import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faLock, faEye, faEyeSlash,
  faCircleNotch, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

interface LoginProps {
  navColor: string;
}

const Login: React.FC<LoginProps> = ({ navColor }) => {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('admin@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Vui lòng nhập đầy đủ thông tin.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-left" style={{ background: `linear-gradient(145deg, ${navColor}ee, ${navColor})` }}>
        <div className="login-brand">
          <div className="login-logo">K</div>
          <h1 className="login-brand-name">KiotViet</h1>
          <p className="login-brand-sub">Hệ thống quản lý quán cafe</p>
        </div>
        <div className="login-decoration">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
        <div className="login-features">
          {['Quản lý thực đơn & hàng hóa', 'Theo dõi doanh thu theo thời gian thực', 'Quản lý nhân viên & ca làm', 'Báo cáo chi tiết'].map(f => (
            <div key={f} className="feature-item">
              <span className="feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Đăng nhập</h2>
            <p className="login-subtitle">Chào mừng trở lại! Nhập thông tin để tiếp tục.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="field-input-wrap">
                <FontAwesomeIcon icon={faEnvelope} className="field-icon" />
                <input
                  type="email"
                  className={`field-input ${error ? 'input-error' : ''}`}
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Mật khẩu</label>
              <div className="field-input-wrap">
                <FontAwesomeIcon icon={faLock} className="field-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`field-input ${error ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="error-box">
                <FontAwesomeIcon icon={faTriangleExclamation} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-login"
              style={{ background: navColor }}
              disabled={loading}
            >
              {loading
                ? <><FontAwesomeIcon icon={faCircleNotch} spin /> Đang đăng nhập...</>
                : 'Đăng nhập'}
            </button>
          </form>

          <p className="login-footer-note">
            © 2025 KiotViet — Hệ thống quản lý quán cafe
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
