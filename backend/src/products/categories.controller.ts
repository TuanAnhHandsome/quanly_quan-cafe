import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiCookieAuth } from "@nestjs/swagger"
import { CategoriesService } from "./services/categories.service"
import { CreateCategoryDto } from "./dto/create-category.dto"
import { UpdateCategoryDto } from "./dto/update-category.dto"
import { RequirePermissions } from "../permissions/decorators/permissions.decorator"

@ApiTags("Categories")
@ApiCookieAuth()
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ─── GET /categories ─ Danh sách danh mục (active) ────────────
  @Get()
  @RequirePermissions("product:view")
  @ApiOperation({ summary: "Danh sách danh mục (active)" })
  findAll() {
    return this.categoriesService.findAll(true)
  }

  // ─── GET /categories/all ──────────────────────────────────────
  @Get("all")
  @RequirePermissions("product:manage")
  @ApiOperation({ summary: "Tất cả danh mục (bao gồm inactive) — Admin/Manager" })
  findAllIncludingInactive() {
    return this.categoriesService.findAll(false)
  }

  // ─── GET /categories/:id ──────────────────────────────────────
  @Get(":id")
  @RequirePermissions("product:view")
  @ApiOperation({ summary: "Chi tiết danh mục" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.categoriesService.findById(id)
  }

  // ─── POST /categories ─────────────────────────────────────────
  @Post()
  @RequirePermissions("product:manage")
  @ApiOperation({ summary: "Tạo danh mục — Admin/Manager" })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto)
  }

  // ─── PATCH /categories/:id ────────────────────────────────────
  @Patch(":id")
  @RequirePermissions("product:manage")
  @ApiOperation({ summary: "Cập nhật danh mục — Admin/Manager" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto)
  }

  // ─── DELETE /categories/:id ───────────────────────────────────
  @Delete(":id")
  @RequirePermissions("product:manage")
  @ApiOperation({ summary: "Xóa danh mục — Admin/Manager" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.categoriesService.delete(id)
    return { statusCode: 200, message: `Đã xóa danh mục #${id} thành công` }
  }
}
