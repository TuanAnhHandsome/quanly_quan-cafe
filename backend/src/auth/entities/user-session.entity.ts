import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

/**
 * Lưu refresh token (dạng hash SHA-256) theo từng thiết bị của user.
 * Mỗi user chỉ có tối đa 1 session trên 1 device (uq_sessions_user_device).
 *
 * MySQL equivalent của migration 002 (SQL Server → MySQL):
 *  - DATETIME2       → datetime
 *  - BIT             → boolean (tinyint(1))
 *  - NVARCHAR        → varchar (utf8mb4)
 *  - IDENTITY(1,1)   → AUTO_INCREMENT (@PrimaryGeneratedColumn)
 *  - Partial index (WHERE is_revoked = 0) không được MySQL hỗ trợ
 *    → thay bằng index thường trên expires_at
 */
@Entity("user_sessions")
@Unique("uq_sessions_user_device", ["userId", "deviceId"])
@Index("idx_sessions_user_id", ["userId"])
@Index("idx_sessions_expires", ["expiresAt"])
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "user_id", type: "int" })
  userId: number

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User

  /** SHA-256 hex hash (64 chars) của refresh token gốc */
  @Index("idx_sessions_token", { unique: true })
  @Column({ name: "refresh_token_hash", type: "varchar", length: 64 })
  refreshTokenHash: string

  @Column({ name: "device_id", type: "varchar", length: 100 })
  deviceId: string

  @Column({ name: "device_name", type: "varchar", length: 200, nullable: true })
  deviceName?: string

  @Column({ name: "user_agent", type: "varchar", length: 500, nullable: true })
  userAgent?: string

  @Column({ name: "ip_address", type: "varchar", length: 45, nullable: true })
  ipAddress?: string

  @Column({ name: "is_revoked", type: "boolean", default: false })
  isRevoked: boolean

  @Column({ name: "expires_at", type: "datetime" })
  expiresAt: Date

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date

  @Column({
    name: "last_used_at",
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  lastUsedAt: Date
}
