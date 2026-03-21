import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faFileImport, faFileExport,
  faChevronDown, faChevronUp, faSearch,
  faFilter, faToggleOn, faToggleOff,
  faPen, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import productsData from '../../products.json';
import type { Product, ProductForm } from '../../types';
import ProductModal from './ProductModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import './Products.css';

const MENU_TYPES  = ['Đồ ăn', 'Đồ uống', 'Khác'];
const CATEGORIES  = ['Cà phê', 'Trà', 'Sinh tố', 'Nước ép', 'Bánh', 'Combo', 'Khác'];
const STATUS_OPTS = ['Đang kinh doanh', 'Ngừng kinh doanh'];
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const genId = (list: Product[]) => {
  const max = list.reduce((m, p) => {
    const num = parseInt(p.id.replace(/\D/g, ''), 10);
    return isNaN(num) ? m : Math.max(m, num);
  }, 0);
  return `SP${String(max + 1).padStart(4, '0')}`;
};

const toForm = (p: Product): ProductForm => ({
  name:     p.name,
  category: p.category,
  menuType: p.menuType,
  price:    p.price ? p.price.toLocaleString('vi-VN') : '',
  cost:     p.cost  ? p.cost.toLocaleString('vi-VN')  : '',
  stock:    p.stock >= 999 ? '' : String(p.stock),
  unit:     p.unit,
  status:   p.status === 'active',
  image:    p.image ?? '',
});

const parseNum = (s: string) => parseInt(s.replace(/\D/g, '') || '0', 10);

type ModalState =
  | { open: false }
  | { open: true; mode: 'add' }
  | { open: true; mode: 'edit'; product: Product };

type DeleteState =
  | { open: false }
  | { open: true; product: Product };

