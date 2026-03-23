import { IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator"
import { Type } from "class-transformer"
import { OrderStatus } from "../entities/order.entity"

export class QueryOrderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tableId?: number

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  createdBy?: number

  @IsOptional()
  @IsString()
  search?: string

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
