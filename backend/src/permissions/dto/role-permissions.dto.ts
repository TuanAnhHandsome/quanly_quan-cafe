import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize, IsString } from "class-validator"
import { UserRole } from "../../users/entities/user.entity"

/**
 * Gán danh sách permissions cho 1 role.
 * Thao tác này sẽ THAY THẾ toàn bộ permissions cũ của role = sync.
 */
export class SyncRolePermissionsDto {
  @IsNotEmpty({ message: "role is required" })
  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(", ")}`,
  })
  role: UserRole

  @IsArray({ message: "permissionIds must be an array" })
  @ArrayMinSize(0)
  permissionIds: number[]
}

/**
 * Gán thêm permissions vào 1 role (không xóa cũ).
 */
export class AssignPermissionsDto {
  @IsNotEmpty({ message: "role is required" })
  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(", ")}`,
  })
  role: UserRole

  @IsArray({ message: "permissionIds must be an array" })
  @ArrayMinSize(1, { message: "permissionIds must have at least 1 item" })
  permissionIds: number[]
}

/**
 * Gỡ permissions khỏi 1 role.
 */
export class RevokePermissionsDto {
  @IsNotEmpty({ message: "role is required" })
  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(", ")}`,
  })
  role: UserRole

  @IsArray({ message: "permissionIds must be an array" })
  @ArrayMinSize(1, { message: "permissionIds must have at least 1 item" })
  permissionIds: number[]
}
