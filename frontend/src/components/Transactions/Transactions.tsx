import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faFileExport, faBars, faChevronDown, faChevronUp,
  faInbox, faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';
import './Transactions.css';

const trangThaiOptions = ['Đang xử lý', 'Hoàn thành', 'Không giao được', 'Đã hủy'];
const trangThaiGiaoOptions = ['Chờ xử lý', 'Đang lấy hàng', 'Đang giao hàng', 'Giao thành công', 'Đang chuyển hoàn', 'Đã chuyển hoàn', 'Đã hủy'];
const paymentMethods = ['Tiền mặt', 'Thẻ', 'Chuyển khoản', 'Ví điện tử'];

const Transactions: React.FC = () => {
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [timeType, setTimeType] = useState<'today' | 'all' | 'custom'>('today');
  const [deliveryTimeType, setDeliveryTimeType] = useState<'all' | 'custom'>('all');
  const [checkedStatus, setCheckedStatus] = useState<string[]>(['Đang xử lý', 'Hoàn thành']);
  const [checkedDelivery, setCheckedDelivery] = useState<string[]>([]);
  const [checkedPayment, setCheckedPayment] = useState<string[]>([]);
  const [bangGia, setBangGia] = useState('');
  const [khuVuc, setKhuVuc] = useState('');
  const [phongBan, setPhongBan] = useState('');
  const [kenhBan, setKenhBan] = useState('');
  const [soBanGhi, setSoBanGhi] = useState('10');
  const [showTrangThai, setShowTrangThai] = useState(true);
  const [showGiaoHang, setShowGiaoHang] = useState(true);
  const [showPayment, setShowPayment] = useState(true);
  const [showBangGia, setShowBangGia] = useState(true);
  const [showPhongBan, setShowPhongBan] = useState(true);
  const [showKenhBan, setShowKenhBan] = useState(true);

  const toggleArr = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const CollapseSection: React.FC<{title: string; open: boolean; toggle: () => void; children: React.ReactNode}> = ({title, open, toggle, children}) => (
    <div className="sidebar-section">
      <div className="section-header" onClick={toggle}>
        <span className="section-title">{title}</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="section-chevron" />
      </div>
      {open && children}
    </div>
  );

  return (
    <div className="page-layout">
      <aside className="sidebar giao-dich-sidebar">
        {/* Search */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Tìm kiếm</span>
            <FontAwesomeIcon icon={faChevronUp} className="section-chevron" />
          </div>
          <input className="sidebar-input mb-6" placeholder="Theo mã hóa đơn" value={searchInvoice} onChange={e => setSearchInvoice(e.target.value)} />
          <input className="sidebar-input mb-6" placeholder="Theo mã, tên hàng" value={searchItem} onChange={e => setSearchItem(e.target.value)} />
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            Mở rộng <FontAwesomeIcon icon={faChevronDown} style={{fontSize: 10}} />
          </button>
        </div>

        {/* Thời gian */}
        <div className="sidebar-section">
          <div className="section-title mb-8">Thời gian</div>
          <div className="radio-list">
            <label className="radio-item">
              <input type="radio" name="time" checked={timeType === 'today'} onChange={() => setTimeType('today')} />
              <span className="select-inline">
                <select className="select-input-sm" defaultValue="Hôm nay">
                  <option>Hôm nay</option>
                  <option>Hôm qua</option>
                  <option>7 ngày qua</option>
                  <option>Tháng này</option>
                  <option>Toàn thời gian</option>
                </select>
              </span>
            </label>
            <label className="radio-item">
              <input type="radio" name="time" checked={timeType === 'custom'} onChange={() => setTimeType('custom')} />
              <span className="date-picker-row">
                <span>Lựa chọn khác</span>
                <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
              </span>
            </label>
          </div>
        </div>

        {/* Trạng thái */}
        <CollapseSection title="Trạng thái" open={showTrangThai} toggle={() => setShowTrangThai(!showTrangThai)}>
          <div className="checkbox-list">
            {trangThaiOptions.map(t => (
              <label key={t} className="checkbox-item">
                <input type="checkbox" checked={checkedStatus.includes(t)} onChange={() => toggleArr(checkedStatus, t, setCheckedStatus)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </CollapseSection>

        {/* Trạng thái giao hàng */}
        <CollapseSection title="Trạng thái giao hàng" open={showGiaoHang} toggle={() => setShowGiaoHang(!showGiaoHang)}>
          <div className="checkbox-list">
            {trangThaiGiaoOptions.map(t => (
              <label key={t} className="checkbox-item">
                <input type="checkbox" checked={checkedDelivery.includes(t)} onChange={() => toggleArr(checkedDelivery, t, setCheckedDelivery)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </CollapseSection>

        {/* Kênh bán */}
        <CollapseSection title="Kênh bán" open={showKenhBan} toggle={() => setShowKenhBan(!showKenhBan)}>
          <input className="sidebar-input" placeholder="Chọn kênh bán" value={kenhBan} onChange={e => setKenhBan(e.target.value)} />
        </CollapseSection>

        {/* Thời gian giao */}
        <div className="sidebar-section">
          <div className="section-title mb-8">Thời gian giao</div>
          <div className="radio-list">
            <label className="radio-item">
              <input type="radio" name="dtime" checked={deliveryTimeType === 'all'} onChange={() => setDeliveryTimeType('all')} />
              <span className="select-inline">
                <select className="select-input-sm">
                  <option>Toàn thời gian</option>
                  <option>Hôm nay</option>
                  <option>7 ngày qua</option>
                </select>
              </span>
            </label>
            <label className="radio-item">
              <input type="radio" name="dtime" checked={deliveryTimeType === 'custom'} onChange={() => setDeliveryTimeType('custom')} />
              <span className="date-picker-row">
                <span>Lựa chọn khác</span>
                <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
              </span>
            </label>
          </div>
        </div>

        {/* Phương thức */}
        <CollapseSection title="Phương thức" open={showPayment} toggle={() => setShowPayment(!showPayment)}>
          <div className="checkbox-list">
            {paymentMethods.map(t => (
              <label key={t} className="checkbox-item">
                <input type="checkbox" checked={checkedPayment.includes(t)} onChange={() => toggleArr(checkedPayment, t, setCheckedPayment)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </CollapseSection>

        {/* Bảng giá */}
        <CollapseSection title="Bảng giá" open={showBangGia} toggle={() => setShowBangGia(!showBangGia)}>
          <input className="sidebar-input" placeholder="Chọn bảng giá..." value={bangGia} onChange={e => setBangGia(e.target.value)} />
        </CollapseSection>

        {/* Phòng/Bàn */}
        <CollapseSection title="Phòng/Bàn" open={showPhongBan} toggle={() => setShowPhongBan(!showPhongBan)}>
          <input className="sidebar-input mb-6" placeholder="Chọn khu vực" value={khuVuc} onChange={e => setKhuVuc(e.target.value)} />
          <input className="sidebar-input" placeholder="Chọn phòng/bàn..." value={phongBan} onChange={e => setPhongBan(e.target.value)} />
        </CollapseSection>

        {/* Số bản ghi */}
        <div className="sidebar-section">
          <div className="records-row">
            <span>Số bản ghi:</span>
            <select className="select-input" style={{width: 'auto', padding: '4px 8px'}} value={soBanGhi} onChange={e => setSoBanGhi(e.target.value)}>
              <option>10</option><option>20</option><option>50</option>
            </select>
          </div>
        </div>
      </aside>

      <main className="page-main">
        <div className="page-toolbar">
          <h1 className="page-title">Hóa đơn</h1>
          <div className="toolbar-right">
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} />
              <span>Nhận gọi món</span>
            </button>
            <button className="btn btn-green-outline">
              <FontAwesomeIcon icon={faFileExport} />
              <span>Xuất file</span>
              <FontAwesomeIcon icon={faChevronDown} className="btn-arrow" />
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
            <div className="th">Mã hóa đơn</div>
            <div className="th">Thời gian (Giờ đi)</div>
            <div className="th" style={{flex: 2}}>Khách hàng</div>
            <div className="th">Tổng tiền hàng</div>
            <div className="th">Giảm giá</div>
            <div className="th">Khách đã trả</div>
          </div>

          <div className="table-empty">
            <FontAwesomeIcon icon={faInbox} className="empty-icon" />
            <p>
              Không tìm thấy hóa đơn nào phù hợp trong .{' '}
              <a href="#">vào đây</a> để tìm kiếm trên toàn thời gian.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transactions;