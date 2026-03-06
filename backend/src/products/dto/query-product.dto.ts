import { IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator"
import { Type } from "class-transformer"
import { MenuType, ProductStatus } from "../entities/product.entity"

/**
 * Query params cho GET /products
 * Hỗ trợ: search, filter theo menuType/categoryId/status, phân trang.
 */
export class QueryProductDto {
  /** Tìm kiếm theo tên hoặc mã hàng */
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(MenuType)
  menuType?: MenuType

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number
}
