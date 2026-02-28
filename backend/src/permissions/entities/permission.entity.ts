import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm"

/**
 * Bảng permissions — lưu tất cả quyền trong hệ thống.
 *
 * Chuyển từ SQL Server → MySQL:
 *  - IDENTITY(1,1) → AUTO_INCREMENT (@PrimaryGeneratedColumn)
 *  - NVARCHAR      → varchar (utf8mb4)
 *  - CHECK module   → enum
 */
export enum PermissionModule {
  AUTH = "auth",
  USER = "user",
  ORDER = "order",
  PAYMENT = "payment",
  MENU = "menu",
  TABLE = "table",
  INVENTORY = "inventory",
  CUSTOMER = "customer",
  SHIFT = "shift",
  REPORT = "report",
  SYSTEM = "system",
}

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Index("uq_permissions_name", { unique: true })
  @Column({ type: "varchar", length: 100 })
  name: string

  @Column({ type: "varchar", length: 255, nullable: true })
  description?: string

  @Column({
    type: "enum",
    enum: PermissionModule,
  })
  module: PermissionModule
}
