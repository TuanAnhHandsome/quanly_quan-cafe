import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, In } from "typeorm"
import { Permission } from "../entities/permission.entity"
import { RolePermission } from "../entities/role-permission.entity"
import { UserRole } from "../../users/entities/user.entity"
import { CreatePermissionDto } from "../dto/create-permission.dto"
import { UpdatePermissionDto } from "../dto/update-permission.dto"

@Injectable()
export class PermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>
  ) {}

  // ─── PERMISSION CRUD ────────────────────────────────────────────────

  async findAllPermissions(): Promise<Permission[]> {
    return await this.permRepo.find({ order: { module: "ASC", name: "ASC" } })
  }

  async findPermissionById(id: number): Promise<Permission | null> {
    return await this.permRepo.findOne({ where: { id } })
  }

  async findPermissionByName(name: string): Promise<Permission | null> {
    return await this.permRepo.findOne({ where: { name } })
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const perm = this.permRepo.create(dto)
    return await this.permRepo.save(perm)
  }

  async updatePermission(id: number, dto: UpdatePermissionDto): Promise<Permission | null> {
    await this.permRepo.update(id, dto)
    return await this.permRepo.findOne({ where: { id } })
  }

  async deletePermission(id: number): Promise<void> {
    await this.permRepo.delete(id)
  }

  // ─── ROLE-PERMISSION QUERIES ────────────────────────────────────────

  async findPermissionNamesByRole(role: UserRole): Promise<string[]> {
    const rows = await this.rpRepo.find({
      where: { role },
      relations: ["permission"],
    })
    return rows.map((rp) => rp.permission.name)
  }

  async findRolePermissions(role: UserRole): Promise<RolePermission[]> {
    return await this.rpRepo.find({
      where: { role },
      relations: ["permission"],
      order: { permissionId: "ASC" },
    })
  }

  async findAllRolesWithPermissions(): Promise<Record<string, Permission[]>> {
    const all = await this.rpRepo.find({
      relations: ["permission"],
      order: { role: "ASC" },
    })
    const result: Record<string, Permission[]> = {}
    for (const rp of all) {
      if (!result[rp.role]) result[rp.role] = []
      result[rp.role].push(rp.permission)
    }
    return result
  }

  // ─── ROLE-PERMISSION MUTATIONS ──────────────────────────────────────

  /**
   * Sync: thay thế toàn bộ permissions của role bằng danh sách mới.
   */
  async syncRolePermissions(role: UserRole, permissionIds: number[]): Promise<void> {
    // Xóa tất cả mapping cũ
    await this.rpRepo.delete({ role })

    if (permissionIds.length === 0) return

    // Tạo mapping mới
    const mappings = permissionIds.map((id) =>
      this.rpRepo.create({ role, permissionId: id })
    )
    await this.rpRepo.save(mappings)
  }

  /**
   * Assign: thêm permissions vào role (không xóa cũ).
   */
  async assignPermissions(role: UserRole, permissionIds: number[]): Promise<void> {
    for (const permissionId of permissionIds) {
      const existing = await this.rpRepo.findOne({
        where: { role, permissionId },
      })
      if (!existing) {
        await this.rpRepo.save(this.rpRepo.create({ role, permissionId }))
      }
    }
  }

  /**
   * Revoke: gỡ permissions khỏi role.
   */
  async revokePermissions(role: UserRole, permissionIds: number[]): Promise<void> {
    for (const permissionId of permissionIds) {
      await this.rpRepo.delete({ role, permissionId })
    }
  }

  // ─── PERMISSION CHECK HELPERS ───────────────────────────────────────

  async roleHasPermission(role: UserRole, permissionName: string): Promise<boolean> {
    const count = await this.rpRepo
      .createQueryBuilder("rp")
      .innerJoin("rp.permission", "p")
      .where("rp.role = :role", { role })
      .andWhere("p.name = :name", { name: permissionName })
      .getCount()
    return count > 0
  }

  async roleHasAllPermissions(role: UserRole, permissionNames: string[]): Promise<boolean> {
    const count = await this.rpRepo
      .createQueryBuilder("rp")
      .innerJoin("rp.permission", "p")
      .where("rp.role = :role", { role })
      .andWhere("p.name IN (:...names)", { names: permissionNames })
      .getCount()
    return count === permissionNames.length
  }

  async roleHasAnyPermission(role: UserRole, permissionNames: string[]): Promise<boolean> {
    const count = await this.rpRepo
      .createQueryBuilder("rp")
      .innerJoin("rp.permission", "p")
      .where("rp.role = :role", { role })
      .andWhere("p.name IN (:...names)", { names: permissionNames })
      .getCount()
    return count > 0
  }
}
