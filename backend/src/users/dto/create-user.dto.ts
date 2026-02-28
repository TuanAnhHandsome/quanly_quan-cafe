import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from "class-validator"
import { UserRole } from "../entities/user.entity"

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  fullName: string

  @IsEmail()
  @Length(5, 100)
  email: string

  @IsOptional()
  @IsString()
  @Length(9, 15)
  phone?: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string

  @IsEnum(UserRole, {
    message: "Role must be admin | manager | cashier | staff | barista",
  })
  role: UserRole
}
