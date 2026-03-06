import {
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
} from "class-validator"
import { Type } from "class-transformer"
import { MenuType, ProductStatus } from "../entities/product.entity"

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: "Tên hàng tối đa 200 ký tự" })
  name?: string

  @IsOptional()
  @IsEnum(MenuType, { message: "Loại thực đơn phải là: food, beverage, other" })
  menuType?: MenuType

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "categoryId phải là số nguyên" })
  categoryId?: number

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
