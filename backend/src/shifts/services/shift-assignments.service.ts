import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ShiftAssignmentsRepository } from "../repositories/shift-assignments.repository"
import { ShiftsRepository } from "../repositories/shifts.repository"
import { ShiftsService } from "./shifts.service"
import { User, UserRole } from "../../users/entities/user.entity"
import { ShiftAssignment, AssignmentStatus } from "../entities/shift-assignment.entity"
import { CreateShiftAssignmentDto } from "../dto/create-shift-assignment.dto"
import { BulkCreateShiftAssignmentDto } from "../dto/bulk-create-shift-assignment.dto"
import { UpdateShiftAssignmentDto } from "../dto/update-shift-assignment.dto"
import type { QueryShiftAssignmentDto } from "../dto/query-shift-assignment.dto"
import type { Shift } from "../entities/shift.entity"

// ─── PUBLIC INTERFACES ────────────────────────────────────────────────
// Phải export vì xuất hiện trong return type public methods (TS4053).

export interface StaffWarning {
  date: string
  shiftId: number
  shiftName: string
  message: string
}

export interface BulkResult {
  created: ShiftAssignment[]
  errors: Array<{ userId: number; workDate: string; reason: string }>
  warnings: StaffWarning[]
}

// ────────────────────────────────────────────────────────────────────────

