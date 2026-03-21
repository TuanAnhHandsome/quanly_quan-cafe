import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faPen, faTrash, faSearch, faFilter,
  faToggleOn, faToggleOff, faXmark, faChevronDown,
  faUser, faPhone, faEnvelope, faBuilding, faBriefcase,
  faCalendar, faVenusMars, faLocationDot, faUserTie,
} from '@fortawesome/free-solid-svg-icons';
import type { Employee, Department, Position, EmployeeForm } from './employeeTypes';
import { INIT_FORM, genEmpId, initials, avatarColor } from './employeeTypes';
import './EmployeeList.css';

/* ── Overlay ── */
const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="el-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    {children}
  </div>
);

/* ── Props ── */
interface Props {
  employees:   Employee[];
  departments: Department[];
  positions:   Position[];
  onAdd:       (form: EmployeeForm) => void;
  onUpdate:    (id: string, form: EmployeeForm) => void;
  onDelete:    (id: string) => void;
  onToggle:    (id: string) => void;
  onDeptAdd:   (name: string) => void;
  onDeptUpdate:(id: string, name: string) => void;
  onDeptDelete:(id: string) => void;
  onPosAdd:    (name: string) => void;
  onPosUpdate: (id: string, name: string) => void;
  onPosDelete: (id: string) => void;
}

