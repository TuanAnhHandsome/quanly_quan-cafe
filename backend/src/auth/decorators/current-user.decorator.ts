import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { JwtPayload } from "../guards/jwt-auth.guard"

/**
 * Decorator lấy thông tin user từ JWT payload đã được xác thực.
 *
 * @example
 * \@Get('profile')
 * \@UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