const Products: React.FC = () => {
  const [products,      setProducts]     = useState<Product[]>(productsData as Product[]);
  const [modal,         setModal]        = useState<ModalState>({ open: false });
  const [deleteState,   setDeleteState]  = useState<DeleteState>({ open: false });
  const [search,        setSearch]       = useState('');
  const [checkedMenu,   setCheckedMenu]  = useState<string[]>([]);
  const [checkedCat,    setCheckedCat]   = useState<string[]>([]);
  const [checkedStatus, setCheckedStatus]= useState<string[]>([]);
  const [showMenu,      setShowMenu]     = useState(true);
  const [showCat,       setShowCat]      = useState(true);
  const [showStatus,    setShowStatus]   = useState(true);
  const [selectedRows,  setSelectedRows] = useState<string[]>([]);
  const [imgErrors,     setImgErrors]    = useState<Record<string, boolean>>({});

  const toggle = (arr: string[], val: string, set: (a: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const filtered: Product[] = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
      if (checkedMenu.length   && !checkedMenu.includes(p.menuType))  return false;
      if (checkedCat.length    && !checkedCat.includes(p.category))   return false;
      if (checkedStatus.length) {
        const active = p.status === 'active';
        if (checkedStatus.includes('Đang kinh doanh')  && !active) return false;
        if (checkedStatus.includes('Ngừng kinh doanh') && active)  return false;
      }
      return true;
    });
  }, [products, search, checkedMenu, checkedCat, checkedStatus]);

  const allSelected   = filtered.length > 0 && filtered.every(p => selectedRows.includes(p.id));
  const toggleAll     = () => setSelectedRows(allSelected ? [] : filtered.map(p => p.id));
  const toggleRow     = (id: string) => toggle(selectedRows, id, setSelectedRows);
  const clearAll      = () => { setCheckedMenu([]); setCheckedCat([]); setCheckedStatus([]); };
  const activeFilters = checkedMenu.length + checkedCat.length + checkedStatus.length;

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p)
    );
  };

  const handleAdd = (form: ProductForm) => {
    const newProduct: Product = {
      id:       genId(products),
      name:     form.name,
      category: form.category,
      menuType: form.menuType,
      itemType: '',
      price:    parseNum(form.price),
      cost:     parseNum(form.cost),
      stock:    form.stock === '' ? 999 : parseNum(form.stock),
      unit:     form.unit,
      status:   form.status ? 'active' : 'inactive',
      image:    form.image,
    };
    setProducts(prev => [newProduct, ...prev]);
    setModal({ open: false });
  };

  const handleUpdate = (form: ProductForm) => {
    if (modal.open && modal.mode === 'edit') {
      const id = modal.product.id;
      setProducts(prev =>
        prev.map(p => p.id !== id ? p : {
          ...p,
          name:     form.name,
          category: form.category,
          menuType: form.menuType,
          price:    parseNum(form.price),
          cost:     parseNum(form.cost),
          stock:    form.stock === '' ? 999 : parseNum(form.stock),
          unit:     form.unit,
          status:   form.status ? 'active' : 'inactive',
          image:    form.image,
        })
      );
      setModal({ open: false });
    }
  };

  const handleDelete = () => {
    if (deleteState.open) {
      setProducts(prev => prev.filter(p => p.id !== deleteState.product.id));
      setSelectedRows(prev => prev.filter(id => id !== deleteState.product.id));
      setDeleteState({ open: false });
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    setProducts(prev => prev.filter(p => !selectedRows.includes(p.id)));
    setSelectedRows([]);
  };

  const Section = ({ title, open, onToggle, children }: {
    title: string; open: boolean; onToggle: () => void; children: React.ReactNode
  }) => (
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
      {modal.open && (
        <ProductModal
          mode={modal.mode}
          initialData={modal.mode === 'edit' ? toForm(modal.product) : undefined}
          onClose={() => setModal({ open: false })}
          onSave={modal.mode === 'add' ? handleAdd : handleUpdate}
        />
      )}
      {deleteState.open && (
        <DeleteConfirmModal
          productName={deleteState.product.name}
          onCancel={() => setDeleteState({ open: false })}
          onConfirm={handleDelete}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="search-wrap">
            <FontAwesomeIcon icon={faSearch} className="search-icon-sb" />
            <input className="sidebar-input pl-search" placeholder="Theo mã, tên hàng hóa"
              value={search} onChange={e => setSearch(e.target.value)} />
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
              <input type="checkbox" checked={checkedMenu.includes(t)}
                onChange={() => toggle(checkedMenu, t, setCheckedMenu)} />
              <span>{t}</span>
            </label>
          ))}
        </Section>

        <Section title="Danh mục" open={showCat} onToggle={() => setShowCat(!showCat)}>
          {CATEGORIES.map(t => (
            <label key={t} className="checkbox-item">
              <input type="checkbox" checked={checkedCat.includes(t)}
                onChange={() => toggle(checkedCat, t, setCheckedCat)} />
              <span className="cat-label">{t}</span>
              <span className="cat-count">{products.filter(p => p.category === t).length}</span>
            </label>
          ))}
        </Section>

        <Section title="Trạng thái" open={showStatus} onToggle={() => setShowStatus(!showStatus)}>
          {STATUS_OPTS.map(t => (
            <label key={t} className="checkbox-item">
              <input type="checkbox" checked={checkedStatus.includes(t)}
                onChange={() => toggle(checkedStatus, t, setCheckedStatus)} />
              <span>{t}</span>
            </label>
          ))}
        </Section>
      </aside>

      {/* ── MAIN ── */}
      <main className="page-main">
        <div className="page-toolbar">
          <div className="toolbar-left">
            <span className="result-count">Tổng <strong>{filtered.length}</strong> sản phẩm</span>
            {selectedRows.length > 0 && (
              <button className="btn btn-danger-outline" onClick={handleBulkDelete}>
                <FontAwesomeIcon icon={faTrash} />
                <span>Xoá {selectedRows.length} mục</span>
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={() => setModal({ open: true, mode: 'add' })}>
              <FontAwesomeIcon icon={faPlus} /><span>Thêm mới</span>
            </button>
            <button className="btn btn-green-outline"><FontAwesomeIcon icon={faFileImport} /><span>Import</span></button>
            <button className="btn btn-green-outline"><FontAwesomeIcon icon={faFileExport} /><span>Xuất file</span></button>
          </div>
        </div>

        <div className="products-table">
          <div className="products-table-header grid-row">
            <div className="col col-check"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></div>
            <div className="col col-img">Ảnh</div>
            <div className="col col-name">Tên hàng</div>
            <div className="col col-cat">Danh mục</div>
            <div className="col col-menu">Loại TĐ</div>
            <div className="col col-price">Giá bán</div>
            <div className="col col-cost">Giá vốn</div>
            <div className="col col-stock">Tồn kho</div>
            <div className="col col-status">Trạng thái</div>
            <div className="col col-actions">Thao tác</div>
          </div>

          {filtered.length === 0 ? (
            <div className="table-empty">
              <span className="empty-emoji">📦</span>
              <p>Không tìm thấy hàng hóa nào phù hợp</p>
              {(activeFilters > 0 || search) && (
                <button className="clear-filter-btn" onClick={() => { clearAll(); setSearch(''); }}>
                  Xoá bộ lọc
                </button>
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
                  <div className="col col-check">
                    <input type="checkbox" checked={selectedRows.includes(p.id)}
                      onChange={() => toggleRow(p.id)} onClick={e => e.stopPropagation()} />
                  </div>

                  <div className="col col-img">
                    {!imgErrors[p.id] && p.image ? (
                      <img src={p.image} alt={p.name} className="product-img"
                        onError={() => setImgErrors(prev => ({ ...prev, [p.id]: true }))} />
                    ) : (
                      <div className="product-img-fallback" />
                    )}
                  </div>

                  <div className="col col-name">
                    <span className="product-name">{p.name}</span>
                    <span className="product-id">{p.id}</span>
                  </div>

                  <div className="col col-cat">
                    <span className="tag tag-cat">{p.category}</span>
                  </div>

                  <div className="col col-menu">
                    <span className={`tag tag-${p.menuType === 'Đồ uống' ? 'drink' : p.menuType === 'Đồ ăn' ? 'food' : 'other'}`}>
                      {p.menuType}
                    </span>
                  </div>

                  <div className="col col-price">{fmt(p.price)}</div>
                  <div className="col col-cost">{fmt(p.cost)}</div>

                  <div className="col col-stock">
                    {p.stock >= 999
                      ? <span className="stock-inf">∞</span>
                      : <span className={p.stock < 20 ? 'stock-low' : 'stock-ok'}>{p.stock}</span>}
                  </div>

                  <div className="col col-status" onClick={e => toggleStatus(p.id, e)}>
                    <FontAwesomeIcon
                      icon={p.status === 'active' ? faToggleOn : faToggleOff}
                      className={`status-toggle ${p.status === 'active' ? 'toggle-on' : 'toggle-off'}`}
                      title={p.status === 'active' ? 'Đang kinh doanh — nhấn để tắt' : 'Ngừng kinh doanh — nhấn để bật'}
                    />
                  </div>

                  <div className="col col-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="action-btn edit-btn"
                      title="Chỉnh sửa"
                      onClick={() => setModal({ open: true, mode: 'edit', product: p })}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Xoá"
                      onClick={() => setDeleteState({ open: true, product: p })}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="table-footer">
            {selectedRows.length > 0
              ? <span>Đã chọn <strong>{selectedRows.length}</strong> sản phẩm</span>
              : <span>Hiển thị <strong>{filtered.length}</strong> / <strong>{products.length}</strong> sản phẩm</span>
            }
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;