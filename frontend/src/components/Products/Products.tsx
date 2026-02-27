import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faFileImport, faFileExport, 
  faChevronDown, faChevronUp, faSearch,
  faFilter, faToggleOn, faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import productsData from '../../products.json';
import './Products.css';

interface Product {
  id: string; name: string; category: string; menuType: string;
  itemType: string; price: number; cost: number;
  stock: number; unit: string; status: string; image: string;
}

const MENU_TYPES  = ['Đồ ăn', 'Đồ uống', 'Khác'];
const CATEGORIES  = ['Cà phê', 'Trà', 'Sinh tố', 'Nước ép', 'Bánh', 'Combo', 'Khác'];
const STATUS_OPTS = ['Đang kinh doanh', 'Ngừng kinh doanh'];
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const Products: React.FC = () => {
  const [search,         setSearch]        = useState('');
  const [checkedMenu,    setCheckedMenu]   = useState<string[]>([]);
  const [checkedType,    setCheckedType]   = useState<string[]>([]);
  const [checkedCat,     setCheckedCat]    = useState<string[]>([]);
  const [checkedStatus,  setCheckedStatus] = useState<string[]>([]);
  const [showMenu,       setShowMenu]      = useState(true);
  const [showCat,        setShowCat]       = useState(true);
  const [showStatus,     setShowStatus]    = useState(true);
  const [selectedRows,   setSelectedRows]  = useState<string[]>([]);
  const [imgErrors,      setImgErrors]     = useState<Record<string, boolean>>({});

  const toggle = (arr: string[], val: string, set: (a: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const filtered: Product[] = useMemo(() => {
    return (productsData as Product[]).filter(p => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
      if (checkedMenu.length   && !checkedMenu.includes(p.menuType))  return false;
      if (checkedType.length   && !checkedType.includes(p.itemType))  return false;
      if (checkedCat.length    && !checkedCat.includes(p.category))   return false;
      if (checkedStatus.length) {
        const active = p.status === 'active';
        if (checkedStatus.includes('Đang kinh doanh')  && !active) return false;
        if (checkedStatus.includes('Ngừng kinh doanh') && active)  return false;
      }
      return true;
    });
  }, [search, checkedMenu, checkedType, checkedCat, checkedStatus]);

  const allSelected = filtered.length > 0 && filtered.every(p => selectedRows.includes(p.id));
  const toggleAll   = () => setSelectedRows(allSelected ? [] : filtered.map(p => p.id));
  const toggleRow   = (id: string) => toggle(selectedRows, id, setSelectedRows);
  const clearAll    = () => { setCheckedMenu([]); setCheckedType([]); setCheckedCat([]); setCheckedStatus([]); };
  const activeFilters = checkedMenu.length + checkedType.length + checkedCat.length + checkedStatus.length;

  const Section = ({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
    <div className="sidebar-section">
      <div className="section-header" onClick={onToggle}>
        <span className="section-title">{title}</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="section-chevron" />
      </div>
      {open && <div className="checkbox-list">{children}</div>}
    </div>
  );

  return (
    <div className="page-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="search-wrap">
            <FontAwesomeIcon icon={faSearch} className="search-icon-sb" />
            <input className="sidebar-input pl-search" placeholder="Theo mã, tên hàng hóa" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {activeFilters > 0 && (
          <div className="filter-badge-row">
            <FontAwesomeIcon icon={faFilter} />
            <span>Đang lọc: {activeFilters} bộ lọc</span>
            <button className="clear-filter" onClick={clearAll}>Xoá hết</button>
          </div>
        )}

        <Section title="Loại thực đơn" open={showMenu} onToggle={() => setShowMenu(!showMenu)}>
          {MENU_TYPES.map(t => (
            <label key={t} className="checkbox-item">
              <input type="checkbox" checked={checkedMenu.includes(t)} onChange={() => toggle(checkedMenu, t, setCheckedMenu)} />
              <span>{t}</span>
            </label>
          ))}
        </Section>

        <Section title="Danh mục" open={showCat} onToggle={() => setShowCat(!showCat)}>
          {CATEGORIES.map(t => (
            <label key={t} className="checkbox-item">
              <input type="checkbox" checked={checkedCat.includes(t)} onChange={() => toggle(checkedCat, t, setCheckedCat)} />
              <span className="cat-label">{t}</span>
              <span className="cat-count">{(productsData as Product[]).filter(p => p.category === t).length}</span>
            </label>
          ))}
        </Section>

        <Section title="Trạng thái" open={showStatus} onToggle={() => setShowStatus(!showStatus)}>
          {STATUS_OPTS.map(t => (
            <label key={t} className="checkbox-item">
              <input type="checkbox" checked={checkedStatus.includes(t)} onChange={() => toggle(checkedStatus, t, setCheckedStatus)} />
              <span>{t}</span>
            </label>
          ))}
        </Section>
      </aside>

      {/* ── MAIN ── */}
      <main className="page-main">
        {/* Toolbar */}
        <div className="page-toolbar">
          <div className="toolbar-left">
            <span className="result-count">Tổng <strong>{filtered.length}</strong> sản phẩm</span>
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} /><span>Thêm mới</span>
              <FontAwesomeIcon icon={faChevronDown} className="btn-arrow" />
            </button>
            <button className="btn btn-green-outline"><FontAwesomeIcon icon={faFileImport} /><span>Import</span></button>
            <button className="btn btn-green-outline"><FontAwesomeIcon icon={faFileExport} /><span>Xuất file</span></button>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="products-table">
          {/* Header */}
          <div className="products-table-header grid-row">
            <div className="col col-check"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></div>
            <div className="col col-img">Ảnh</div>
            <div className="col col-name">Tên hàng</div>
            <div className="col col-cat">Danh mục</div>
            <div className="col col-menu">Loại TĐ</div>
            <div className="col col-type">Loại hàng</div>
            <div className="col col-price">Giá bán</div>
            <div className="col col-cost">Giá vốn</div>
            <div className="col col-stock">Tồn kho</div>
            <div className="col col-status">Trạng thái</div>
          </div>

          {/* Body */}
          {filtered.length === 0 ? (
            <div className="table-empty">
              <span className="empty-emoji">📦</span>
              <p>Không tìm thấy hàng hóa nào phù hợp</p>
              {activeFilters > 0 && (
                <button className="clear-filter-btn" onClick={() => { clearAll(); setSearch(''); }}>Xoá bộ lọc</button>
              )}
            </div>
          ) : (
            <div className="products-table-body">
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className={`data-row grid-row ${selectedRows.includes(p.id) ? 'row-selected' : ''} ${i % 2 === 1 ? 'row-alt' : ''}`}
                  onClick={() => toggleRow(p.id)}
                >
                  {/* Checkbox */}
                  <div className="col col-check">
                    <input type="checkbox" checked={selectedRows.includes(p.id)}
                      onChange={() => toggleRow(p.id)} onClick={e => e.stopPropagation()} />
                  </div>

                  {/* Image */}
                  <div className="col col-img">
                    {!imgErrors[p.id] ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="product-img"
                        onError={() => setImgErrors(prev => ({ ...prev, [p.id]: true }))}
                      />
                    ) : (
                      <div className="product-img-fallback"></div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="col col-name">
                    <span className="product-name">{p.name}</span>
                    <span className="product-id">{p.id}</span>
                  </div>

                  {/* Category */}
                  <div className="col col-cat">
                    <span className="tag tag-cat">{p.category}</span>
                  </div>

                  {/* Menu type */}
                  <div className="col col-menu">
                    <span className={`tag tag-${p.menuType === 'Đồ uống' ? 'drink' : p.menuType === 'Đồ ăn' ? 'food' : 'other'}`}>
                      {p.menuType}
                    </span>
                  </div>

                  {/* Item type */}
                  <div className="col col-type">{p.itemType}</div>

                  {/* Price */}
                  <div className="col col-price">{fmt(p.price)}</div>

                  {/* Cost */}
                  <div className="col col-cost">{fmt(p.cost)}</div>

                  {/* Stock */}
                  <div className="col col-stock">
                    {p.stock >= 999
                      ? <span className="stock-inf">∞</span>
                      : <span className={p.stock < 20 ? 'stock-low' : 'stock-ok'}>{p.stock}</span>}
                  </div>

                  {/* Status */}
                  <div className="col col-status">
                    <FontAwesomeIcon
                      icon={p.status === 'active' ? faToggleOn : faToggleOff}
                      className={`status-toggle ${p.status === 'active' ? 'toggle-on' : 'toggle-off'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="table-footer">
            {selectedRows.length > 0
              ? <span>Đã chọn <strong>{selectedRows.length}</strong> sản phẩm</span>
              : <span>Hiển thị <strong>{filtered.length}</strong> / <strong>{productsData.length}</strong> sản phẩm</span>
            }
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;