import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from "class-validator"
import { Type } from "class-transformer"
import { MenuType, ProductStatus } from "../entities/product.entity"

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Mã hàng tối đa 50 ký tự" })
  code?: string

  @IsNotEmpty({ message: "Tên hàng không được để trống" })
  @IsString()
  @MaxLength(200, { message: "Tên hàng tối đa 200 ký tự" })
  name: string

  @IsNotEmpty({ message: "Loại thực đơn không được để trống" })
  @IsEnum(MenuType, { message: "Loại thực đơn phải là: food, beverage, other" })
  menuType: MenuType

  @IsNotEmpty({ message: "Danh mục không được để trống" })
  @Type(() => Number)
  @IsInt({ message: "categoryId phải là số nguyên" })
  categoryId: number

  @IsOptional()
  @IsEnum(ProductStatus, { message: "Trạng thái phải là: active, inactive" })
  status?: ProductStatus

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: "Giá vốn không được âm" })
  costPrice?: number

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: "Giá bán không được âm" })
  sellingPrice?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: "Tồn kho không được âm" })
  stock?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: "Tồn tối thiểu không được âm" })
  minStock?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: "Tồn tối đa không được âm" })
  maxStock?: number
}
