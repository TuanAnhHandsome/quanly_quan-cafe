import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator"
import { PermissionModule } from "../entities/permission.entity"

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string

  @IsOptional()
  @IsEnum(PermissionModule, {
    message: `module must be one of: ${Object.values(PermissionModule).join(", ")}`,
  })
  module?: PermissionModule
}
