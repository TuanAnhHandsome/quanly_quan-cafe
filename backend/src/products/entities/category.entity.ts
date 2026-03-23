import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 100, unique: true })
  name: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date
}
