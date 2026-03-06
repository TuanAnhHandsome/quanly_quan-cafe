import { IsNotEmpty, IsString, MaxLength, IsOptional } from "class-validator"

export class CreateCategoryDto {
  @IsNotEmpty({ message: "Tên danh mục không được để trống" })
  @IsString()
  @MaxLength(100, { message: "Tên danh mục tối đa 100 ký tự" })
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Mô tả tối đa 500 ký tự" })
  description?: string
}
