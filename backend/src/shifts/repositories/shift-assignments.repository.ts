import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, Between } from "typeorm"
import { ShiftAssignment } from "../entities/shift-assignment.entity"
import type { QueryShiftAssignmentDto } from "../dto/query-shift-assignment.dto"

@Injectable()
export class ShiftAssignmentsRepository {
  constructor(
    @InjectRepository(ShiftAssignment)
    private readonly repo: Repository<ShiftAssignment>,
  ) {}

  async findById(id: number): Promise<ShiftAssignment | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ["user", "shift", "assignedByUser"],
    })
  }

  /**
   * Tìm assignment theo filter (startDate, endDate, userId, shiftId, status).
   */
  async findByQuery(query: QueryShiftAssignmentDto): Promise<ShiftAssignment[]> {
    const qb = this.repo
      .createQueryBuilder("sa")
      .leftJoinAndSelect("sa.user", "user")
      .leftJoinAndSelect("sa.shift", "shift")
      .leftJoinAndSelect("sa.assignedByUser", "assignedBy")
      .orderBy("sa.workDate", "ASC")
      .addOrderBy("shift.startTime", "ASC")

    if (query.startDate && query.endDate) {
      qb.andWhere("sa.work_date BETWEEN :start AND :end", {
        start: query.startDate,
        end: query.endDate,
      })
    } else if (query.startDate) {
      qb.andWhere("sa.work_date >= :start", { start: query.startDate })
    } else if (query.endDate) {
      qb.andWhere("sa.work_date <= :end", { end: query.endDate })
    }

    if (query.userId) {
      qb.andWhere("sa.user_id = :userId", { userId: query.userId })
    }
    if (query.shiftId) {
      qb.andWhere("sa.shift_id = :shiftId", { shiftId: query.shiftId })
    }
    if (query.status) {
      qb.andWhere("sa.status = :status", { status: query.status })
    }

    return await qb.getMany()
  }

  /**
   * Lấy lịch cá nhân theo userId + khoảng ngày.
   */
  async findByUser(
    userId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<ShiftAssignment[]> {
    const qb = this.repo
      .createQueryBuilder("sa")
      .leftJoinAndSelect("sa.shift", "shift")
      .where("sa.user_id = :userId", { userId })
      .orderBy("sa.workDate", "ASC")
      .addOrderBy("shift.startTime", "ASC")

    if (startDate && endDate) {
      qb.andWhere("sa.work_date BETWEEN :start AND :end", { start: startDate, end: endDate })
    } else if (startDate) {
      qb.andWhere("sa.work_date >= :start", { start: startDate })
    } else if (endDate) {
      qb.andWhere("sa.work_date <= :end", { end: endDate })
    }

    return await qb.getMany()
  }

  /**
   * Tìm tất cả assignment của 1 user trong khoảng ngày (dùng để check overlap).
   */
  async findUserAssignmentsInDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<ShiftAssignment[]> {
    return await this.repo.find({
      where: {
        userId,
        workDate: Between(startDate, endDate),
      },
      relations: ["shift"],
    })
  }

  /**
   * Đếm số assignment của 1 ca trong 1 ngày.
   */
  async countByShiftAndDate(shiftId: number, workDate: string): Promise<number> {
    return await this.repo.count({ where: { shiftId, workDate } })
  }

  /**
   * Lấy danh sách assignment của 1 ca trong 1 ngày (kèm user info để check role).
   */
  async findByShiftAndDate(shiftId: number, workDate: string): Promise<ShiftAssignment[]> {
    return await this.repo.find({
      where: { shiftId, workDate },
      relations: ["user", "shift"],
    })
  }

  /**
   * Kiểm tra trùng (userId, shiftId, workDate).
   */
  async findDuplicate(
    userId: number,
    shiftId: number,
    workDate: string,
  ): Promise<ShiftAssignment | null> {
    return await this.repo.findOne({ where: { userId, shiftId, workDate } })
  }

  async create(data: Partial<ShiftAssignment>): Promise<ShiftAssignment> {
    const entity = this.repo.create(data)
    return await this.repo.save(entity)
  }

  async update(id: number, data: Partial<ShiftAssignment>): Promise<ShiftAssignment | null> {
    await this.repo.update(id, data)
    return await this.findById(id)
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id)
  }

  /**
   * Đếm assignment tương lai theo shiftId (dùng khi xóa ca).
   */
  async countFutureByShiftId(shiftId: number, todayStr: string): Promise<number> {
    return await this.repo
      .createQueryBuilder("sa")
      .where("sa.shift_id = :shiftId", { shiftId })
      .andWhere("sa.work_date >= :today", { today: todayStr })
      .getCount()
  }
}
