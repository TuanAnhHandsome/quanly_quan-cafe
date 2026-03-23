import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  MaxLength,
} from "class-validator"
import { Type } from "class-transformer"
import { PaymentMethod } from "../entities/payment.entity"

export class CreatePaymentDto {
  @IsNotEmpty({ message: "Phương thức thanh toán không được để trống" })
  @IsEnum(PaymentMethod, { message: "Phương thức phải là: cash, bank_transfer, payos_qr" })
  method: PaymentMethod

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Số tiền khách đưa phải là số" })
  @Min(0, { message: "Số tiền khách đưa không được âm" })
  receivedAmount?: number

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Ghi chú tối đa 500 ký tự" })
  note?: string
}
