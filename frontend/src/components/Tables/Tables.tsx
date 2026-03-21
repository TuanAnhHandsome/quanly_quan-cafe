import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faPen, faTrash, faToggleOn, faToggleOff,
  faTableCells, faList, faChair, faLayerGroup,
  faXmark, faChevronDown, faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import tablesData from '../../tables.json';
import './Tables.css';

/* ── Types ── */
interface TableItem {
  id: string;
  name: string;
  seats: number;
  note: string;
  status: 'active' | 'inactive';
}

interface Zone {
  id: string;
  name: string;
  note: string;
  status: 'active' | 'inactive';
  tables: TableItem[];
}

/* ── Helpers ── */
const genId = (prefix: string) => `${prefix}-${Date.now()}`;

const INIT_TABLE: Omit<TableItem, 'id'> = { name: '', seats: 4, note: '', status: 'active' };
const INIT_ZONE:  Omit<Zone,  'id' | 'tables'> = { name: '', note: '', status: 'active' };

/* ── Modal chung ── */
interface ModalProps { title: string; onClose: () => void; onSave: () => void; saveLabel?: string; children: React.ReactNode; }
const Modal: React.FC<ModalProps> = ({ title, onClose, onSave, saveLabel = 'Lưu', children }) => (
  <div className="tb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="tb-modal">
      <div className="tb-modal-header">
        <h3 className="tb-modal-title">{title}</h3>
        <button className="tb-modal-close" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
      </div>
      <div className="tb-modal-body">{children}</div>
      <div className="tb-modal-footer">
        <button className="tb-btn-cancel" onClick={onClose}>Huỷ</button>
        <button className="tb-btn-save" onClick={onSave}>{saveLabel}</button>
      </div>
    </div>
  </div>
);

