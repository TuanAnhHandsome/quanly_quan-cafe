import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faFileImport, faFileExport, faBars,
  faChevronDown, faChevronUp, faInbox, faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import './Products.css';

const menuTypes = ['Đồ ăn', 'Đồ uống', 'Khác'];
const itemTypes = ['Hàng hóa thường', 'Chế biến', 'Dịch vụ', 'Combo - Đóng gói', 'Combo tùy chọn', 'Buffet gọi món'];

const Products: React.FC = () => {
  const [checkedMenuTypes, setCheckedMenuTypes] = useState<string[]>([]);
  const [checkedItemTypes, setCheckedItemTypes] = useState<string[]>([]);
  const [showMenuType, setShowMenuType] = useState(true);
  const [showItemType, setShowItemType] = useState(true);
  const [search, setSearch] = useState('');

  const toggle = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <div className="page-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <label className="sidebar-label">Tìm kiếm</label>
          <input
            className="sidebar-input"
            placeholder="Theo mã, tên hàng hóa"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="sidebar-section">
          <div className="section-header" onClick={() => setShowMenuType(!showMenuType)}>
            <span className="section-title">Loại thực đơn</span>
            <FontAwesomeIcon icon={showMenuType ? faChevronUp : faChevronDown} className="section-chevron" />
          </div>
          {showMenuType && (
            <div className="checkbox-list">
              {menuTypes.map(t => (
                <label key={t} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checkedMenuTypes.includes(t)}
                    onChange={() => toggle(checkedMenuTypes, t, setCheckedMenuTypes)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="section-header" onClick={() => setShowItemType(!showItemType)}>
            <span className="section-title">Loại hàng</span>
            <FontAwesomeIcon icon={showItemType ? faChevronUp : faChevronDown} className="section-chevron" />
          </div>
          {showItemType && (
            <div className="checkbox-list">
              {itemTypes.map(t => (
                <label key={t} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={checkedItemTypes.includes(t)}
                    onChange={() => toggle(checkedItemTypes, t, setCheckedItemTypes)}
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
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
              <span>Thêm mới</span>
              <FontAwesomeIcon icon={faChevronDown} className="btn-arrow" />
            </button>
            <button className="btn btn-green-outline">
              <FontAwesomeIcon icon={faFileImport} />
              <span>Import</span>
            </button>
            <button className="btn btn-green-outline">
              <FontAwesomeIcon icon={faFileExport} />
              <span>Xuất file</span>
            </button>
            <button className="btn btn-icon">
              <FontAwesomeIcon icon={faBars} />
              <FontAwesomeIcon icon={faChevronDown} className="btn-arrow" />
            </button>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="th" style={{width: 40}}><input type="checkbox" /></div>
            <div className="th img-col">Ảnh hàng hóa</div>
            <div className="th">Tên hàng</div>
            <div className="th">Loại thực đơn</div>
            <div className="th">Giá bán</div>
            <div className="th">Giá vốn</div>
            <div className="th">Tồn kho</div>
            <div className="th">Đặt hàng</div>
          </div>

          <div className="table-empty">
            <FontAwesomeIcon icon={faInbox} className="empty-icon" />
            <p>Không tìm thấy hàng hóa nào phù hợp</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;