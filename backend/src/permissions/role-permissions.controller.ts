import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { PermissionsService } from "./services/permissions.service"
import {
  SyncRolePermissionsDto,
  AssignPermissionsDto,
  RevokePermissionsDto,
} from "./dto/role-permissions.dto"
import { RequirePermissions } from "./decorators/permissions.decorator"
import { UserRole } from "../users/entities/user.entity"

@Controller("role-permissions")
export class RolePermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * GET /api/v1/role-permissions
   * Lấy tất cả permissions gom theo role.
   */
  @Get()
  @RequirePermissions("system:config")
  async findAll() {
    const data = await this.permissionsService.getAllRolesWithPermissions()
    return { message: "All role permissions retrieved", data }
  }

  /**
   * GET /api/v1/role-permissions/:role
   * Lấy permissions của 1 role cụ thể.
   */
  @Get(":role")
  @RequirePermissions("system:config")
  async findByRole(@Param("role") role: UserRole) {
    const rolePermissions = await this.permissionsService.getRolePermissions(role)
    return {
      message: `Permissions for role "${role}" retrieved`,
      data: rolePermissions.map((rp) => rp.permission),
    }
  }

  /**
   * POST /api/v1/role-permissions/sync
   * Thay thế toàn bộ permissions của role bằng danh sách mới.
   */
  @Post("sync")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions("system:config")
  async sync(@Body() dto: SyncRolePermissionsDto) {
    await this.permissionsService.syncRolePermissions(dto.role, dto.permissionIds)
    return { message: `Permissions synced for role "${dto.role}"` }
  }

  /**
   * POST /api/v1/role-permissions/assign
   * Thêm permissions vào role (không xóa cũ).
   */
  @Post("assign")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions("system:config")
  async assign(@Body() dto: AssignPermissionsDto) {
    await this.permissionsService.assignPermissions(dto.role, dto.permissionIds)
    return { message: `Permissions assigned to role "${dto.role}"` }
  }

  /**
   * POST /api/v1/role-permissions/revoke
   * Gỡ permissions khỏi role.
   */
  @Post("revoke")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions("system:config")
  async revoke(@Body() dto: RevokePermissionsDto) {
    await this.permissionsService.revokePermissions(dto.role, dto.permissionIds)
    return { message: `Permissions revoked from role "${dto.role}"` }
  }
}
