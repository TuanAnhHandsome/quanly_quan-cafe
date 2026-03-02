import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Shift } from "./entities/shift.entity"
import { ShiftAssignment } from "./entities/shift-assignment.entity"
import { User } from "../users/entities/user.entity"
import { ShiftsRepository } from "./repositories/shifts.repository"
import { ShiftAssignmentsRepository } from "./repositories/shift-assignments.repository"
import { ShiftsService } from "./services/shifts.service"
import { ShiftAssignmentsService } from "./services/shift-assignments.service"
import { ShiftsController } from "./shifts.controller"
import { ShiftAssignmentsController } from "./shift-assignments.controller"

@Module({
  imports: [TypeOrmModule.forFeature([Shift, ShiftAssignment, User])],
  controllers: [ShiftsController, ShiftAssignmentsController],
  providers: [
    ShiftsRepository,
    ShiftAssignmentsRepository,
    ShiftsService,
    ShiftAssignmentsService,
  ],
  exports: [ShiftsService, ShiftAssignmentsService],
})
export class ShiftsModule {}
