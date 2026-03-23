import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { OrderItem } from "../entities/order-item.entity"

@Injectable()
export class OrderItemsRepository {
  constructor(
    @InjectRepository(OrderItem)
    private readonly repo: Repository<OrderItem>,
  ) {}

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return await this.repo.find({
      where: { orderId },
      order: { createdAt: "ASC" },
    })
  }

  async createMany(items: Partial<OrderItem>[]): Promise<OrderItem[]> {
    const entities = this.repo.create(items)
    return await this.repo.save(entities)
  }

  async deleteByOrderId(orderId: number): Promise<void> {
    await this.repo.delete({ orderId })
  }
}
