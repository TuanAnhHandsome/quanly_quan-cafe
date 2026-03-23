import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Product } from "../entities/product.entity"
import type { QueryProductDto } from "../dto/query-product.dto"

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  /**
   * Tìm sản phẩm với search, filter, phân trang.
   */
  async findByQuery(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20

    const qb = this.repo
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.category", "category")
      .orderBy("p.createdAt", "DESC")

    // Search theo tên hoặc mã
    if (query.search) {
      qb.andWhere("(p.name LIKE :search OR p.code LIKE :search)", {
        search: `%${query.search}%`,
      })
    }

    // Filter
    if (query.menuType) {
      qb.andWhere("p.menu_type = :menuType", { menuType: query.menuType })
    }
    if (query.categoryId) {
      qb.andWhere("p.category_id = :categoryId", { categoryId: query.categoryId })
    }
    if (query.status) {
      qb.andWhere("p.status = :status", { status: query.status })
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

  async findById(id: number): Promise<Product | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ["category"],
    })
  }

  async findByCode(code: string): Promise<Product | null> {
    return await this.repo.findOne({ where: { code } })
  }

  /**
   * Lấy mã SP auto-gen tiếp theo: SP000001, SP000002, ...
   */
  async getNextCode(): Promise<string> {
    const result = await this.repo
      .createQueryBuilder("p")
      .select("p.code")
      .where("p.code LIKE :prefix", { prefix: "SP%" })
      .orderBy("p.code", "DESC")
      .limit(1)
      .getOne()

    if (!result) return "SP000001"
    const num = parseInt(result.code.replace("SP", ""), 10)
    return `SP${String(num + 1).padStart(6, "0")}`
  }

  async create(data: Partial<Product>): Promise<Product> {
    const entity = this.repo.create(data)
    return await this.repo.save(entity)
  }

  async update(id: number, data: Partial<Product>): Promise<Product | null> {
    await this.repo.update(id, data)
    return await this.findById(id)
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id)
  }

  async findAll(): Promise<Product[]> {
    return await this.repo.find({
      relations: ["category"],
      order: { createdAt: "DESC" },
    })
  }
}
