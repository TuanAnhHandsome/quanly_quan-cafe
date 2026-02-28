import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { PermissionsRepository } from "../repositories/permissions.repository"
import { UserRole } from "../../users/entities/user.entity"
import { CreatePermissionDto } from "../dto/create-permission.dto"
import { UpdatePermissionDto } from "../dto/update-permission.dto"
import type { Permission } from "../entities/permission.entity"
import type { RolePermission } from "../entities/role-permission.entity"

@Injectable()
export class PermissionsService {
  /**
   * Cache in-memory: role → Set<permissionName>
   * Invalidate bằng clearCache() nếu có thay đổi role_permissions.
   */
  private cache = new Map<UserRole, Set<string>>()

  constructor(private readonly permissionsRepo: PermissionsRepository) {}

  // ─── PERMISSION CRUD ────────────────────────────────────────────────

  async findAllPermissions(): Promise<Permission[]> {
    return await this.permissionsRepo.findAllPermissions()
  }

  async findPermissionById(id: number): Promise<Permission> {
    const perm = await this.permissionsRepo.findPermissionById(id)
    if (!perm) throw new NotFoundException(`Permission #${id} not found`)
    return perm
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionsRepo.findPermissionByName(dto.name)
    if (existing) throw new ConflictException(`Permission name "${dto.name}" already exists`)
    return await this.permissionsRepo.createPermission(dto)
  }

  async updatePermission(id: number, dto: UpdatePermissionDto): Promise<Permission> {
    // kiểm tra tồn tại
    await this.findPermissionById(id)

    // kiểm tra trùng tên nếu đổi tên
    if (dto.name) {
      const existing = await this.permissionsRepo.findPermissionByName(dto.name)
      if (existing && existing.id !== id) {
        throw new ConflictException(`Permission name "${dto.name}" already exists`)
      }
    }

    const updated = await this.permissionsRepo.updatePermission(id, dto)
    // Tên permission thay đổi → clear toàn bộ cache
    if (dto.name) this.clearCache()
    return updated!
  }

  async deletePermission(id: number): Promise<void> {
    await this.findPermissionById(id)
    await this.permissionsRepo.deletePermission(id)
    // Permission bị xóa → cascade xóa role_permissions → clear cache
    this.clearCache()
  }

  // ─── ROLE-PERMISSION MANAGEMENT ─────────────────────────────────────

  async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
    return await this.permissionsRepo.findRolePermissions(role)
  }

  async getAllRolesWithPermissions(): Promise<Record<string, Permission[]>> {
    return await this.permissionsRepo.findAllRolesWithPermissions()
  }

  async syncRolePermissions(role: UserRole, permissionIds: number[]): Promise<void> {
    await this.permissionsRepo.syncRolePermissions(role, permissionIds)
    this.clearCacheForRole(role)
  }

  async assignPermissions(role: UserRole, permissionIds: number[]): Promise<void> {
    await this.permissionsRepo.assignPermissions(role, permissionIds)
    this.clearCacheForRole(role)
  }

  async revokePermissions(role: UserRole, permissionIds: number[]): Promise<void> {
    await this.permissionsRepo.revokePermissions(role, permissionIds)
    this.clearCacheForRole(role)
  }

  // ─── PERMISSION CHECK (có cache) ───────────────────────────────────

  async getPermissions(role: UserRole): Promise<Set<string>> {
    if (this.cache.has(role)) {
      return this.cache.get(role)!
    }
    const names = await this.permissionsRepo.findPermissionNamesByRole(role)
    const set = new Set(names)
    this.cache.set(role, set)
    return set
  }

  async hasAllPermissions(role: UserRole, permissions: string[]): Promise<boolean> {
    const userPerms = await this.getPermissions(role)
    return permissions.every((p) => userPerms.has(p))
  }

  async hasAnyPermission(role: UserRole, permissions: string[]): Promise<boolean> {
    const userPerms = await this.getPermissions(role)
    return permissions.some((p) => userPerms.has(p))
  }

  clearCache(): void {
    this.cache.clear()
  }

  clearCacheForRole(role: UserRole): void {
    this.cache.delete(role)
  }
}
