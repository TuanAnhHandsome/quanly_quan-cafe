import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Category } from "./entities/category.entity"
import { Product } from "./entities/product.entity"
import { CategoriesRepository } from "./repositories/categories.repository"
import { ProductsRepository } from "./repositories/products.repository"
import { CategoriesService } from "./services/categories.service"
import { ProductsService } from "./services/products.service"
import { CloudinaryService } from "./services/cloudinary.service"
import { ExcelService } from "./services/excel.service"
import { CategoriesController } from "./categories.controller"
import { ProductsController } from "./products.controller"

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product])],
  controllers: [CategoriesController, ProductsController],
  providers: [
    CategoriesRepository,
    ProductsRepository,
    CategoriesService,
    ProductsService,
    CloudinaryService,
    ExcelService,
  ],
  exports: [ProductsService, CategoriesService],
})
export class ProductsModule {}
