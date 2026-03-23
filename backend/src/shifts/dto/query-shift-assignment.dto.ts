import { IsOptional, IsDateString, IsInt, IsEnum } from "class-validator"
import { Type } from "class-transformer"
import { AssignmentStatus } from "../entities/shift-assignment.entity"

/**
 * Query params cho GET /shift-assignments
 */
export class QueryShiftAssignmentDto {
  @IsOptional()
  @IsDateString({}, { message: "startDate phải có định dạng YYYY-MM-DD" })
  startDate?: string

  @IsOptional()
  @IsDateString({}, { message: "endDate phải có định dạng YYYY-MM-DD" })
  endDate?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  shiftId?: number

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus
}
