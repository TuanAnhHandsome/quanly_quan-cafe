import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft, faChevronRight, faClipboardCheck,
  faUser, faChevronDown, faPlus, faCheckCircle,
  faMoneyBill, faXmark, faPen,
} from '@fortawesome/free-solid-svg-icons';
import employeesData from '../../employees.json';
import './Attendance.css';

/* ── Types ── */
type AttendanceStatus = 'on-time' | 'late' | 'missing' | 'pending' | 'off';

interface AttendanceEntry {
  employeeId: string;
  date: string;
  shiftName: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface SalarySetting {
  employeeId: string;
  ratePerHour: number;   // VND/giờ
}

/* ── Helpers ── */
const parseHours = (start: string, end: string): number => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
};

const fmt     = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const toKey   = (d: Date)   => d.toISOString().slice(0, 10);
const isToday = (d: Date)   => toKey(d) === toKey(new Date());

const getWeekDates = (base: Date): Date[] => {
  const day = base.getDay();
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const DAYS_VI = ['CN', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

const INIT_SHIFTS: Shift[] = [
  { id: 'ca-sang',  name: 'Ca sáng',  startTime: '08:00', endTime: '12:00' },
  { id: 'ca-chieu', name: 'Ca chiều', startTime: '13:00', endTime: '17:00' },
  { id: 'ca-toi',   name: 'Ca tối',   startTime: '18:00', endTime: '22:00' },
];

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  'on-time': { label: 'Đúng giờ',         color: '#1d4ed8', bg: '#dbeafe' },
  'late':    { label: 'Đi muộn / Về sớm', color: '#7c3aed', bg: '#ede9fe' },
  'missing': { label: 'Chấm công thiếu',  color: '#b91c1c', bg: '#fee2e2' },
  'pending': { label: 'Chưa chấm công',   color: '#9a3412', bg: '#fed7aa' },
  'off':     { label: 'Nghỉ làm',         color: '#6b7280', bg: '#f3f4f6' },
};

/* ── Fake data ── */
const today     = toKey(new Date());
const yesterday = toKey(new Date(Date.now() - 86400000));

const INIT_ENTRIES: AttendanceEntry[] = [
  { employeeId: 'NV0001', date: today,     shiftName: 'Ca chiều', status: 'pending' },
  { employeeId: 'NV0002', date: yesterday, shiftName: 'Ca sáng',  status: 'on-time', checkIn: '08:02', checkOut: '12:05' },
  { employeeId: 'NV0003', date: yesterday, shiftName: 'Ca tối',   status: 'late',    checkIn: '18:25', checkOut: '22:00' },
  { employeeId: 'NV0004', date: today,     shiftName: 'Ca sáng',  status: 'pending' },
];

/* Mức lương mặc định 25.000đ/giờ */
const INIT_SALARY: SalarySetting[] = [
  { employeeId: 'NV0001', ratePerHour: 25000 },
  { employeeId: 'NV0002', ratePerHour: 30000 },
  { employeeId: 'NV0003', ratePerHour: 25000 },
  { employeeId: 'NV0004', ratePerHour: 20000 },
  { employeeId: 'NV0005', ratePerHour: 25000 },
  { employeeId: 'NV0006', ratePerHour: 20000 },
  { employeeId: 'NV0007', ratePerHour: 22000 },
  { employeeId: 'NV0008', ratePerHour: 28000 },
];

/* ── Component ── */
const Attendance: React.FC = () => {
  const [baseDate,      setBaseDate]      = useState(new Date());
  const [shifts,        setShifts]        = useState<Shift[]>(INIT_SHIFTS);
  const [entries,       setEntries]       = useState<AttendanceEntry[]>(INIT_ENTRIES);
  const [salaries,      setSalaries]      = useState<SalarySetting[]>(INIT_SALARY);
  const [viewMode,      setViewMode]      = useState<'shift' | 'employee'>('shift');
  const [searchEmp,     setSearchEmp]     = useState('');

  /* Modals */
  const [addShiftOpen,  setAddShiftOpen]  = useState(false);
  const [newShift,      setNewShift]      = useState({ name: '', startTime: '08:00', endTime: '12:00' });
  const [salaryOpen,    setSalaryOpen]    = useState(false);
  const [salaryEdit,    setSalaryEdit]    = useState<Record<string, string>>({}); // empId → input string

  const employees  = employeesData.employees.filter(e => e.status === 'active');
  const weekDates  = useMemo(() => getWeekDates(baseDate), [baseDate]);
  const weekLabel  = `Tuần ${Math.ceil(weekDates[0].getDate() / 7)} - Th. ${weekDates[0].getMonth() + 1} ${weekDates[0].getFullYear()}`;

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  /* Get salary rate for employee */
  const getRate = (empId: string) =>
    salaries.find(s => s.employeeId === empId)?.ratePerHour ?? 25000;

  /* Tính giờ làm của ca */
  const shiftHours = (shiftName: string) => {
    const shift = shifts.find(s => s.name === shiftName);
    return shift ? parseHours(shift.startTime, shift.endTime) : 0;
  };

  /* Lương tuần của 1 nhân viên */
  const weeklyWage = (empId: string) => {
    const rate = getRate(empId);
    return weekDates.reduce((total, d) => {
      const dayEntries = entries.filter(e =>
        e.employeeId === empId && e.date === toKey(d) && e.status !== 'off' && e.status !== 'missing'
      );
      return total + dayEntries.reduce((s, e) => s + shiftHours(e.shiftName) * rate, 0);
    }, 0);
  };

  const grandTotal = employees.reduce((s, e) => s + weeklyWage(e.id), 0);

  /* Cycle attendance status */
  const cycleStatus = (shiftName: string, empId: string, date: string) => {
    const statuses: AttendanceStatus[] = ['pending', 'on-time', 'late', 'missing', 'off'];
    setEntries(prev => {
      const existing = prev.find(e => e.shiftName === shiftName && e.employeeId === empId && e.date === date);
      if (existing) {
        const next = statuses[(statuses.indexOf(existing.status) + 1) % statuses.length];
        return prev.map(e => e.shiftName === shiftName && e.employeeId === empId && e.date === date
          ? { ...e, status: next } : e);
      }
      return [...prev, { employeeId: empId, date, shiftName, status: 'pending' }];
    });
  };

  /* Add shift */
  const saveNewShift = () => {
    if (!newShift.name.trim()) return;
    setShifts(prev => [...prev, { id: `shift-${Date.now()}`, ...newShift }]);
    setNewShift({ name: '', startTime: '08:00', endTime: '12:00' });
    setAddShiftOpen(false);
  };

  /* Open salary modal — populate edit state */
  const openSalary = () => {
    const map: Record<string, string> = {};
    employees.forEach(e => {
      map[e.id] = String(getRate(e.id));
    });
    setSalaryEdit(map);
    setSalaryOpen(true);
  };

  /* Save salary */
  const saveSalary = () => {
    const updated: SalarySetting[] = employees.map(e => ({
      employeeId: e.id,
      ratePerHour: parseInt(salaryEdit[e.id]?.replace(/\D/g, '') || '0', 10) || 0,
    }));
    setSalaries(updated);
    setSalaryOpen(false);
  };

  const fmtInput = (val: string) => {
    const num = val.replace(/\D/g, '');
    return num ? Number(num).toLocaleString('vi-VN') : '';
  };

  /* ── Render ── */
  return (
    <div className="att-page">

      {/* ── Header ── */}
      <div className="att-header">
        <h1 className="att-title">
          <FontAwesomeIcon icon={faClipboardCheck} /> Bảng chấm công
        </h1>
        <div className="att-header-right">
          <button className="att-salary-btn" onClick={openSalary}>
            <FontAwesomeIcon icon={faMoneyBill} /> Cấu hình lương
          </button>
          <button className="att-approve-btn">
            <FontAwesomeIcon icon={faCheckCircle} /> Duyệt chấm công
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="att-toolbar">
        <div className="att-toolbar-left">
          <div className="att-search-wrap">
            <FontAwesomeIcon icon={faUser} className="att-search-icon" />
            <input className="att-search" placeholder="Tìm kiếm nhân viên..."
              value={searchEmp} onChange={e => setSearchEmp(e.target.value)} />
            <FontAwesomeIcon icon={faChevronDown} className="att-search-arrow" />
          </div>

          <div className="att-select-wrap">
            <select className="att-select" defaultValue="all">
              <option value="all">Theo tất cả</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <FontAwesomeIcon icon={faChevronDown} className="att-select-arrow" />
          </div>

          <div className="att-week-nav">
            <button className="att-nav-btn" onClick={prevWeek}><FontAwesomeIcon icon={faChevronLeft} /></button>
            <span className="att-week-label">{weekLabel}</span>
            <button className="att-nav-btn" onClick={nextWeek}><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>

          <button className="att-today-btn" onClick={() => setBaseDate(new Date())}>Chọn</button>

          <div className="att-view-group">
            <button className={`att-view-btn ${viewMode === 'shift' ? 'active' : ''}`}
              onClick={() => setViewMode('shift')}>Xem theo ca</button>
            <button className={`att-view-btn ${viewMode === 'employee' ? 'active' : ''}`}
              onClick={() => setViewMode('employee')}>Xem theo nhân viên</button>
          </div>
        </div>
        <button className="att-more-btn">···</button>
      </div>

      {/* ── Wage summary bar ── */}
      <div className="att-wage-bar">
        <span className="att-wage-label">Lương dự kiến tuần này</span>
        <div className="att-wage-chips">
          {employees.slice(0, 5).map(e => (
            <span key={e.id} className="att-wage-chip">
              <span className="att-wage-chip-name">{e.name.split(' ').pop()}</span>
              <span className="att-wage-chip-val">{fmt(weeklyWage(e.id))}</span>
            </span>
          ))}
          {employees.length > 5 && (
            <span className="att-wage-chip more">+{employees.length - 5} khác</span>
          )}
        </div>
        <span className="att-wage-total">Tổng: <strong>{fmt(grandTotal)}</strong></span>
      </div>

      {/* ── Calendar ── */}
      <div className="att-calendar-wrap">
        <table className="att-table">
          <thead>
            <tr>
              <th className="att-th att-th-shift">
                <div className="att-th-shift-inner">
                  <span>Ca làm việc</span>
                  <button className="att-add-shift-btn" onClick={() => setAddShiftOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </th>
              {weekDates.map((d, i) => (
                <th key={i} className={`att-th att-th-day ${isToday(d) ? 'today' : ''}`}>
                  <span className="att-day-name">{DAYS_VI[(i + 1) % 7]}</span>
                  <span className={`att-day-num ${isToday(d) ? 'today-circle' : ''}`}>{d.getDate()}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map(shift => {
              const hours = parseHours(shift.startTime, shift.endTime);
              return (
                <tr key={shift.id} className="att-row">
                  <td className="att-td att-td-shift">
                    <span className="att-shift-name">{shift.name}</span>
                    <span className="att-shift-time">{shift.startTime} - {shift.endTime}</span>
                    <span className="att-shift-hours">{hours}h</span>
                  </td>
                  {weekDates.map((d, i) => {
                    const key = toKey(d);
                    const dayEntries = entries.filter(e => e.shiftName === shift.name && e.date === key);
                    const filtered   = searchEmp
                      ? dayEntries.filter(e => {
                          const emp = employees.find(em => em.id === e.employeeId);
                          return emp?.name.toLowerCase().includes(searchEmp.toLowerCase());
                        })
                      : dayEntries;

                    return (
                      <td key={i} className={`att-td att-td-day ${isToday(d) ? 'today-col' : ''}`}>
                        <div className="att-cell">
                          {filtered.length === 0 ? (
                            <p className="att-cell-hint">Chọn để xếp nhân viên làm ca.</p>
                          ) : filtered.map(entry => {
                            const emp  = employees.find(em => em.id === entry.employeeId);
                            const cfg  = STATUS_CONFIG[entry.status];
                            const wage = entry.status !== 'off' && entry.status !== 'missing'
                              ? hours * getRate(entry.employeeId) : 0;
                            return (
                              <div key={entry.employeeId}
                                className="att-entry"
                                style={{ background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}
                                onClick={() => cycleStatus(shift.name, entry.employeeId, key)}
                                title="Click để đổi trạng thái"
                              >
                                <span className="att-entry-name">{emp?.name}</span>
                                <span className="att-entry-time">
                                  {entry.checkIn || '--'} – {entry.checkOut || '--'}
                                </span>
                                <div className="att-entry-footer">
                                  <span className="att-entry-status" style={{ color: cfg.color }}>{cfg.label}</span>
                                  {wage > 0 && (
                                    <span className="att-entry-wage">{fmt(wage)}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend ── */}
      <div className="att-legend">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} className="att-legend-item">
            <span className="att-legend-dot" style={{ background: cfg.color }} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* ── Modal: Thêm ca ── */}
      {addShiftOpen && (
        <div className="att-overlay" onClick={() => setAddShiftOpen(false)}>
          <div className="att-modal" onClick={e => e.stopPropagation()}>
            <h3 className="att-modal-title">Thêm ca làm việc</h3>
            <div className="att-form">
              <div className="att-field">
                <label className="att-label">Tên ca <span className="att-req">*</span></label>
                <input className="att-input" placeholder="VD: Ca sáng, Ca khuya..."
                  value={newShift.name} onChange={e => setNewShift(v => ({ ...v, name: e.target.value }))} />
              </div>
              <div className="att-row-form">
                <div className="att-field">
                  <label className="att-label">Giờ bắt đầu</label>
                  <input className="att-input" type="time"
                    value={newShift.startTime} onChange={e => setNewShift(v => ({ ...v, startTime: e.target.value }))} />
                </div>
                <div className="att-field">
                  <label className="att-label">Giờ kết thúc</label>
                  <input className="att-input" type="time"
                    value={newShift.endTime} onChange={e => setNewShift(v => ({ ...v, endTime: e.target.value }))} />
                </div>
              </div>
              {newShift.startTime && newShift.endTime && (
                <div className="att-shift-preview">
                  Số giờ: <strong>{parseHours(newShift.startTime, newShift.endTime)}h</strong>
                </div>
              )}
            </div>
            <div className="att-modal-footer">
              <button className="att-btn-cancel" onClick={() => setAddShiftOpen(false)}>Huỷ</button>
              <button className="att-btn-save" onClick={saveNewShift}>Lưu ca</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cấu hình lương ── */}
      {salaryOpen && (
        <div className="att-overlay" onClick={() => setSalaryOpen(false)}>
          <div className="att-salary-modal" onClick={e => e.stopPropagation()}>
            <div className="att-salary-header">
              <div>
                <h3 className="att-modal-title">Cấu hình mức lương</h3>
                <p className="att-salary-sub">Đơn vị: VND / giờ làm việc</p>
              </div>
              <button className="att-salary-close" onClick={() => setSalaryOpen(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="att-salary-list">
              {employees.map(emp => (
                <div key={emp.id} className="att-salary-row">
                  <div className="att-salary-emp">
                    <span className="att-salary-name">{emp.name}</span>
                    <span className="att-salary-id">{emp.id}</span>
                  </div>
                  <div className="att-salary-input-wrap">
                    <input
                      className="att-salary-input"
                      placeholder="25.000"
                      value={salaryEdit[emp.id] ?? ''}
                      onChange={e => setSalaryEdit(prev => ({
                        ...prev,
                        [emp.id]: fmtInput(e.target.value),
                      }))}
                    />
                    <span className="att-salary-unit">đ/giờ</span>
                  </div>
                  <div className="att-salary-preview">
                    {salaryEdit[emp.id]
                      ? `≈ ${fmt(parseInt(salaryEdit[emp.id].replace(/\D/g, '') || '0', 10) * 8)}/ngày`
                      : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="att-salary-hint">
              <FontAwesomeIcon icon={faMoneyBill} />
              Lương mỗi ca = Mức lương/giờ × Số giờ ca đó. Trạng thái "Nghỉ" và "Chấm công thiếu" không tính lương.
            </div>

            <div className="att-modal-footer">
              <button className="att-btn-cancel" onClick={() => setSalaryOpen(false)}>Huỷ</button>
              <button className="att-btn-save" onClick={saveSalary}>
                <FontAwesomeIcon icon={faCheckCircle} /> Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;