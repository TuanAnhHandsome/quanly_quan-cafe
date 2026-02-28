import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { Permission } from "./permission.entity"
import { UserRole } from "../../users/entities/user.entity"

/**
 * Bảng role_permissions — mapping role → permission.
 *
 * Composite primary key: (role, permission_id)
 * MySQL không cần CHECK constraint cho role vì dùng enum type.
 */
@Entity("role_permissions")
@Index("idx_rp_role", ["role"])
export class RolePermission {
  @PrimaryColumn({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole

  @PrimaryColumn({ name: "permission_id", type: "int" })
  permissionId: number

  @ManyToOne(() => Permission, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "permission_id" })
  permission: Permission
}
