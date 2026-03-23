import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator"

export class CreateShiftAssignmentDto {
  @IsNotEmpty({ message: "userId là bắt buộc" })
  @IsInt()
  userId: number

  @IsNotEmpty({ message: "shiftId là bắt buộc" })
  @IsInt()
  shiftId: number

  @IsNotEmpty({ message: "workDate là bắt buộc" })
  @IsDateString({}, { message: "workDate phải có định dạng YYYY-MM-DD" })
  workDate: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}
