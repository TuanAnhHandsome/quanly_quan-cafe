import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"
import { OrderItemDto } from "./create-order.dto"

export class UpdateOrderItemsDto {
  @IsArray({ message: "items phải là mảng" })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  /** Frontend gửi kèm version hiện tại để phát hiện conflict */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  version?: number

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Ghi chú đơn hàng tối đa 500 ký tự" })
  note?: string
}
