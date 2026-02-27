import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Check,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm"

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = "cashier",
  STAFF = "staff",
  BARISTA = "barista",
}

@Entity("users")
@Check(`"role" IN ('admin', 'manager', 'cashier', 'staff', 'barista')`) // Ràng buộc giá trị của cột role phải nằm trong danh sách các giá trị hợp lệ
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "full_name", type: "varchar", length: 100 })
  fullName: string

  @Column({ type: "varchar", length: 100, unique: true })
  email: string

  @Column({ type: "varchar", length: 15, nullable: true })
  phone?: string

  @Column({ name: "password", type: "varchar", length: 255 })
  password: string

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole

  @Column({ name: "token_version", type: "int", default: 0 })
  tokenVersion: number

  @Column({ name: "is_active", type: "boolean", default: false })
  isActive: boolean

  @Column({ name: "last_login_at", type: "datetime", nullable: true })
  lastLoginAt?: Date

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date
}
