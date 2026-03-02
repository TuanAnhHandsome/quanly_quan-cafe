import { IsOptional, IsEnum, IsString, MaxLength } from "class-validator"
import { AssignmentStatus } from "../entities/shift-assignment.entity"

export class UpdateShiftAssignmentDto {
  @IsOptional()
  @IsEnum(AssignmentStatus, {
    message: `status phải là: ${Object.values(AssignmentStatus).join(", ")}`,
  })
  status?: AssignmentStatus

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string
}
