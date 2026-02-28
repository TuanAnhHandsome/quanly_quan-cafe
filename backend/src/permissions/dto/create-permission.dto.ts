import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"
import { PermissionModule } from "../entities/permission.entity"

export class CreatePermissionDto {
  @IsNotEmpty({ message: "name is required" })
  @IsString()
  @MaxLength(100)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string

  @IsNotEmpty({ message: "module is required" })
  @IsEnum(PermissionModule, {
    message: `module must be one of: ${Object.values(PermissionModule).join(", ")}`,
  })
  module: PermissionModule
}
