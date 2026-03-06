import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common"
import { CategoriesRepository } from "../repositories/categories.repository"
import { CreateCategoryDto } from "../dto/create-category.dto"
import { UpdateCategoryDto } from "../dto/update-category.dto"
import type { Category } from "../entities/category.entity"

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async findAll(onlyActive = false): Promise<Category[]> {
    return await this.categoriesRepo.findAll(onlyActive)
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoriesRepo.findById(id)
    if (!category) throw new NotFoundException(`Danh mục #${id} không tồn tại`)
    return category
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoriesRepo.findByName(dto.name)
    if (existing) throw new ConflictException(`Danh mục "${dto.name}" đã tồn tại`)
    return await this.categoriesRepo.create(dto)
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id)

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoriesRepo.findByName(dto.name)
      if (existing) throw new ConflictException(`Danh mục "${dto.name}" đã tồn tại`)
    }

    const updated = await this.categoriesRepo.update(id, dto)
    return updated!
  }

  async delete(id: number): Promise<void> {
    await this.findById(id)

    const productCount = await this.categoriesRepo.countProductsByCategory(id)
    if (productCount > 0) {
      throw new BadRequestException(
        `Không thể xóa danh mục. Hiện có ${productCount} sản phẩm thuộc danh mục này.`,
      )
    }

    await this.categoriesRepo.delete(id)
  }
}
