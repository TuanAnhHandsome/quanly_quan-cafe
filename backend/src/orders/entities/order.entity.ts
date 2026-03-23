import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm"
import { OrderItem } from "./order-item.entity"

// ─── ENUMS ──────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// ─── ENTITY ─────────────────────────────────────────────────────────

@Entity("orders")
@Index("idx_order_table", ["tableId"])
@Index("idx_order_status", ["status"])
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  /** Bàn đang phục vụ */
  @Column({ name: "table_id", type: "int" })
  tableId: number

  /** Nhân viên tạo order (lấy từ JWT) */
  @Column({ name: "created_by", type: "int" })
  createdBy: number

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  /** Tổng tiền tạm tính (sum of lineTotal) */
  @Column({ type: "decimal", precision: 12, scale: 0, default: 0 })
  subtotal: number

  /** Ghi chú chung cho order */
  @Column({ type: "text", nullable: true })
  note?: string

  /** Optimistic-lock version — chống conflict nhiều thiết bị */
  @Column({ type: "int", default: 1 })
  version: number

  // ─── TIMESTAMPS ─────────────────────────────────────────────

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date

  // ─── RELATIONS ──────────────────────────────────────────────

  @OneToMany(() => OrderItem, (item) => item.order, { eager: true, cascade: true })
  items: OrderItem[]
}
