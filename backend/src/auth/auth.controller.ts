import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common"
import type { Request, Response } from "express"
import { AuthService } from "./services/auth.service"
import { LoginUserDto } from "./dto/login-user.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { CurrentUser } from "./decorators/current-user.decorator"
import type { JwtPayload } from "./guards/jwt-auth.guard"
import { Public } from "./decorators/public.decorator"
import { RequirePermissions } from "../permissions/decorators/permissions.decorator"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Body: { email, password, deviceId?, deviceName? }
   */
  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.login(dto, req, res)
  }

  /**
   * POST /auth/refresh
   * Reads access_token + refresh_token from HTTP-only cookie.
   */
  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refresh(req, res)
  }

  /**
   * POST /auth/logout — không cần access token hợp lệ để logout.
   */
  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logout(req, res)
  }

  /**
   * POST /auth/logout-all
   * Revokes ALL sessions for the authenticated user (requires valid access token).
   */
  @RequirePermissions("auth:logout_all")
  @Post("logout-all")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logoutAll(user.sub, res)
  }
}
