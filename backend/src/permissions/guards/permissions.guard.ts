import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator"
import { PermissionsService } from "../services/permissions.service"
import { IS_PUBLIC_KEY } from "../../auth/decorators/public.decorator"
import { UserRole } from "../../users/entities/user.entity"

interface PermissionsMetadata {
  permissions: string[]
  mode: "ALL" | "ANY"
}

/**
 * Guard kiểm tra permission dựa trên role của user trong JWT.
 *
 * Luồng:
 *  1. Route @Public() → bỏ qua
 *  2. Route không có @RequirePermissions → cho qua (chỉ cần đã login)
 *  3. Lấy role từ request.user (do JwtAuthGuard gán)
 *  4. Check permission qua PermissionsService (có cache)
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Route public → skip
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    // Không có decorator @RequirePermissions → chỉ cần login
    const meta = this.reflector.getAllAndOverride<PermissionsMetadata | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (!meta || meta.permissions.length === 0) return true

    // Lấy user từ request (do JwtAuthGuard gán)
    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (!user?.role) {
      throw new ForbiddenException("User role not found")
    }

    const role = user.role as UserRole
    const { permissions, mode } = meta

    const hasPermission =
      mode === "ANY"
        ? await this.permissionsService.hasAnyPermission(role, permissions)
        : await this.permissionsService.hasAllPermissions(role, permissions)

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${permissions.join(", ")} (${mode})`
      )
    }

    return true
  }
}
