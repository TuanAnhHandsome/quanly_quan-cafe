import { SetMetadata } from "@nestjs/common"

export const PERMISSIONS_KEY = "permissions"

/**
 * Yêu cầu TẤT CẢ permissions trong danh sách.
 *
 * @example
 * \@RequirePermissions('user:create', 'user:update')
 * \@Post('users')
 * createUser() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: "ALL" })

/**
 * Yêu cầu ÍT NHẤT 1 permission trong danh sách.
 *
 * @example
 * \@RequireAnyPermission('order:view_own', 'order:view_all')
 * \@Get('orders')
 * getOrders() { ... }
 */
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: "ANY" })
