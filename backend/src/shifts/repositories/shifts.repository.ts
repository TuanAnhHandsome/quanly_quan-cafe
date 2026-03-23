import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Shift } from "../entities/shift.entity"
import { CreateShiftDto } from "../dto/create-shift.dto"
import { UpdateShiftDto } from "../dto/update-shift.dto"

@Injectable()
export class ShiftsRepository {
  constructor(
    @InjectRepository(Shift)
    private readonly repo: Repository<Shift>,
  ) {}

  async findAll(onlyActive = false): Promise<Shift[]> {
    const where = onlyActive ? { isActive: true } : {}
    return await this.repo.find({ where, order: { startTime: "ASC" } })
  }

  async findById(id: number): Promise<Shift | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByName(name: string): Promise<Shift | null> {
    return await this.repo.findOne({ where: { name } })
  }

  async create(dto: CreateShiftDto & { isOvernight: boolean; totalHours: number }): Promise<Shift> {
    const shift = this.repo.create(dto)
    return await this.repo.save(shift)
  }

  async update(
    id: number,
    data: Partial<Shift>,
  ): Promise<Shift | null> {
    await this.repo.update(id, data)
    return await this.repo.findOne({ where: { id } })
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id)
  }
}
