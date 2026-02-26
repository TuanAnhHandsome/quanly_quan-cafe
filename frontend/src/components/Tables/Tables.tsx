import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faFileImport, faFileExport, faQrcode,
  faChevronDown, faInbox, faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import './Tables.css';

const Tables: React.FC = () => {
  const [khuVuc, setKhuVuc] = useState('--Tất cả--');
  const [search, setSearch] = useState('');
  const [trangThai, setTrangThai] = useState('dang');
  const [soBanGhi, setSoBanGhi] = useState('10');

  return (
    <div className="page-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <label className="sidebar-label">Khu vực</label>
          <select
            className="select-input"
            value={khuVuc}
            onChange={e => setKhuVuc(e.target.value)}
          >
            <option>--Tất cả--</option>
            <option>Tầng 1</option>
            <option>Tầng 2</option>
            <option>Sân thượng</option>
          </select>
        </div>

        <div className="sidebar-section">
          <label className="sidebar-label">Tìm kiếm</label>
          <input
            className="sidebar-input"
            placeholder="Theo tên phòng/bàn"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Trạng thái</span>
            <FontAwesomeIcon icon={faChevronDown} className="section-chevron" style={{transform: 'rotate(180deg)'}} />
          </div>
          <div className="radio-list">
            {[
              { value: 'dang', label: 'Đang hoạt động' },
              { value: 'ngung', label: 'Ngừng hoạt động' },
              { value: 'tat', label: 'Tất cả' },
            ].map(opt => (
              <label key={opt.value} className="radio-item">
                <input
                  type="radio"
                  name="trangThai"
                  value={opt.value}
                  checked={trangThai === opt.value}
                  onChange={() => setTrangThai(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="records-row">
            <span>Số bản ghi:</span>
            <select
              className="select-input"
              style={{width: 'auto', padding: '4px 8px'}}
              value={soBanGhi}
              onChange={e => setSoBanGhi(e.target.value)}
            >
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="page-main">
        <div className="page-toolbar">
          <div className="toolbar-left">
            <a href="#" className="guide-link">
              <FontAwesomeIcon icon={faBookOpen} />
              <span>Hướng dẫn sử dụng</span>
            </a>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} />
              <span>Thêm phòng/bàn</span>
            </button>
            <button className="btn btn-green-outline">
              <FontAwesomeIcon icon={faFileImport} />
              <span>Import</span>
            </button>
            <button className="btn btn-green-outline">
              <FontAwesomeIcon icon={faFileExport} />
              <span>Xuất file</span>
            </button>
            <button className="btn btn-blue-outline">
              <FontAwesomeIcon icon={faQrcode} />
              <span>Tải tất cả mã QR</span>
            </button>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="th" style={{width: 40}}><input type="checkbox" /></div>
            <div className="th">Tên phòng/bàn</div>
            <div className="th">Ghi chú</div>
            <div className="th">Khu vực</div>
            <div className="th">Số ghế</div>
            <div className="th">Trạng thái</div>
            <div className="th">Số thứ tự</div>
            <div className="th">Xem mã QR</div>
          </div>

          <div className="table-empty">
            <FontAwesomeIcon icon={faInbox} className="empty-icon" />
            <p>Không tìm thấy phòng/bàn nào phù hợp</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tables;