/* ── Confirm xoá ── */
interface ConfirmProps { message: string; onCancel: () => void; onConfirm: () => void; }
const ConfirmModal: React.FC<ConfirmProps> = ({ message, onCancel, onConfirm }) => (
  <div className="tb-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
    <div className="tb-confirm">
      <p className="tb-confirm-msg">{message}</p>
      <div className="tb-confirm-actions">
        <button className="tb-btn-cancel" onClick={onCancel}>Huỷ</button>
        <button className="tb-btn-delete" onClick={onConfirm}>Xoá</button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════ */
const Tables: React.FC = () => {
  const [zones,       setZones]       = useState<Zone[]>(tablesData as Zone[]);
  const [activeZone,  setActiveZone]  = useState<string>(tablesData[0]?.id ?? '');
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');

  /* Zone modal */
  const [zoneModal,   setZoneModal]   = useState<{ open: boolean; mode: 'add' | 'edit'; data: Omit<Zone,'id'|'tables'>; editId?: string }>
    ({ open: false, mode: 'add', data: { ...INIT_ZONE } });

  /* Table modal */
  const [tableModal,  setTableModal]  = useState<{ open: boolean; mode: 'add' | 'edit' | 'bulk'; data: Omit<TableItem,'id'>; editId?: string; bulkCount: number; bulkStart: number }>
    ({ open: false, mode: 'add', data: { ...INIT_TABLE }, bulkCount: 5, bulkStart: 1 });

  /* Confirm */
  const [confirm,     setConfirm]     = useState<{ open: boolean; message: string; onConfirm: () => void }>
    ({ open: false, message: '', onConfirm: () => {} });

  /* Derived */
  const currentZone = useMemo(() => zones.find(z => z.id === activeZone), [zones, activeZone]);

  /* ── Zone CRUD ── */
  const openAddZone = () => setZoneModal({ open: true, mode: 'add', data: { ...INIT_ZONE } });

  const openEditZone = (z: Zone) =>
    setZoneModal({ open: true, mode: 'edit', data: { name: z.name, note: z.note, status: z.status }, editId: z.id });

  const saveZone = () => {
    if (!zoneModal.data.name.trim()) return;
    if (zoneModal.mode === 'add') {
      const newZone: Zone = { id: genId('zone'), ...zoneModal.data, tables: [] };
      setZones(prev => [...prev, newZone]);
      setActiveZone(newZone.id);
    } else {
      setZones(prev => prev.map(z => z.id === zoneModal.editId ? { ...z, ...zoneModal.data } : z));
    }
    setZoneModal(v => ({ ...v, open: false }));
  };

  const deleteZone = (zoneId: string) => {
    const z = zones.find(z => z.id === zoneId)!;
    setConfirm({
      open: true,
      message: `Xoá khu vực "${z.name}" sẽ xoá tất cả phòng/bàn thuộc khu vực này. Bạn có chắc chắn?`,
      onConfirm: () => {
        setZones(prev => prev.filter(z => z.id !== zoneId));
        if (activeZone === zoneId) setActiveZone(zones.find(z => z.id !== zoneId)?.id ?? '');
        setConfirm(v => ({ ...v, open: false }));
      },
    });
  };

  const toggleZoneStatus = (zoneId: string) =>
    setZones(prev => prev.map(z => z.id === zoneId
      ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' } : z));

  /* ── Table CRUD ── */
  const openAddTable = () =>
    setTableModal({ open: true, mode: 'add', data: { ...INIT_TABLE }, bulkCount: 5, bulkStart: 1 });

  const openBulkTable = () =>
    setTableModal({ open: true, mode: 'bulk', data: { ...INIT_TABLE, name: 'Bàn' }, bulkCount: 5, bulkStart: 1 });

  const openEditTable = (t: TableItem) =>
    setTableModal({ open: true, mode: 'edit', data: { name: t.name, seats: t.seats, note: t.note, status: t.status }, editId: t.id, bulkCount: 5, bulkStart: 1 });

  const saveTable = () => {
    if (!tableModal.data.name.trim()) return;
    if (tableModal.mode === 'add') {
      const newTable: TableItem = { id: genId('t'), ...tableModal.data };
      setZones(prev => prev.map(z => z.id === activeZone ? { ...z, tables: [...z.tables, newTable] } : z));
    } else if (tableModal.mode === 'edit') {
      setZones(prev => prev.map(z => z.id === activeZone
        ? { ...z, tables: z.tables.map(t => t.id === tableModal.editId ? { ...t, ...tableModal.data } : t) } : z));
    } else {
      // bulk
      const newTables: TableItem[] = Array.from({ length: tableModal.bulkCount }, (_, i) => ({
        id: genId(`t-b${i}`),
        name: `${tableModal.data.name} ${tableModal.bulkStart + i}`,
        seats: tableModal.data.seats,
        note: tableModal.data.note,
        status: 'active' as const,
      }));
      setZones(prev => prev.map(z => z.id === activeZone ? { ...z, tables: [...z.tables, ...newTables] } : z));
    }
    setTableModal(v => ({ ...v, open: false }));
  };

  const deleteTable = (tableId: string) => {
    const t = currentZone?.tables.find(t => t.id === tableId)!;
    setConfirm({
      open: true,
      message: `Xoá "${t.name}" khỏi khu vực này?`,
      onConfirm: () => {
        setZones(prev => prev.map(z => z.id === activeZone
          ? { ...z, tables: z.tables.filter(t => t.id !== tableId) } : z));
        setConfirm(v => ({ ...v, open: false }));
      },
    });
  };

  const toggleTableStatus = (tableId: string) =>
    setZones(prev => prev.map(z => z.id === activeZone
      ? { ...z, tables: z.tables.map(t => t.id === tableId
          ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t) } : z));

  /* ── Field helpers ── */
  const setZoneField = (k: keyof typeof INIT_ZONE, v: string) =>
    setZoneModal(prev => ({ ...prev, data: { ...prev.data, [k]: v } }));

  const setTableField = (k: keyof typeof INIT_TABLE, v: string | number) =>
    setTableModal(prev => ({ ...prev, data: { ...prev.data, [k]: v } }));

  /* ── Render ── */
  return (
    <div className="tb-page">
      {/* ── SIDEBAR khu vực ── */}
      <aside className="tb-sidebar">
        <div className="tb-sidebar-header">
          <span className="tb-sidebar-title"><FontAwesomeIcon icon={faLayerGroup} /> Khu vực</span>
          <button className="tb-add-zone-btn" onClick={openAddZone} title="Thêm khu vực">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <div className="tb-zone-list">
          {zones.map(z => (
            <div
              key={z.id}
              className={`tb-zone-item ${activeZone === z.id ? 'active' : ''} ${z.status === 'inactive' ? 'inactive' : ''}`}
              onClick={() => setActiveZone(z.id)}
            >
              <div className="tb-zone-info">
                <span className="tb-zone-name">{z.name}</span>
                <span className="tb-zone-count">{z.tables.length} bàn</span>
              </div>
              <div className="tb-zone-actions" onClick={e => e.stopPropagation()}>
                <button className="tb-icon-btn" title="Chỉnh sửa" onClick={() => openEditZone(z)}>
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button className="tb-icon-btn" title={z.status === 'active' ? 'Ngừng hoạt động' : 'Cho phép hoạt động'}
                  onClick={() => toggleZoneStatus(z.id)}>
                  <FontAwesomeIcon icon={z.status === 'active' ? faToggleOn : faToggleOff}
                    className={z.status === 'active' ? 'toggle-on' : 'toggle-off'} />
                </button>
                <button className="tb-icon-btn danger" title="Xoá khu vực" onClick={() => deleteZone(z.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="tb-main">
        {/* Toolbar */}
        <div className="tb-toolbar">
          <div className="tb-toolbar-left">
            <h2 className="tb-zone-title">
              {currentZone?.name ?? '—'}
              {currentZone?.status === 'inactive' && <span className="tb-inactive-badge">Ngừng HĐ</span>}
            </h2>
            {currentZone?.note && <span className="tb-zone-note">{currentZone.note}</span>}
          </div>
          <div className="tb-toolbar-right">
            {/* View switch */}
            <div className="tb-view-switch">
              <button className={`tb-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                <FontAwesomeIcon icon={faTableCells} />
              </button>
              <button className={`tb-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
            <button className="tb-btn-outline" onClick={openBulkTable}>
              <FontAwesomeIcon icon={faPlus} /> Thêm hàng loạt
            </button>
            <button className="tb-btn-primary" onClick={openAddTable}>
              <FontAwesomeIcon icon={faPlus} /> Thêm phòng/bàn
            </button>
          </div>
        </div>

        {/* Content */}
        {!currentZone || currentZone.tables.length === 0 ? (
          <div className="tb-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="tb-empty-icon" />
            <p>Khu vực này chưa có phòng/bàn nào</p>
            <button className="tb-btn-primary" onClick={openAddTable}>
              <FontAwesomeIcon icon={faPlus} /> Thêm phòng/bàn đầu tiên
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid view ── */
          <div className="tb-grid">
            {currentZone.tables.map(t => (
              <div key={t.id} className={`tb-card ${t.status === 'inactive' ? 'tb-card-inactive' : ''}`}>
                <div className="tb-card-top">
                  <span className="tb-card-name">{t.name}</span>
                  <div className="tb-card-status-dot" title={t.status === 'active' ? 'Hoạt động' : 'Ngừng HĐ'}
                    style={{ background: t.status === 'active' ? '#3dba74' : '#d1d5db' }} />
                </div>
                <div className="tb-card-seats">
                  <FontAwesomeIcon icon={faChair} className="tb-chair-icon" />
                  <span>{t.seats} ghế</span>
                </div>
                {t.note && <p className="tb-card-note">{t.note}</p>}
                <div className="tb-card-actions">
                  <button className="tb-card-btn edit" onClick={() => openEditTable(t)}>
                    <FontAwesomeIcon icon={faPen} /> Sửa
                  </button>
                  <button
                    className={`tb-card-btn toggle ${t.status === 'active' ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleTableStatus(t.id)}
                  >
                    {t.status === 'active' ? 'Ngừng HĐ' : 'Hoạt động'}
                  </button>
                  <button className="tb-card-btn delete" onClick={() => deleteTable(t.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── List view ── */
          <div className="tb-list-wrap">
            <div className="tb-list-head tb-list-row">
              <div className="tb-lc tb-lc-name">Tên phòng/bàn</div>
              <div className="tb-lc tb-lc-seats">Số ghế</div>
              <div className="tb-lc tb-lc-note">Ghi chú</div>
              <div className="tb-lc tb-lc-status">Trạng thái</div>
              <div className="tb-lc tb-lc-actions">Thao tác</div>
            </div>
            {currentZone.tables.map((t, i) => (
              <div key={t.id} className={`tb-list-row ${i % 2 === 1 ? 'alt' : ''} ${t.status === 'inactive' ? 'row-inactive' : ''}`}>
                <div className="tb-lc tb-lc-name">
                  <span className="tb-list-name">{t.name}</span>
                </div>
                <div className="tb-lc tb-lc-seats">
                  <FontAwesomeIcon icon={faChair} className="tb-chair-icon" /> {t.seats}
                </div>
                <div className="tb-lc tb-lc-note">{t.note || '—'}</div>
                <div className="tb-lc tb-lc-status">
                  <button className="tb-toggle-btn" onClick={() => toggleTableStatus(t.id)}>
                    <FontAwesomeIcon
                      icon={t.status === 'active' ? faToggleOn : faToggleOff}
                      className={t.status === 'active' ? 'toggle-on' : 'toggle-off'}
                    />
                    <span>{t.status === 'active' ? 'Hoạt động' : 'Ngừng HĐ'}</span>
                  </button>
                </div>
                <div className="tb-lc tb-lc-actions">
                  <button className="tb-action-btn edit-btn" onClick={() => openEditTable(t)}>
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button className="tb-action-btn delete-btn" onClick={() => deleteTable(t.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modal khu vực ── */}
      {zoneModal.open && (
        <Modal
          title={zoneModal.mode === 'add' ? 'Thêm khu vực' : 'Chỉnh sửa khu vực'}
          onClose={() => setZoneModal(v => ({ ...v, open: false }))}
          onSave={saveZone}
        >
          <div className="tb-form">
            <div className="tb-field">
              <label className="tb-label">Tên khu vực <span className="tb-required">*</span></label>
              <input className="tb-input" placeholder="VD: Tầng 1, Sân vườn..."
                value={zoneModal.data.name} onChange={e => setZoneField('name', e.target.value)} />
            </div>
            <div className="tb-field">
              <label className="tb-label">Ghi chú</label>
              <input className="tb-input" placeholder="Ghi chú thêm..."
                value={zoneModal.data.note} onChange={e => setZoneField('note', e.target.value)} />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal phòng/bàn ── */}
      {tableModal.open && (
        <Modal
          title={tableModal.mode === 'add' ? 'Thêm phòng/bàn' : tableModal.mode === 'edit' ? 'Chỉnh sửa phòng/bàn' : 'Thêm hàng loạt'}
          onClose={() => setTableModal(v => ({ ...v, open: false }))}
          onSave={saveTable}
        >
          <div className="tb-form">
            {tableModal.mode === 'bulk' ? (
              <>
                <div className="tb-field">
                  <label className="tb-label">Tên phòng/bàn <span className="tb-required">*</span></label>
                  <input className="tb-input" placeholder="VD: Bàn"
                    value={tableModal.data.name} onChange={e => setTableField('name', e.target.value)} />
                  <span className="tb-hint">Hệ thống sẽ tự thêm số: Bàn 1, Bàn 2...</span>
                </div>
                <div className="tb-row">
                  <div className="tb-field">
                    <label className="tb-label">Số lượng</label>
                    <input className="tb-input" type="number" min={1} max={100}
                      value={tableModal.bulkCount}
                      onChange={e => setTableModal(v => ({ ...v, bulkCount: parseInt(e.target.value) || 1 }))} />
                  </div>
                  <div className="tb-field">
                    <label className="tb-label">Số bắt đầu</label>
                    <input className="tb-input" type="number" min={1}
                      value={tableModal.bulkStart}
                      onChange={e => setTableModal(v => ({ ...v, bulkStart: parseInt(e.target.value) || 1 }))} />
                  </div>
                </div>
                <div className="tb-field">
                  <label className="tb-label">Số ghế mỗi bàn</label>
                  <input className="tb-input" type="number" min={1}
                    value={tableModal.data.seats} onChange={e => setTableField('seats', parseInt(e.target.value) || 1)} />
                </div>
                <div className="tb-bulk-preview">
                  Sẽ tạo: <strong>{tableModal.bulkCount}</strong> bàn —{' '}
                  {tableModal.data.name} {tableModal.bulkStart} → {tableModal.data.name} {tableModal.bulkStart + tableModal.bulkCount - 1}
                </div>
              </>
            ) : (
              <>
                <div className="tb-field">
                  <label className="tb-label">Tên phòng/bàn <span className="tb-required">*</span></label>
                  <input className="tb-input" placeholder="VD: Bàn 01, Phòng VIP..."
                    value={tableModal.data.name} onChange={e => setTableField('name', e.target.value)} />
                </div>
                <div className="tb-row">
                  <div className="tb-field">
                    <label className="tb-label">Số ghế</label>
                    <input className="tb-input" type="number" min={1}
                      value={tableModal.data.seats} onChange={e => setTableField('seats', parseInt(e.target.value) || 1)} />
                  </div>
                  <div className="tb-field">
                    <label className="tb-label">Trạng thái</label>
                    <button
                      className={`tb-status-toggle ${tableModal.data.status === 'active' ? 'on' : 'off'}`}
                      onClick={() => setTableField('status', tableModal.data.status === 'active' ? 'inactive' : 'active')}
                    >
                      <FontAwesomeIcon icon={tableModal.data.status === 'active' ? faToggleOn : faToggleOff} />
                      {tableModal.data.status === 'active' ? 'Hoạt động' : 'Ngừng HĐ'}
                    </button>
                  </div>
                </div>
                <div className="tb-field">
                  <label className="tb-label">Ghi chú</label>
                  <input className="tb-input" placeholder="Ghi chú thêm..."
                    value={tableModal.data.note} onChange={e => setTableField('note', e.target.value)} />
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ── Confirm xoá ── */}
      {confirm.open && (
        <ConfirmModal
          message={confirm.message}
          onCancel={() => setConfirm(v => ({ ...v, open: false }))}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
};

export default Tables;