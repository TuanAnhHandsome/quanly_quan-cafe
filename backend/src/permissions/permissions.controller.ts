import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { PermissionsService } from "./services/permissions.service"
import { CreatePermissionDto } from "./dto/create-permission.dto"
import { UpdatePermissionDto } from "./dto/update-permission.dto"
import { RequirePermissions } from "./decorators/permissions.decorator"

@Controller("permissions")
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * GET /api/v1/permissions
   * Lấy danh sách tất cả permissions.
   */
  @Get()
  @RequirePermissions("system:config")
  async findAll() {
    const permissions = await this.permissionsService.findAllPermissions()
    return { message: "Permissions retrieved", data: permissions }
  }

  /**
   * GET /api/v1/permissions/:id
   * Lấy chi tiết 1 permission.
   */
  @Get(":id")
  @RequirePermissions("system:config")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const permission = await this.permissionsService.findPermissionById(id)
    return { message: "Permission retrieved", data: permission }
  }

  /**
   * POST /api/v1/permissions
   * Tạo permission mới.
   */
  @Post()
  @RequirePermissions("system:config")
  async create(@Body() dto: CreatePermissionDto) {
    const permission = await this.permissionsService.createPermission(dto)
    return { message: "Permission created", data: permission }
  }

  /**
   * PATCH /api/v1/permissions/:id
   * Cập nhật permission.
   */
  @Patch(":id")
  @RequirePermissions("system:config")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.updatePermission(id, dto)
    return { message: "Permission updated", data: permission }
  }

  /**
   * DELETE /api/v1/permissions/:id
   * Xóa permission (cascade xóa role_permissions liên quan).
   */
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @RequirePermissions("system:config")
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.permissionsService.deletePermission(id)
    return { message: "Permission deleted" }
  }
}
