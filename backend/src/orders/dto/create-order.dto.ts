import {
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from "class-validator"
import { Type } from "class-transformer"

export class OrderItemDto {
  @IsNotEmpty({ message: "productId không được để trống" })
  @Type(() => Number)
  @IsInt({ message: "productId phải là số nguyên" })
  productId: number

  @IsNotEmpty({ message: "Số lượng không được để trống" })
  @Type(() => Number)
  @IsInt({ message: "Số lượng phải là số nguyên" })
  @Min(1, { message: "Số lượng phải >= 1" })
  quantity: number

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Ghi chú tối đa 500 ký tự" })
  note?: string
}

export class CreateOrderDto {
  @IsNotEmpty({ message: "tableId không được để trống" })
  @Type(() => Number)
  @IsInt({ message: "tableId phải là số nguyên" })
  tableId: number

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Ghi chú đơn hàng tối đa 500 ký tự" })
  note?: string

  @IsArray({ message: "items phải là mảng" })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]
}
