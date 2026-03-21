import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft, faChevronRight, faCalendarWeek,
  faFileImport, faFileExport, faUser, faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import employeesData from '../../employees.json';
import './WorkSchedule.css';

/* ── Types ── */
interface ShiftEntry {
  id: string;          // unique per entry
  employeeId: string;
  date: string;        // YYYY-MM-DD
  shiftName: string;
  shiftColor: string;
  shiftTextColor: string;
}

const SHIFTS = [
  { name: 'Ca sáng',  color: '#bbf7d0', textColor: '#166534', time: '08:00 - 12:00' },
  { name: 'Ca chiều', color: '#bfdbfe', textColor: '#1e40af', time: '13:00 - 17:00' },
  { name: 'Ca tối',   color: '#fed7aa', textColor: '#9a3412', time: '18:00 - 22:00' },
];

const DAYS_VI = ['CN', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const WAGE_PER_SHIFT = 80_000;

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

const toKey   = (d: Date) => d.toISOString().slice(0, 10);
const isToday = (d: Date) => toKey(d) === toKey(new Date());
const fmt     = (n: number) => n.toLocaleString('vi-VN');
const genId   = () => `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/* ── Fake initial data ── */
const today     = toKey(new Date());
const tomorrow  = toKey(new Date(Date.now() + 86400000));

const INIT_ENTRIES: ShiftEntry[] = [
  { id: genId(), employeeId: 'NV0001', date: today,    shiftName: 'Ca sáng',  shiftColor: '#bbf7d0', shiftTextColor: '#166534' },
  { id: genId(), employeeId: 'NV0001', date: today,    shiftName: 'Ca tối',   shiftColor: '#fed7aa', shiftTextColor: '#9a3412' },
  { id: genId(), employeeId: 'NV0002', date: today,    shiftName: 'Ca chiều', shiftColor: '#bfdbfe', shiftTextColor: '#1e40af' },
  { id: genId(), employeeId: 'NV0003', date: tomorrow, shiftName: 'Ca sáng',  shiftColor: '#bbf7d0', shiftTextColor: '#166534' },
  { id: genId(), employeeId: 'NV0003', date: tomorrow, shiftName: 'Ca chiều', shiftColor: '#bfdbfe', shiftTextColor: '#1e40af' },
];

/* ── Component ── */
const WorkSchedule: React.FC = () => {
  const [baseDate,  setBaseDate]  = useState(new Date());
  const [entries,   setEntries]   = useState<ShiftEntry[]>(INIT_ENTRIES);
  const [searchEmp, setSearchEmp] = useState('');

  /* Modal state */
  const [modal, setModal] = useState<{
    open: boolean; empId: string; date: string;
  }>({ open: false, empId: '', date: '' });

  /* Which shifts are checked in modal */
  const [checkedShifts, setCheckedShifts] = useState<string[]>([]);

  const employees  = employeesData.employees.filter(e => e.status === 'active');
  const weekDates  = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const filteredEmps = employees.filter(e =>
    e.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
    e.id.toLowerCase().includes(searchEmp.toLowerCase())
  );

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };
  const goToday  = () => setBaseDate(new Date());

  const weekLabel = `Tuần ${Math.ceil(weekDates[0].getDate() / 7)} - Th. ${weekDates[0].getMonth() + 1} ${weekDates[0].getFullYear()}`;

  /* Get entries for a specific employee + date */
  const getEntries = (empId: string, date: string) =>
    entries.filter(e => e.employeeId === empId && e.date === date);

  /* Open modal — pre-check shifts already assigned */
  const openModal = (empId: string, date: string) => {
    const existing = getEntries(empId, date).map(e => e.shiftName);
    setCheckedShifts(existing);
    setModal({ open: true, empId, date });
  };

  const toggleShift = (shiftName: string) => {
    setCheckedShifts(prev =>
      prev.includes(shiftName)
        ? prev.filter(s => s !== shiftName)
        : [...prev, shiftName]
    );
  };

  /* Save: diff between existing and new selection */
  const saveShifts = () => {
    const { empId, date } = modal;

    // Remove unchecked
    setEntries(prev =>
      prev.filter(e => !(e.employeeId === empId && e.date === date && !checkedShifts.includes(e.shiftName)))
    );

    // Add newly checked
    const existing = getEntries(empId, date).map(e => e.shiftName);
    const toAdd = checkedShifts.filter(s => !existing.includes(s));
    const newEntries: ShiftEntry[] = toAdd.map(s => {
      const shift = SHIFTS.find(sh => sh.name === s)!;
      return {
        id: genId(),
        employeeId: empId,
        date,
        shiftName: shift.name,
        shiftColor: shift.color,
        shiftTextColor: shift.textColor,
      };
    });

    setEntries(prev => [...prev, ...newEntries]);
    setModal(v => ({ ...v, open: false }));
  };

  const removeEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries(prev => prev.filter(en => en.id !== id));
  };

  /* Wage per employee for the week */
  const totalWage = (empId: string) => {
    const count = weekDates.reduce((sum, d) => sum + getEntries(empId, toKey(d)).length, 0);
    return count * WAGE_PER_SHIFT;
  };
  const grandTotal = employees.reduce((s, e) => s + totalWage(e.id), 0);

  /* Modal employee + date label */
  const modalEmp  = employees.find(e => e.id === modal.empId);
  const modalDate = modal.date
    ? new Date(modal.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })
    : '';

  /* ── Render ── */
  return (
    <div className="ws-page">
      {/* Header */}
      <div className="ws-header">
        <h1 className="ws-title">
          <FontAwesomeIcon icon={faCalendarWeek} /> Lịch làm việc
        </h1>
        <div className="ws-header-right">
          <button className="ws-btn-outline"><FontAwesomeIcon icon={faFileImport} /> Import</button>
          <button className="ws-btn-outline"><FontAwesomeIcon icon={faFileExport} /> Xuất file</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ws-toolbar">
        <div className="ws-toolbar-left">
          <div className="ws-search-wrap">
            <FontAwesomeIcon icon={faUser} className="ws-search-icon" />
            <input className="ws-search" placeholder="Tìm kiếm nhân viên..."
              value={searchEmp} onChange={e => setSearchEmp(e.target.value)} />
            <FontAwesomeIcon icon={faChevronDown} className="ws-search-arrow" />
          </div>

          <div className="ws-week-nav">
            <button className="ws-nav-btn" onClick={prevWeek}><FontAwesomeIcon icon={faChevronLeft} /></button>
            <span className="ws-week-label">{weekLabel}</span>
            <button className="ws-nav-btn" onClick={nextWeek}><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>

          <button className="ws-today-btn" onClick={goToday}>Tuần này</button>

          <div className="ws-view-group">
            <button className="ws-view-btn active">
              <FontAwesomeIcon icon={faUser} /> Xem theo nhân viên
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="ws-calendar-wrap">
        <table className="ws-table">
          <thead>
            <tr>
              <th className="ws-th ws-th-emp">Nhân viên</th>
              {weekDates.map((d, i) => (
                <th key={i} className={`ws-th ws-th-day ${isToday(d) ? 'today' : ''}`}>
                  <span className="ws-day-name">{DAYS_VI[(i + 1) % 7]}</span>
                  <span className={`ws-day-num ${isToday(d) ? 'today-circle' : ''}`}>{d.getDate()}</span>
                </th>
              ))}
              <th className="ws-th ws-th-wage">Lương dự kiến</th>
            </tr>
          </thead>
          <tbody>
            {/* Grand total row */}
            <tr className="ws-row-total">
              <td className="ws-td ws-td-emp" />
              {weekDates.map((_, i) => <td key={i} className="ws-td" />)}
              <td className="ws-td ws-td-wage ws-total-wage">{fmt(grandTotal)}</td>
            </tr>

            {filteredEmps.length === 0 ? (
              <tr><td colSpan={9} className="ws-empty">Không tìm thấy nhân viên</td></tr>
            ) : filteredEmps.map(emp => (
              <tr key={emp.id} className="ws-row">
                <td className="ws-td ws-td-emp">
                  <span className="ws-emp-name">{emp.name}</span>
                  <span className="ws-emp-id">{emp.id}</span>
                </td>
                {weekDates.map((d, i) => {
                  const key   = toKey(d);
                  const cells = getEntries(emp.id, key);
                  return (
                    <td key={i}
                      className={`ws-td ws-td-day ${isToday(d) ? 'today-col' : ''}`}
                      onClick={() => openModal(emp.id, key)}
                    >
                      <div className="ws-cell">
                        {cells.length === 0
                          ? <div className="ws-cell-placeholder">+</div>
                          : cells.map(c => (
                            <div key={c.id} className="ws-shift-tag"
                              style={{ background: c.shiftColor, color: c.shiftTextColor }}>
                              <span className="ws-shift-tag-name">{c.shiftName}</span>
                              <button
                                className="ws-shift-remove"
                                style={{ color: c.shiftTextColor }}
                                onClick={e => removeEntry(c.id, e)}
                                title="Xoá ca này"
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            </div>
                          ))
                        }
                      </div>
                    </td>
                  );
                })}
                <td className="ws-td ws-td-wage">
                  <span className="ws-wage">{fmt(totalWage(emp.id))}</span>
                  <span className="ws-shift-count">
                    {weekDates.reduce((s, d) => s + getEntries(emp.id, toKey(d)).length, 0)} ca
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/edit shifts modal */}
      {modal.open && (
        <div className="ws-overlay" onClick={() => setModal(v => ({ ...v, open: false }))}>
          <div className="ws-modal" onClick={e => e.stopPropagation()}>
            <div className="ws-modal-head">
              <div>
                <h3 className="ws-modal-title">Xếp ca làm việc</h3>
                <p className="ws-modal-sub">{modalEmp?.name} — {modalDate}</p>
              </div>
              <button className="ws-modal-close" onClick={() => setModal(v => ({ ...v, open: false }))}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <p className="ws-modal-hint">Chọn một hoặc nhiều ca trong ngày</p>

            <div className="ws-shift-options">
              {SHIFTS.map(s => {
                const checked = checkedShifts.includes(s.name);
                return (
                  <button key={s.name}
                    className={`ws-shift-opt ${checked ? 'selected' : ''}`}
                    style={checked ? {
                      background: s.color,
                      borderColor: s.textColor,
                      color: s.textColor,
                    } : {}}
                    onClick={() => toggleShift(s.name)}
                  >
                    <div className="ws-shift-opt-left">
                      <span className={`ws-shift-checkbox ${checked ? 'checked' : ''}`}
                        style={checked ? { background: s.textColor, borderColor: s.textColor } : {}}>
                        {checked && <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: '#fff', transform: 'rotate(45deg) scale(1.5)' }} />}
                      </span>
                      <span className="ws-shift-opt-name">{s.name}</span>
                    </div>
                    <span className="ws-shift-opt-time">{s.time}</span>
                  </button>
                );
              })}
            </div>

            {checkedShifts.length > 0 && (
              <div className="ws-modal-summary">
                Đã chọn <strong>{checkedShifts.length}</strong> ca:{' '}
                {checkedShifts.join(', ')}
              </div>
            )}

            <div className="ws-modal-footer">
              <button className="ws-btn-cancel" onClick={() => setModal(v => ({ ...v, open: false }))}>Huỷ</button>
              <button className="ws-btn-save" onClick={saveShifts}>
                Lưu lịch ({checkedShifts.length} ca)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSchedule;