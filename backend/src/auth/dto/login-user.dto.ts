import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class LoginUserDto {
  @IsEmail({}, { message: "Email must be a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email: string

  @IsNotEmpty({ message: "Password is required" })
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string

  /**
   * Định danh thiết bị (tùy chọn).
   * - Nếu client gửi lên → dùng luôn (UUID do client sinh và lưu ở localStorage).
   * - Nếu không có → server tự sinh fingerprint từ User-Agent + IP.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string

  /** Tên hiển thị của thiết bị (tùy chọn) */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceName?: string
}
