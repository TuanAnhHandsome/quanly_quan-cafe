import { IsOptional, IsString, MaxLength, IsBoolean } from "class-validator"

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: "Tên danh mục tối đa 100 ký tự" })
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Mô tả tối đa 500 ký tự" })
  description?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
