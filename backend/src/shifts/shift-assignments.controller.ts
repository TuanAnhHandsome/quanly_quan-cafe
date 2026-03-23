import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiCookieAuth, ApiQuery } from "@nestjs/swagger"
import { ShiftAssignmentsService } from "./services/shift-assignments.service"
import { CreateShiftAssignmentDto } from "./dto/create-shift-assignment.dto"
import { BulkCreateShiftAssignmentDto } from "./dto/bulk-create-shift-assignment.dto"
import { UpdateShiftAssignmentDto } from "./dto/update-shift-assignment.dto"
import { QueryShiftAssignmentDto } from "./dto/query-shift-assignment.dto"
import { RequirePermissions } from "../permissions/decorators/permissions.decorator"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import type { JwtPayload } from "../auth/guards/jwt-auth.guard"

@ApiTags("Shift Assignments")
@ApiCookieAuth()
@Controller("shift-assignments")
export class ShiftAssignmentsController {
  constructor(private readonly service: ShiftAssignmentsService) {}

  // ─── GET /shift-assignments ──────────────────────────────────
  @Get()
  @RequirePermissions("shift:view_all")
  @ApiOperation({ summary: "Danh sách phân ca (filter) — Admin/Manager" })
  findAll(@Query() query: QueryShiftAssignmentDto) {
    return this.service.findAll(query)
  }

  // ─── GET /shift-assignments/my ───────────────────────────────
  @Get("my")
  @RequirePermissions("shift:view_own")
  @ApiOperation({ summary: "Lịch làm việc cá nhân" })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  findMySchedule(
    @CurrentUser() user: JwtPayload,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.service.findMySchedule(user.sub, startDate, endDate)
  }

  // ─── GET /shift-assignments/week ─────────────────────────────
  @Get("week")
  @RequirePermissions("shift:view_all")
  @ApiOperation({ summary: "Lịch tuần (Mon-Sun grid) — Admin/Manager" })
  @ApiQuery({ name: "date", required: true, description: "Bất kỳ ngày trong tuần (YYYY-MM-DD)" })
  findWeekSchedule(@Query("date") date: string) {
    return this.service.findWeekSchedule(date)
  }

  // ─── GET /shift-assignments/:id ──────────────────────────────
  @Get(":id")
  @RequirePermissions("shift:view_all")
  @ApiOperation({ summary: "Chi tiết phân ca" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.service.findById(id)
  }

  // ─── POST /shift-assignments ─────────────────────────────────
  @Post()
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Phân ca (đơn lẻ) — Admin/Manager" })
  create(
    @Body() dto: CreateShiftAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.create(dto, user.sub)
  }

  // ─── POST /shift-assignments/bulk ────────────────────────────
  @Post("bulk")
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Phân ca hàng loạt — Admin/Manager" })
  createBulk(
    @Body() dto: BulkCreateShiftAssignmentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.createBulk(dto, user.sub)
  }

  // ─── PATCH /shift-assignments/:id ────────────────────────────
  @Patch(":id")
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Cập nhật phân ca — Admin/Manager" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateShiftAssignmentDto,
  ) {
    return this.service.update(id, dto)
  }

  // ─── DELETE /shift-assignments/:id ───────────────────────────
  @Delete(":id")
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Xóa phân ca — Admin/Manager" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.service.delete(id)
    return { statusCode: 200, message: `Đã xóa phân ca #${id} thành công` }
  }
}
