import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthService } from "./services/auth.service"
import { AuthController } from "./auth.controller"
import { SessionRepository } from "./repositories/session.repository"
import { UserSession } from "./entities/user-session.entity"
import { UsersModule } from "../users/users.module"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionRepository, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}