/**
 * RBAC — Role-Based Access Control
 * 5 vai trò: admin | manager | cashier | staff | barista
 *
 * Mỗi permission theo dạng "resource:action"
 */

export type Permission =
  // Dashboard
  | 'dashboard:read'
  // Sản phẩm / hàng hóa
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  // Phòng / bàn
  | 'tables:read'
  | 'tables:create'
  | 'tables:update'
  | 'tables:delete'
  // Giao dịch / đơn hàng
  | 'transactions:read'
  | 'transactions:create'
  | 'transactions:update'
  | 'transactions:delete'
  // Nhân viên
  | 'employees:read'
  | 'employees:create'
  | 'employees:update'
  | 'employees:delete'
  // Báo cáo
  | 'reports:read'
  // Cài đặt hệ thống
  | 'settings:read'
  | 'settings:update'
  // Thu hồi token khẩn cấp (FR-07)
  | 'auth:revoke_token';

// ─── Permission sets per role ─────────────────────────────────────────────────

const ADMIN_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'products:read', 'products:create', 'products:update', 'products:delete',
  'tables:read', 'tables:create', 'tables:update', 'tables:delete',
  'transactions:read', 'transactions:create', 'transactions:update', 'transactions:delete',
  'employees:read', 'employees:create', 'employees:update', 'employees:delete',
  'reports:read',
  'settings:read', 'settings:update',
  'auth:revoke_token',
];

const MANAGER_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'products:read', 'products:create', 'products:update',
  'tables:read', 'tables:create', 'tables:update',
  'transactions:read', 'transactions:create', 'transactions:update',
  'employees:read', 'employees:create', 'employees:update',
  'reports:read',
  'settings:read',
];

const CASHIER_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'products:read',
  'tables:read',
  'transactions:read', 'transactions:create', 'transactions:update',
];

const STAFF_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'tables:read',
  'transactions:read', 'transactions:create',
];

const BARISTA_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'products:read',
  'transactions:read',
];

// ─── Map role → permissions ───────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin:   ADMIN_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  cashier: CASHIER_PERMISSIONS,
  staff:   STAFF_PERMISSIONS,
  barista: BARISTA_PERMISSIONS,
};

/**
 * Hook-free helper: kiểm tra quyền trực tiếp
 * Dùng trong component (ngoài guard) để ẩn/hiện UI elements.
 *
 * Ví dụ:
 *   const canDelete = can(user.role, 'employees:delete');
 */
export const can = (role: string, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};
