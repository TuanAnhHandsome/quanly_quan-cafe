import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Category } from "./category.entity"

// ─── ENUMS ──────────────────────────────────────────────────────────

export enum MenuType {
  FOOD = "food",
  BEVERAGE = "beverage",
  OTHER = "other",
}

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

// Mapping Vietnamese ↔ Enum (dùng cho Excel import/export)
export const MENU_TYPE_LABELS: Record<MenuType, string> = {
  [MenuType.FOOD]: "Đồ ăn",
  [MenuType.BEVERAGE]: "Đồ uống",
  [MenuType.OTHER]: "Khác",
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "Đang kinh doanh",
  [ProductStatus.INACTIVE]: "Ngừng kinh doanh",
}

// ─── ENTITY ─────────────────────────────────────────────────────────

@Entity("products")
@Index("idx_product_menu_type", ["menuType"])
@Index("idx_product_status", ["status"])
@Index("idx_product_category", ["categoryId"])
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  /** Mã hàng hóa — unique, auto-generate SP000001 hoặc nhập tay */
  @Column({ type: "varchar", length: 50, unique: true })
  code: string

  @Column({ type: "varchar", length: 200 })
  name: string

  @Column({
    name: "menu_type",
    type: "enum",
    enum: MenuType,
  })
  menuType: MenuType

  @Column({ name: "category_id", type: "int" })
  categoryId: number

  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus

  /** URL ảnh từ Cloudinary */
  @Column({ name: "image_url", type: "varchar", length: 500, nullable: true })
  imageUrl?: string

  /** Cloudinary public_id — dùng để xóa ảnh */
  @Column({ name: "image_public_id", type: "varchar", length: 200, nullable: true })
  imagePublicId?: string

  // ─── GIÁ ────────────────────────────────────────────────────

  @Column({ name: "cost_price", type: "decimal", precision: 12, scale: 0, default: 0 })
  costPrice: number

  @Column({ name: "selling_price", type: "decimal", precision: 12, scale: 0, default: 0 })
  sellingPrice: number

  // ─── TỒN KHO ───────────────────────────────────────────────

  @Column({ type: "int", default: 0 })
  stock: number

  @Column({ name: "min_stock", type: "int", default: 0 })
  minStock: number

  @Column({ name: "max_stock", type: "int", default: 0 })
  maxStock: number

  // ─── TIMESTAMPS ─────────────────────────────────────────────

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date

  // ─── RELATIONS ──────────────────────────────────────────────

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: "category_id" })
  category: Category
}
