export type NavPage =
  | 'Tổng quan'
  | 'Hàng hóa'
  | 'Phòng/Bàn'
  | 'Giao dịch'
  | 'Đối tác'
  | 'Nhân viên'
  | 'Bán Online'
  | 'Sổ quỹ'
  | 'Báo cáo'
  | 'Thuế & Kế toán';

  // ── Thêm 2 interface này vào file types.ts hiện có của bạn ──

export interface Product {
  id: string;
  name: string;
  category: string;
  menuType: string;
  itemType: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  status: string;
  image: string;
}

export interface ProductForm {
  name: string;
  category: string;
  menuType: string;
  price: string;
  cost: string;
  stock: string;
  unit: string;
  status: boolean;
  image: string;
}