@Injectable()
export class ShiftAssignmentsService {
  constructor(
    private readonly assignmentsRepo: ShiftAssignmentsRepository,
    private readonly shiftsRepo: ShiftsRepository,
    private readonly shiftsService: ShiftsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─── QUERIES ──────────────────────────────────────────────────────

  async findAll(query: QueryShiftAssignmentDto): Promise<ShiftAssignment[]> {
    return await this.assignmentsRepo.findByQuery(query)
  }

  async findMySchedule(
    userId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ShiftAssignment[]> {
    return await this.assignmentsRepo.findByUser(userId, startDate, endDate)
  }

  async findById(id: number): Promise<ShiftAssignment> {
    const assignment = await this.assignmentsRepo.findById(id)
    if (!assignment) throw new NotFoundException(`Phân ca #${id} không tồn tại`)
    return assignment
  }

  /**
   * Lịch tuần dạng grid: { Mon: [...], Tue: [...], ... Sun: [...] }
   * @param dateInWeek Bất kỳ ngày nào trong tuần → hệ thống tính ra Mon-Sun.
   */
  async findWeekSchedule(
    dateInWeek: string,
  ): Promise<Record<string, ShiftAssignment[]>> {
    const d = new Date(dateInWeek)
    const day = d.getDay() // 0=Sun
    const diffToMon = day === 0 ? -6 : 1 - day
    const mon = new Date(d)
    mon.setDate(d.getDate() + diffToMon)

    const sun = new Date(mon)
    sun.setDate(mon.getDate() + 6)

    const startDate = this.toDateStr(mon)
    const endDate = this.toDateStr(sun)

    const assignments = await this.assignmentsRepo.findByQuery({ startDate, endDate })

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const grid: Record<string, ShiftAssignment[]> = {}
    for (const name of dayNames) grid[name] = []

    for (const sa of assignments) {
      const wd = new Date(sa.workDate)
      const idx = wd.getDay() === 0 ? 6 : wd.getDay() - 1
      grid[dayNames[idx]].push(sa)
    }

    return grid
  }

  // ─── CREATE (single) ─────────────────────────────────────────────

  async create(
    dto: CreateShiftAssignmentDto,
    assignedByUserId: number,
  ): Promise<{ assignment: ShiftAssignment; warnings: StaffWarning[] }> {
    const shift = await this.shiftsService.findById(dto.shiftId)
    await this.validateAssignment(dto.userId, shift, dto.workDate)

    const assignment = await this.assignmentsRepo.create({
      userId: dto.userId,
      shiftId: dto.shiftId,
      workDate: dto.workDate,
      note: dto.note,
      assignedBy: assignedByUserId,
    })

    const warnings = await this.checkMinStaffWarnings(dto.shiftId, dto.workDate, shift.name)

    const full = await this.assignmentsRepo.findById(assignment.id)
    return { assignment: full!, warnings }
  }

  // ─── CREATE BULK ──────────────────────────────────────────────────

  async createBulk(
    dto: BulkCreateShiftAssignmentDto,
    assignedByUserId: number,
  ): Promise<BulkResult> {
    const shift = await this.shiftsService.findById(dto.shiftId)

    const created: ShiftAssignment[] = []
    const errors: BulkResult["errors"] = []
    const warningSet = new Map<string, StaffWarning>()

    for (const workDate of dto.workDates) {
      for (const userId of dto.userIds) {
        try {
          await this.validateAssignment(userId, shift, workDate)

          const assignment = await this.assignmentsRepo.create({
            userId,
            shiftId: dto.shiftId,
            workDate,
            note: dto.note,
            assignedBy: assignedByUserId,
          })
          const full = await this.assignmentsRepo.findById(assignment.id)
          created.push(full!)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error"
          errors.push({ userId, workDate, reason: message })
        }
      }

      // Check warnings per date (after all users for that date)
      const dateWarnings = await this.checkMinStaffWarnings(dto.shiftId, workDate, shift.name)
      for (const w of dateWarnings) {
        warningSet.set(`${w.date}_${w.shiftId}_${w.message}`, w)
      }
    }

    return { created, errors, warnings: [...warningSet.values()] }
  }

  // ─── UPDATE ───────────────────────────────────────────────────────

  async update(id: number, dto: UpdateShiftAssignmentDto): Promise<ShiftAssignment> {
    const assignment = await this.findById(id)

    // Chỉ cho phép đổi status → absent nếu workDate <= today
    if (dto.status === AssignmentStatus.ABSENT) {
      const todayStr = this.todayStr()
      if (assignment.workDate > todayStr) {
        throw new BadRequestException(
          "Chỉ được đánh dấu vắng mặt cho ngày hôm nay hoặc ngày đã qua",
        )
      }
    }

    const updated = await this.assignmentsRepo.update(id, dto)
    return updated!
  }

  // ─── DELETE ───────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    await this.findById(id) // ensure exists
    await this.assignmentsRepo.delete(id)
  }

  // ─── PRIVATE: VALIDATION ──────────────────────────────────────────

  /**
   * 5 kiểm tra khi phân ca:
   * 1. User tồn tại & isActive
   * 2. Ngày không phải quá khứ
   * 3. Không trùng (userId, shiftId, workDate)
   * 4. Không vượt maxStaff
   * 5. Không overlap giờ ca (bao gồm ca qua đêm)
   */
  private async validateAssignment(
    userId: number,
    shift: Shift,
    workDate: string,
  ): Promise<void> {
    // 1. User tồn tại & active
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException(`Nhân viên #${userId} không tồn tại`)
    if (!user.isActive) {
      throw new BadRequestException(`Nhân viên "${user.fullName}" đã bị vô hiệu hóa`)
    }

    // 2. Không phân ca cho ngày quá khứ
    const todayStr = this.todayStr()
    if (workDate < todayStr) {
      throw new BadRequestException("Không thể phân ca cho ngày đã qua")
    }

    // 3. Duplicate check
    const dup = await this.assignmentsRepo.findDuplicate(userId, shift.id, workDate)
    if (dup) {
      throw new ConflictException(
        `Nhân viên "${user.fullName}" đã được phân vào ca "${shift.name}" ngày ${workDate}`,
      )
    }

    // 4. Max staff
    const currentCount = await this.assignmentsRepo.countByShiftAndDate(shift.id, workDate)
    if (currentCount >= shift.maxStaff) {
      throw new BadRequestException(
        `Ca "${shift.name}" ngày ${workDate} đã đủ ${shift.maxStaff} nhân viên`,
      )
    }

    // 5. Time overlap
    await this.checkTimeOverlap(userId, shift, workDate, user.fullName)
  }

  /**
   * Kiểm tra overlap giờ ca, bao gồm ca qua đêm.
   *
   * Ví dụ: Ca đêm 22:00–06:00 ngày D = thực tế 22:00 D → 06:00 D+1.
   * → Phải check overlap với tất cả assignment:
   *   - Ngày D-1 (ca qua đêm kéo sang D)
   *   - Ngày D (ca thường + ca qua đêm bắt đầu D)
   *   - Ngày D+1 (ca bắt đầu D+1 có thể bị đè bởi ca qua đêm D)
   */
  private async checkTimeOverlap(
    userId: number,
    newShift: Shift,
    workDate: string,
    userName: string,
  ): Promise<void> {
    const d = new Date(workDate)
    const prevDate = new Date(d)
    prevDate.setDate(d.getDate() - 1)
    const nextDate = new Date(d)
    nextDate.setDate(d.getDate() + 1)

    const startDate = this.toDateStr(prevDate)
    const endDate = this.toDateStr(nextDate)

    const existingAssignments = await this.assignmentsRepo.findUserAssignmentsInDateRange(
      userId,
      startDate,
      endDate,
    )

    // Tính phạm vi tuyệt đối (phút) cho ca mới
    const newRange = this.toAbsoluteRange(newShift, workDate)

    for (const existing of existingAssignments) {
      // Skip nếu cùng shift + cùng date (trùng duplicate → đã check)
      if (existing.shiftId === newShift.id && existing.workDate === workDate) continue

      const existingRange = this.toAbsoluteRange(existing.shift, existing.workDate)

      // Check overlap: 2 range overlap nếu start < otherEnd && end > otherStart
      if (newRange.start < existingRange.end && newRange.end > existingRange.start) {
        throw new ConflictException(
          `Nhân viên "${userName}" bị trùng giờ: ca "${newShift.name}" (${newShift.startTime}–${newShift.endTime}) ngày ${workDate} trùng với ca "${existing.shift.name}" (${existing.shift.startTime}–${existing.shift.endTime}) ngày ${existing.workDate}`,
        )
      }
    }
  }

  /**
   * Chuyển ca + workDate thành absolute minute range.
   * Base = dayIndex * 1440 (phút). dayIndex 0 = ngày gốc.
   */
  private toAbsoluteRange(
    shift: Shift,
    workDate: string,
  ): { start: number; end: number } {
    const dayOffset = this.dayIndex(workDate) * 1440

    const [sh, sm] = shift.startTime.split(":").map(Number)
    const [eh, em] = shift.endTime.split(":").map(Number)

    const start = dayOffset + sh * 60 + sm
    let end = dayOffset + eh * 60 + em

    // Ca qua đêm → end thuộc ngày hôm sau
    if (shift.isOvernight) {
      end += 1440
    }

    return { start, end }
  }

  /**
   * Trả về dayIndex dựa trên epoch day (chỉ cần consistent, không cần chính xác).
   */
  private dayIndex(dateStr: string): number {
    const d = new Date(dateStr)
    return Math.floor(d.getTime() / 86400000)
  }

  // ─── PRIVATE: MIN-STAFF WARNINGS ─────────────────────────────────

  /**
   * Check xem ca + ngày hiện tại đã có đủ tối thiểu:
   *   - 1 barista
   *   - 1 cashier
   *   - 1 staff
   * Nếu chưa → trả warnings (không reject).
   */
  private async checkMinStaffWarnings(
    shiftId: number,
    workDate: string,
    shiftName: string,
  ): Promise<StaffWarning[]> {
    const assignments = await this.assignmentsRepo.findByShiftAndDate(shiftId, workDate)

    const roleSet = new Set<UserRole>()
    for (const sa of assignments) {
      if (sa.user) roleSet.add(sa.user.role)
    }

    const warnings: StaffWarning[] = []
    const requiredRoles: Array<{ role: UserRole; label: string }> = [
      { role: UserRole.BARISTA, label: "Barista" },
      { role: UserRole.CASHIER, label: "Thu ngân" },
      { role: UserRole.STAFF, label: "Nhân viên phục vụ" },
    ]

    for (const { role, label } of requiredRoles) {
      if (!roleSet.has(role)) {
        warnings.push({
          date: workDate,
          shiftId,
          shiftName,
          message: `Thiếu ${label} cho ca "${shiftName}" ngày ${workDate}`,
        })
      }
    }

    return warnings
  }

  // ─── HELPERS ──────────────────────────────────────────────────────

  private todayStr(): string {
    return new Date().toISOString().slice(0, 10)
  }

  private toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10)
  }
}
