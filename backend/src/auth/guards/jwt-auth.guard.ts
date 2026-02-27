import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { Request } from "express"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"

export interface JwtPayload {
  sub: number
  role: string
  tokenVersion: number
  iat?: number
  exp?: number
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException("Access token is missing")
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET_KEY"),
      })
      request["user"] = payload
    } catch {
      throw new UnauthorizedException("Access token is invalid or expired")
    }

    return true
  }

  private extractToken(request: Request): string | undefined {
    const fromCookie = request.cookies?.["access_token"]
    if (fromCookie) return fromCookie

    const authHeader = request.headers.authorization
    if (!authHeader) return undefined
    const [type, token] = authHeader.split(" ")
    return type === "Bearer" ? token : undefined
  }
}
