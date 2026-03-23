import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, Repository } from "typeorm"
import { Order, OrderStatus } from "../entities/order.entity"
import type { QueryOrderDto } from "../dto/query-order.dto"

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  // ─── QUERY ────────────────────────────────────────────────────────

  async findByQuery(query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const qb = this.repo
      .createQueryBuilder("o")
      .leftJoinAndSelect("o.items", "items")
      .orderBy("o.createdAt", "DESC")

    if (query.tableId) {
      qb.andWhere("o.table_id = :tableId", { tableId: query.tableId })
    }
    if (query.status) {
      qb.andWhere("o.status = :status", { status: query.status })
    }
    if (query.createdBy) {
      qb.andWhere("o.created_by = :createdBy", { createdBy: query.createdBy })
    }

    const total = await qb.getCount()
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findById(id: number): Promise<Order | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ["items"],
    })
  }

  /** Tìm order đang mở (pending / processing) của bàn */
  async findOpenByTable(tableId: number): Promise<Order | null> {
    return await this.repo.findOne({
      where: {
        tableId,
        status: In([OrderStatus.PENDING, OrderStatus.PROCESSING]),
      },
      relations: ["items"],
    })
  }

  async create(data: Partial<Order>): Promise<Order> {
    const entity = this.repo.create(data)
    return await this.repo.save(entity)
  }

  async save(order: Order): Promise<Order> {
    return await this.repo.save(order)
  }

  async update(id: number, data: Partial<Order>): Promise<Order | null> {
    await this.repo.update(id, data)
    return await this.findById(id)
  }
}
