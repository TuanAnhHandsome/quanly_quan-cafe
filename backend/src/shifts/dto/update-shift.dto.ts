import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsBoolean,
  Matches,
} from "class-validator"

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "startTime phải có định dạng HH:mm (VD: 06:00)",
  })
  startTime?: string

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "endTime phải có định dạng HH:mm (VD: 14:00)",
  })
  endTime?: string

  @IsOptional()
  @IsInt({ message: "maxStaff phải là số nguyên" })
  @Min(3, { message: "Tối thiểu 3 nhân viên (1 barista + 1 cashier + 1 staff)" })
  maxStaff?: number

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
