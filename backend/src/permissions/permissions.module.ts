import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Permission } from "./entities/permission.entity"
import { RolePermission } from "./entities/role-permission.entity"
import { PermissionsRepository } from "./repositories/permissions.repository"
import { PermissionsService } from "./services/permissions.service"
import { PermissionsGuard } from "./guards/permissions.guard"
import { PermissionsController } from "./permissions.controller"
import { RolePermissionsController } from "./role-permissions.controller"

@Module({
  imports: [TypeOrmModule.forFeature([Permission, RolePermission])],
  controllers: [PermissionsController, RolePermissionsController],
  providers: [PermissionsRepository, PermissionsService, PermissionsGuard],
  exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
