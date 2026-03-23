import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiCookieAuth } from "@nestjs/swagger"
import { ShiftsService } from "./services/shifts.service"
import { CreateShiftDto } from "./dto/create-shift.dto"
import { UpdateShiftDto } from "./dto/update-shift.dto"
import { RequirePermissions } from "../permissions/decorators/permissions.decorator"

@ApiTags("Shifts")
@ApiCookieAuth()
@Controller("shifts")
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  // ─── GET /shifts ─ Danh sách ca (active) ───────────────────────
  @Get()
  @RequirePermissions("shift:view_own")
  @ApiOperation({ summary: "Danh sách ca làm việc (active)" })
  findAll() {
    return this.shiftsService.findAll(true) // chỉ active
  }

  // ─── GET /shifts/all ─ Tất cả (bao gồm inactive) ──────────────
  @Get("all")
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Tất cả ca (bao gồm inactive) — Admin/Manager" })
  findAllIncludingInactive() {
    return this.shiftsService.findAll(false)
  }

  // ─── GET /shifts/:id ──────────────────────────────────────────
  @Get(":id")
  @RequirePermissions("shift:view_own")
  @ApiOperation({ summary: "Chi tiết ca làm việc" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.shiftsService.findById(id)
  }

  // ─── POST /shifts ─────────────────────────────────────────────
  @Post()
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Tạo ca mới — Admin/Manager" })
  create(@Body() dto: CreateShiftDto) {
    return this.shiftsService.create(dto)
  }

  // ─── PATCH /shifts/:id ────────────────────────────────────────
  @Patch(":id")
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Cập nhật ca — Admin/Manager" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(id, dto)
  }

  // ─── DELETE /shifts/:id ───────────────────────────────────────
  @Delete(":id")
  @RequirePermissions("shift:manage")
  @ApiOperation({ summary: "Xóa ca — Admin/Manager" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.shiftsService.delete(id)
    return { statusCode: 200, message: `Đã xóa ca làm việc #${id} thành công` }
  }
}
