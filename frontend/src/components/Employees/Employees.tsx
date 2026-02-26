import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faClipboardCheck, faEllipsisH, faBars,
  faSearch, faUserCircle, faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import './Employees.css';

const Employees: React.FC = () => {
  const [trangThai, setTrangThai] = useState('dang');
  const [phongBan, setPhongBan] = useState('');
  const [chucDanh, setChucDanh] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="page-layout nv-layout">
      {/* Sidebar */}
      <aside className="sidebar nv-sidebar">
        <div className="sidebar-section">
          <div className="section-title mb-8">Trạng thái nhân viên</div>
          <div className="radio-list">
            {[
              { value: 'dang', label: 'Đang làm việc' },
              { value: 'nghi', label: 'Đã nghỉ' },
            ].map(opt => (
              <label key={opt.value} className="radio-item">
                <input type="radio" name="nvTrangThai" value={opt.value} checked={trangThai === opt.value} onChange={() => setTrangThai(opt.value)} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Phòng ban</span>
            <FontAwesomeIcon icon={faPlusCircle} className="add-section-icon" />
          </div>
          <input className="sidebar-input" placeholder="Chọn phòng ban" value={phongBan} onChange={e => setPhongBan(e.target.value)} />
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Chức danh</span>
            <FontAwesomeIcon icon={faPlusCircle} className="add-section-icon" />
          </div>
          <input className="sidebar-input" placeholder="Chọn chức danh" value={chucDanh} onChange={e => setChucDanh(e.target.value)} />
        </div>
      </aside>

      {/* Main */}
      <main className="page-main">
        <div className="nv-topbar">
          <div className="nv-title-area">
            <h1 className="page-title">Danh sách nhân viên</h1>
            <p className="nv-subtitle">
              Đã sử dụng <span className="text-green">0</span> nhân viên.
              <a href="#" className="text-green"> Nâng gói</a>
            </p>
          </div>
          <div className="nv-search-area">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input className="search-input" placeholder="Tìm theo mã, tên nhân viên" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} />
              <span>Nhân viên</span>
            </button>
            <button className="btn btn-green-outline">
              <FontAwesomeIcon icon={faClipboardCheck} />
              <span>Duyệt yêu cầu</span>
            </button>
            <button className="btn btn-icon">
              <FontAwesomeIcon icon={faEllipsisH} />
            </button>
            <button className="btn btn-icon">
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header nv-table-header">
            <div className="th" style={{width: 40}}>
              <input type="checkbox" style={{accentColor: '#16a34a'}} />
            </div>
            <div className="th" style={{width: 60}}>Ảnh</div>
            <div className="th">Mã nhân viên</div>
            <div className="th">Mã chấm công</div>
            <div className="th" style={{flex: 2}}>Tên nhân viên</div>
            <div className="th">Số điện thoại</div>
            <div className="th">Số CMND/CCCD</div>
          </div>

          <div className="table-empty nv-empty">
            <FontAwesomeIcon icon={faUserCircle} className="empty-icon nv-empty-icon" />
            <p>Gian hàng chưa có nhân viên.</p>
            <p>Nhấn <a href="#" className="text-green">vào đây</a> để thêm mới nhân viên.</p>
          </div>
        </div>
      </main>

      {/* Fab */}
      <button className="fab-btn">
        <span>⚙</span> Khởi tạo
      </button>
    </div>
  );
};

export default Employees;