const EmployeeList: React.FC<Props> = ({
  employees, departments, positions,
  onAdd, onUpdate, onDelete, onToggle,
  onDeptAdd, onDeptUpdate, onDeptDelete,
  onPosAdd, onPosUpdate, onPosDelete,
}) => {
  /* ── Filters ── */
  const [search,       setSearch]       = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [filterPos,    setFilterPos]    = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilter,   setShowFilter]   = useState(false);

  /* ── Employee modal ── */
  const [empModal, setEmpModal] = useState<{
    open: boolean; mode: 'add' | 'edit'; form: EmployeeForm; editId?: string;
  }>({ open: false, mode: 'add', form: { ...INIT_FORM } });

  /* ── Detail drawer ── */
  const [detailId, setDetailId] = useState<string | null>(null);

  /* ── Dept modal ── */
  const [deptModal, setDeptModal] = useState<{
    open: boolean; mode: 'add' | 'edit'; name: string; editId?: string;
  }>({ open: false, mode: 'add', name: '' });

  /* ── Pos modal ── */
  const [posModal, setPosModal] = useState<{
    open: boolean; mode: 'add' | 'edit'; name: string; editId?: string;
  }>({ open: false, mode: 'add', name: '' });

  /* ── Confirm ── */
  const [confirm, setConfirm] = useState<{
    open: boolean; message: string; onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  /* ── Derived ── */
  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase();
    if (q && !e.name.toLowerCase().includes(q) && !e.id.toLowerCase().includes(q) && !e.phone.includes(q)) return false;
    if (filterDept   && e.departmentId !== filterDept)   return false;
    if (filterPos    && e.positionId   !== filterPos)    return false;
    if (filterStatus && e.status       !== filterStatus) return false;
    return true;
  }), [employees, search, filterDept, filterPos, filterStatus]);

  const activeFilters = [filterDept, filterPos, filterStatus].filter(Boolean).length;
  const detailEmp = employees.find(e => e.id === detailId);
  const deptName  = (id: string) => departments.find(d => d.id === id)?.name ?? '—';
  const posName   = (id: string) => positions.find(p => p.id === id)?.name ?? '—';

  /* ── Handlers ── */
  const setFormField = (k: keyof EmployeeForm, v: string) =>
    setEmpModal(prev => ({ ...prev, form: { ...prev.form, [k]: v } }));

  const openAdd = () => setEmpModal({ open: true, mode: 'add', form: { ...INIT_FORM } });

  const openEdit = (e: Employee) => setEmpModal({
    open: true, mode: 'edit', editId: e.id,
    form: {
      name: e.name, phone: e.phone, email: e.email,
      departmentId: e.departmentId, positionId: e.positionId,
      gender: e.gender, birthDate: e.birthDate, address: e.address,
      startDate: e.startDate, status: e.status, avatar: e.avatar,
    },
  });

  const saveEmployee = () => {
    if (!empModal.form.name.trim() || !empModal.form.phone.trim()) return;
    if (empModal.mode === 'add') onAdd(empModal.form);
    else if (empModal.editId)   onUpdate(empModal.editId, empModal.form);
    setEmpModal(v => ({ ...v, open: false }));
    setDetailId(null);
  };

  const confirmDelete = (id: string) => {
    const e = employees.find(e => e.id === id)!;
    setConfirm({
      open: true,
      message: `Xoá nhân viên "${e.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: () => { onDelete(id); setDetailId(null); setConfirm(v => ({ ...v, open: false })); },
    });
  };

  const saveDept = () => {
    if (!deptModal.name.trim()) return;
    if (deptModal.mode === 'add') onDeptAdd(deptModal.name.trim());
    else if (deptModal.editId)   onDeptUpdate(deptModal.editId, deptModal.name.trim());
    setDeptModal(v => ({ ...v, open: false, name: '' }));
  };

  const savePos = () => {
    if (!posModal.name.trim()) return;
    if (posModal.mode === 'add') onPosAdd(posModal.name.trim());
    else if (posModal.editId)   onPosUpdate(posModal.editId, posModal.name.trim());
    setPosModal(v => ({ ...v, open: false, name: '' }));
  };

  /* ── Render ── */
  return (
    <div className="el-page">
      {/* Toolbar */}
      <div className="el-toolbar">
        <div className="el-toolbar-left">
          <div className="el-search-wrap">
            <FontAwesomeIcon icon={faSearch} className="el-search-icon" />
            <input className="el-search" placeholder="Tìm theo mã, tên, SĐT..."
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="el-search-clear" onClick={() => setSearch('')}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
          <button className={`el-filter-btn ${showFilter ? 'active' : ''}`}
            onClick={() => setShowFilter(!showFilter)}>
            <FontAwesomeIcon icon={faFilter} />
            Bộ lọc
            {activeFilters > 0 && <span className="el-filter-count">{activeFilters}</span>}
          </button>
        </div>
        <div className="el-toolbar-right">
          <span className="el-total">Tổng <strong>{filtered.length}</strong> nhân viên</span>
          <button className="el-btn-outline"
            onClick={() => setDeptModal({ open: true, mode: 'add', name: '' })}>
            <FontAwesomeIcon icon={faBuilding} /> Phòng ban
          </button>
          <button className="el-btn-outline"
            onClick={() => setPosModal({ open: true, mode: 'add', name: '' })}>
            <FontAwesomeIcon icon={faBriefcase} /> Chức danh
          </button>
          <button className="el-btn-primary" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilter && (
        <div className="el-filter-bar">
          {[
            { label: 'Phòng ban', val: filterDept, set: setFilterDept,
              opts: departments.map(d => ({ v: d.id, l: d.name })) },
            { label: 'Chức danh', val: filterPos, set: setFilterPos,
              opts: positions.map(p => ({ v: p.id, l: p.name })) },
            { label: 'Trạng thái', val: filterStatus, set: setFilterStatus,
              opts: [{ v: 'active', l: 'Đang làm việc' }, { v: 'inactive', l: 'Ngừng làm việc' }] },
          ].map(f => (
            <div key={f.label} className="el-filter-group">
              <label className="el-filter-label">{f.label}</label>
              <div className="el-select-wrap">
                <select className="el-select" value={f.val} onChange={e => f.set(e.target.value)}>
                  <option value="">Tất cả</option>
                  {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <FontAwesomeIcon icon={faChevronDown} className="el-select-arrow" />
              </div>
            </div>
          ))}
          {activeFilters > 0 && (
            <button className="el-clear-filter"
              onClick={() => { setFilterDept(''); setFilterPos(''); setFilterStatus(''); }}>
              Xoá bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="el-table-wrap">
        <div className="el-table">
          <div className="el-row el-row-head">
            <div className="el-col el-col-name">Nhân viên</div>
            <div className="el-col el-col-phone">Số điện thoại</div>
            <div className="el-col el-col-dept">Phòng ban</div>
            <div className="el-col el-col-pos">Chức danh</div>
            <div className="el-col el-col-start">Ngày vào làm</div>
            <div className="el-col el-col-status">Trạng thái</div>
            <div className="el-col el-col-actions">Thao tác</div>
          </div>

          {filtered.length === 0 ? (
            <div className="el-empty">
              <FontAwesomeIcon icon={faUser} className="el-empty-icon" />
              <p>Không tìm thấy nhân viên nào</p>
              {(search || activeFilters > 0) && (
                <button className="el-clear-filter"
                  onClick={() => { setSearch(''); setFilterDept(''); setFilterPos(''); setFilterStatus(''); }}>
                  Xoá bộ lọc
                </button>
              )}
            </div>
          ) : filtered.map((e, i) => (
            <div key={e.id}
              className={`el-row el-row-data ${i % 2 === 1 ? 'alt' : ''} ${e.status === 'inactive' ? 'row-inactive' : ''}`}
              onClick={() => setDetailId(e.id)}
            >
              <div className="el-col el-col-name">
                <div className="el-avatar" style={{ background: avatarColor(e.id) }}>
                  {initials(e.name)}
                </div>
                <div className="el-name-info">
                  <span className="el-name">{e.name}</span>
                  <span className="el-id">{e.id}</span>
                </div>
              </div>
              <div className="el-col el-col-phone">{e.phone}</div>
              <div className="el-col el-col-dept">
                <span className="el-tag">{deptName(e.departmentId)}</span>
              </div>
              <div className="el-col el-col-pos">{posName(e.positionId)}</div>
              <div className="el-col el-col-start">
                {e.startDate ? new Date(e.startDate).toLocaleDateString('vi-VN') : '—'}
              </div>
              <div className="el-col el-col-status">
                <span className={`el-status-badge ${e.status}`}>
                  {e.status === 'active' ? 'Đang làm việc' : 'Ngừng làm việc'}
                </span>
              </div>
              <div className="el-col el-col-actions" onClick={ev => ev.stopPropagation()}>
                <button className="el-action-btn edit" title="Chỉnh sửa" onClick={() => openEdit(e)}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button className="el-action-btn toggle"
                  title={e.status === 'active' ? 'Ngừng làm việc' : 'Cho phép làm việc'}
                  onClick={() => onToggle(e.id)}>
                  <FontAwesomeIcon icon={e.status === 'active' ? faToggleOn : faToggleOff}
                    className={e.status === 'active' ? 'tog-on' : 'tog-off'} />
                </button>
                <button className="el-action-btn delete" title="Xoá" onClick={() => confirmDelete(e.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {detailEmp && (
        <div className="el-drawer-overlay" onClick={() => setDetailId(null)}>
          <div className="el-drawer" onClick={e => e.stopPropagation()}>
            <div className="el-drawer-header">
              <div className="el-drawer-avatar" style={{ background: avatarColor(detailEmp.id) }}>
                {initials(detailEmp.name)}
              </div>
              <div className="el-drawer-info">
                <h3 className="el-drawer-name">{detailEmp.name}</h3>
                <span className="el-drawer-id">{detailEmp.id}</span>
                <span className={`el-status-badge ${detailEmp.status}`}>
                  {detailEmp.status === 'active' ? 'Đang làm việc' : 'Ngừng làm việc'}
                </span>
              </div>
              <button className="el-drawer-close" onClick={() => setDetailId(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="el-drawer-body">
              {[
                { title: 'Thông tin liên hệ', rows: [
                  { icon: faPhone,       text: detailEmp.phone || '—' },
                  { icon: faEnvelope,    text: detailEmp.email || '—' },
                  { icon: faLocationDot, text: detailEmp.address || '—' },
                ]},
                { title: 'Thông tin công việc', rows: [
                  { icon: faBuilding,  text: deptName(detailEmp.departmentId) },
                  { icon: faUserTie,   text: posName(detailEmp.positionId) },
                  { icon: faCalendar,  text: `Vào làm: ${detailEmp.startDate ? new Date(detailEmp.startDate).toLocaleDateString('vi-VN') : '—'}` },
                ]},
                { title: 'Thông tin cá nhân', rows: [
                  { icon: faVenusMars, text: detailEmp.gender === 'male' ? 'Nam' : 'Nữ' },
                  { icon: faCalendar,  text: `Sinh: ${detailEmp.birthDate ? new Date(detailEmp.birthDate).toLocaleDateString('vi-VN') : '—'}` },
                ]},
              ].map(section => (
                <div key={section.title} className="el-drawer-section">
                  <p className="el-drawer-section-title">{section.title}</p>
                  {section.rows.map((r, i) => (
                    <div key={i} className="el-detail-row">
                      <FontAwesomeIcon icon={r.icon} className="el-detail-icon" />
                      <span>{r.text}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="el-drawer-footer">
              <button className="el-btn-outline" onClick={() => onToggle(detailEmp.id)}>
                <FontAwesomeIcon icon={detailEmp.status === 'active' ? faToggleOn : faToggleOff} />
                {detailEmp.status === 'active' ? 'Ngừng làm việc' : 'Cho phép làm việc'}
              </button>
              <button className="el-btn-primary" onClick={() => { openEdit(detailEmp); setDetailId(null); }}>
                <FontAwesomeIcon icon={faPen} /> Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee modal */}
      {empModal.open && (
        <Overlay onClose={() => setEmpModal(v => ({ ...v, open: false }))}>
          <div className="el-modal">
            <div className="el-modal-header">
              <h3 className="el-modal-title">
                {empModal.mode === 'add' ? 'Thêm nhân viên' : 'Cập nhật nhân viên'}
              </h3>
              <button className="el-modal-close" onClick={() => setEmpModal(v => ({ ...v, open: false }))}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="el-modal-body">
              <div className="el-form">
                <p className="el-form-section">Thông tin cơ bản</p>
                <div className="el-form-row">
                  <div className="el-field">
                    <label className="el-label">Tên nhân viên <span className="el-req">*</span></label>
                    <input className="el-input" placeholder="Nhập tên nhân viên..."
                      value={empModal.form.name} onChange={e => setFormField('name', e.target.value)} />
                  </div>
                  <div className="el-field">
                    <label className="el-label">Số điện thoại <span className="el-req">*</span></label>
                    <input className="el-input" placeholder="0900 000 000"
                      value={empModal.form.phone} onChange={e => setFormField('phone', e.target.value)} />
                  </div>
                </div>
                <div className="el-field">
                  <label className="el-label">Email</label>
                  <input className="el-input" placeholder="email@example.com"
                    value={empModal.form.email} onChange={e => setFormField('email', e.target.value)} />
                </div>

                <p className="el-form-section">Thông tin công việc</p>
                <div className="el-form-row">
                  <div className="el-field">
                    <label className="el-label">Phòng ban</label>
                    <div className="el-select-wrap">
                      <select className="el-select" value={empModal.form.departmentId}
                        onChange={e => setFormField('departmentId', e.target.value)}>
                        <option value="">-- Chọn --</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <FontAwesomeIcon icon={faChevronDown} className="el-select-arrow" />
                    </div>
                  </div>
                  <div className="el-field">
                    <label className="el-label">Chức danh</label>
                    <div className="el-select-wrap">
                      <select className="el-select" value={empModal.form.positionId}
                        onChange={e => setFormField('positionId', e.target.value)}>
                        <option value="">-- Chọn --</option>
                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <FontAwesomeIcon icon={faChevronDown} className="el-select-arrow" />
                    </div>
                  </div>
                </div>
                <div className="el-form-row">
                  <div className="el-field">
                    <label className="el-label">Ngày vào làm</label>
                    <input className="el-input" type="date"
                      value={empModal.form.startDate} onChange={e => setFormField('startDate', e.target.value)} />
                  </div>
                  <div className="el-field">
                    <label className="el-label">Trạng thái</label>
                    <button
                      className={`el-status-btn ${empModal.form.status === 'active' ? 'on' : 'off'}`}
                      onClick={() => setFormField('status', empModal.form.status === 'active' ? 'inactive' : 'active')}>
                      <FontAwesomeIcon icon={empModal.form.status === 'active' ? faToggleOn : faToggleOff} />
                      {empModal.form.status === 'active' ? 'Đang làm việc' : 'Ngừng làm việc'}
                    </button>
                  </div>
                </div>

                <p className="el-form-section">Thông tin cá nhân</p>
                <div className="el-form-row">
                  <div className="el-field">
                    <label className="el-label">Giới tính</label>
                    <div className="el-gender-group">
                      <button className={`el-gender-btn ${empModal.form.gender === 'male' ? 'active' : ''}`}
                        onClick={() => setFormField('gender', 'male')}>Nam</button>
                      <button className={`el-gender-btn ${empModal.form.gender === 'female' ? 'active' : ''}`}
                        onClick={() => setFormField('gender', 'female')}>Nữ</button>
                    </div>
                  </div>
                  <div className="el-field">
                    <label className="el-label">Ngày sinh</label>
                    <input className="el-input" type="date"
                      value={empModal.form.birthDate} onChange={e => setFormField('birthDate', e.target.value)} />
                  </div>
                </div>
                <div className="el-field">
                  <label className="el-label">Địa chỉ</label>
                  <input className="el-input" placeholder="Số nhà, đường, quận, thành phố..."
                    value={empModal.form.address} onChange={e => setFormField('address', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="el-modal-footer">
              <button className="el-btn-outline" onClick={() => setEmpModal(v => ({ ...v, open: false }))}>Huỷ</button>
              <button className="el-btn-primary" onClick={saveEmployee}>
                {empModal.mode === 'add' ? 'Thêm nhân viên' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Dept modal */}
      {deptModal.open && (
        <Overlay onClose={() => setDeptModal(v => ({ ...v, open: false }))}>
          <div className="el-mini-modal">
            <div className="el-modal-header">
              <h3 className="el-modal-title">Quản lý phòng ban</h3>
              <button className="el-modal-close" onClick={() => setDeptModal(v => ({ ...v, open: false }))}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="el-modal-body">
              <div className="el-list-items">
                {departments.map(d => (
                  <div key={d.id} className="el-list-item">
                    <span className="el-list-item-name">{d.name}</span>
                    <div className="el-list-item-actions">
                      <button className="el-icon-btn"
                        onClick={() => setDeptModal({ open: true, mode: 'edit', name: d.name, editId: d.id })}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button className="el-icon-btn danger" onClick={() => onDeptDelete(d.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="el-inline-add">
                <input className="el-input" placeholder="Tên phòng ban..."
                  value={deptModal.name} onChange={e => setDeptModal(v => ({ ...v, name: e.target.value }))} />
                <button className="el-btn-primary el-inline-btn" onClick={saveDept}>
                  {deptModal.mode === 'add' ? <><FontAwesomeIcon icon={faPlus} /> Thêm</> : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* Pos modal */}
      {posModal.open && (
        <Overlay onClose={() => setPosModal(v => ({ ...v, open: false }))}>
          <div className="el-mini-modal">
            <div className="el-modal-header">
              <h3 className="el-modal-title">Quản lý chức danh</h3>
              <button className="el-modal-close" onClick={() => setPosModal(v => ({ ...v, open: false }))}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="el-modal-body">
              <div className="el-list-items">
                {positions.map(p => (
                  <div key={p.id} className="el-list-item">
                    <span className="el-list-item-name">{p.name}</span>
                    <div className="el-list-item-actions">
                      <button className="el-icon-btn"
                        onClick={() => setPosModal({ open: true, mode: 'edit', name: p.name, editId: p.id })}>
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button className="el-icon-btn danger" onClick={() => onPosDelete(p.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="el-inline-add">
                <input className="el-input" placeholder="Tên chức danh..."
                  value={posModal.name} onChange={e => setPosModal(v => ({ ...v, name: e.target.value }))} />
                <button className="el-btn-primary el-inline-btn" onClick={savePos}>
                  {posModal.mode === 'add' ? <><FontAwesomeIcon icon={faPlus} /> Thêm</> : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* Confirm */}
      {confirm.open && (
        <Overlay onClose={() => setConfirm(v => ({ ...v, open: false }))}>
          <div className="el-confirm">
            <p className="el-confirm-msg">{confirm.message}</p>
            <div className="el-confirm-actions">
              <button className="el-btn-outline" onClick={() => setConfirm(v => ({ ...v, open: false }))}>Huỷ</button>
              <button className="el-btn-delete" onClick={confirm.onConfirm}>Xoá</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

export default EmployeeList;