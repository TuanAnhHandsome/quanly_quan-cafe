import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Order } from "./order.entity"

// ─── ENUMS ──────────────────────────────────────────────────────────

export enum OrderItemStatus {
  /** Mới thêm, chưa gửi bar */
  NEW = "new",
  /** Đã gửi bar / bếp */
  SENT = "sent",
  /** Đã hoàn thành pha chế */
  DONE = "done",
  /** Bị hủy */
  CANCELLED = "cancelled",
}

// ─── ENTITY ─────────────────────────────────────────────────────────

@Entity("order_items")
@Index("idx_oi_order", ["orderId"])
@Index("idx_oi_product", ["productId"])
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "order_id", type: "int" })
  orderId: number

  @Column({ name: "product_id", type: "int" })
  productId: number

  /** Tên sản phẩm snapshot — phòng trường hợp product bị đổi tên sau */
  @Column({ name: "product_name", type: "varchar", length: 200 })
  productName: string

  /** Giá chốt tại lúc gọi món — KHÔNG dùng giá hiện tại khi thanh toán */
  @Column({ name: "unit_price", type: "decimal", precision: 12, scale: 0 })
  unitPrice: number

  @Column({ type: "int" })
  quantity: number

  /** quantity × unitPrice */
  @Column({ name: "line_total", type: "decimal", precision: 12, scale: 0 })
  lineTotal: number

  /** Ghi chú (ít đá, không đường...) */
  @Column({ type: "varchar", length: 500, nullable: true })
  note?: string

  @Column({
    type: "enum",
    enum: OrderItemStatus,
    default: OrderItemStatus.NEW,
  })
  status: OrderItemStatus

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  // ─── RELATIONS ──────────────────────────────────────────────

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order
}
