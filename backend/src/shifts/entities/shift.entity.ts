import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("shifts")
export class Shift {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 100, unique: true })
  name: string

  @Column({ name: "start_time", type: "time" })
  startTime: string

  @Column({ name: "end_time", type: "time" })
  endTime: string

  /**
   * TRUE nếu ca làm qua đêm (end_time < start_time).
   * Tự động tính khi tạo/sửa.
   */
  @Column({ name: "is_overnight", type: "boolean", default: false })
  isOvernight: boolean

  /**
   * Tổng số giờ làm việc của ca (tự động tính).
   * VD: Ca 22:00–06:00 → 8.0 giờ.
   */
  @Column({ name: "total_hours", type: "decimal", precision: 4, scale: 1 })
  totalHours: number

  /**
   * Giới hạn số nhân viên tối đa trong ca.
   * Admin/Manager thiết lập. Tối thiểu = 3 (1 barista + 1 cashier + 1 staff).
   */
  @Column({ name: "max_staff", type: "int", default: 10 })
  maxStaff: number

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date
}
