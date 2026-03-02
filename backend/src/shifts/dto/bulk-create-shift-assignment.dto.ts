import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator"

/**
 * Phân ca hàng loạt.
 * Tạo assignment cho nhiều user × nhiều ngày × 1 ca.
 */
export class BulkCreateShiftAssignmentDto {
  @IsNotEmpty({ message: "shiftId là bắt buộc" })
  @IsInt()
  shiftId: number

  @IsArray({ message: "userIds phải là mảng" })
  @ArrayMinSize(1, { message: "Cần ít nhất 1 nhân viên" })
  @IsInt({ each: true })
  userIds: number[]

  @IsArray({ message: "workDates phải là mảng" })
  @ArrayMinSize(1, { message: "Cần ít nhất 1 ngày" })
  @IsDateString({}, { each: true, message: "Mỗi workDate phải có định dạng YYYY-MM-DD" })
  workDates: string[]

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}
