import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Category } from "../entities/category.entity"

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async findAll(onlyActive = false): Promise<Category[]> {
    const where = onlyActive ? { isActive: true } : {}
    return await this.repo.find({ where, order: { name: "ASC" } })
  }

  async findById(id: number): Promise<Category | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.repo.findOne({ where: { name } })
  }

  async create(data: Partial<Category>): Promise<Category> {
    const entity = this.repo.create(data)
    return await this.repo.save(entity)
  }

  async update(id: number, data: Partial<Category>): Promise<Category | null> {
    await this.repo.update(id, data)
    return await this.findById(id)
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id)
  }

  async countProductsByCategory(categoryId: number): Promise<number> {
    // Đếm sản phẩm thuộc danh mục (dùng khi xóa)
    const result = await this.repo.manager
      .createQueryBuilder()
      .select("COUNT(*)", "count")
      .from("products", "p")
      .where("p.category_id = :categoryId", { categoryId })
      .getRawOne()
    return parseInt(result?.count ?? "0", 10)
  }
}
