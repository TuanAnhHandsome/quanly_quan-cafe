import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Payment } from "../entities/payment.entity"

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
  ) {}

  async findByOrderId(orderId: number): Promise<Payment | null> {
    return await this.repo.findOne({ where: { orderId } })
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const entity = this.repo.create(data)
    return await this.repo.save(entity)
  }

  async update(id: number, data: Partial<Payment>): Promise<void> {
    await this.repo.update(id, data)
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id)
  }
}
