import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common"
import { ShiftsRepository } from "../repositories/shifts.repository"
import { ShiftAssignmentsRepository } from "../repositories/shift-assignments.repository"
import { CreateShiftDto } from "../dto/create-shift.dto"
import { UpdateShiftDto } from "../dto/update-shift.dto"
import type { Shift } from "../entities/shift.entity"

@Injectable()
export class ShiftsService {
  constructor(
    private readonly shiftsRepo: ShiftsRepository,
    private readonly assignmentsRepo: ShiftAssignmentsRepository,
  ) {}

  // ─── QUERIES ────────────────────────────────────────────────────────

  async findAll(onlyActive = false): Promise<Shift[]> {
    return await this.shiftsRepo.findAll(onlyActive)
  }

  async findById(id: number): Promise<Shift> {
    const shift = await this.shiftsRepo.findById(id)
    if (!shift) throw new NotFoundException(`Ca làm việc #${id} không tồn tại`)
    return shift
  }

  // ─── CREATE ─────────────────────────────────────────────────────────

  async create(dto: CreateShiftDto): Promise<Shift> {
    // Validate unique name
    const existing = await this.shiftsRepo.findByName(dto.name)
    if (existing) throw new ConflictException(`Tên ca "${dto.name}" đã tồn tại`)

    // Validate start ≠ end
    if (dto.startTime === dto.endTime) {
      throw new BadRequestException("Giờ bắt đầu và kết thúc không được trùng nhau")
    }

    const { isOvernight, totalHours } = this.calculateShiftMeta(dto.startTime, dto.endTime)

    return await this.shiftsRepo.create({
      ...dto,
      isOvernight,
      totalHours,
    })
  }

  // ─── UPDATE ─────────────────────────────────────────────────────────

  async update(id: number, dto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findById(id)

    // Check unique name nếu đổi tên
    if (dto.name && dto.name !== shift.name) {
      const existing = await this.shiftsRepo.findByName(dto.name)
      if (existing) throw new ConflictException(`Tên ca "${dto.name}" đã tồn tại`)
    }

    // Nếu thay đổi giờ → check có assignment tương lai không
    if (dto.startTime || dto.endTime) {
      const todayStr = this.todayStr()
      const futureCount = await this.assignmentsRepo.countFutureByShiftId(id, todayStr)
      if (futureCount > 0) {
        throw new BadRequestException(
          `Không thể sửa giờ ca. Hiện có ${futureCount} phân ca chưa hoàn thành. Vui lòng xóa phân ca trước.`,
        )
      }

      const startTime = dto.startTime ?? shift.startTime
      const endTime = dto.endTime ?? shift.endTime

      if (startTime === endTime) {
        throw new BadRequestException("Giờ bắt đầu và kết thúc không được trùng nhau")
      }

      const { isOvernight, totalHours } = this.calculateShiftMeta(startTime, endTime)
      const updated = await this.shiftsRepo.update(id, {
        ...dto,
        isOvernight,
        totalHours,
      })
      return updated!
    }

    const updated = await this.shiftsRepo.update(id, dto)
    return updated!
  }

  // ─── DELETE ─────────────────────────────────────────────────────────

  async delete(id: number): Promise<void> {
    await this.findById(id)

    const todayStr = this.todayStr()
    const futureCount = await this.assignmentsRepo.countFutureByShiftId(id, todayStr)
    if (futureCount > 0) {
      throw new BadRequestException(
        `Không thể xóa ca. Hiện có ${futureCount} phân ca chưa hoàn thành. Vui lòng xóa phân ca trước hoặc deactivate ca.`,
      )
    }

    await this.shiftsRepo.delete(id)
  }

  // ─── HELPERS ────────────────────────────────────────────────────────

  /**
   * Tính isOvernight và totalHours từ startTime/endTime.
   */
  calculateShiftMeta(startTime: string, endTime: string): {
    isOvernight: boolean
    totalHours: number
  } {
    const [sh, sm] = startTime.split(":").map(Number)
    const [eh, em] = endTime.split(":").map(Number)

    const startMinutes = sh * 60 + sm
    const endMinutes = eh * 60 + em

    const isOvernight = endMinutes <= startMinutes
    let diffMinutes: number

    if (isOvernight) {
      // Ca qua đêm: (24h - start) + end
      diffMinutes = 1440 - startMinutes + endMinutes
    } else {
      diffMinutes = endMinutes - startMinutes
    }

    const totalHours = Math.round((diffMinutes / 60) * 10) / 10 // 1 decimal

    return { isOvernight, totalHours }
  }

  private todayStr(): string {
    return new Date().toISOString().slice(0, 10)
  }
}
