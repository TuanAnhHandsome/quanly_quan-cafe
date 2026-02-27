import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { UserSession } from "../entities/user-session.entity"

@Injectable()
export class SessionRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(UserSession)
  }

  /** Tìm session còn hiệu lực theo hash của refresh token */
  async findActiveByTokenHash(hash: string): Promise<UserSession | null> {
    return await this.repo.findOne({
      where: { refreshTokenHash: hash, isRevoked: false },
    })
  }

  /**
   * Upsert session theo (userId, deviceId).
   * Nếu đã tồn tại → cập nhật token hash, expires_at, last_used_at.
   * Nếu chưa → tạo mới.
   * Việc này cho phép user đăng nhập từ cùng 1 thiết bị mà không bị tạo session trùng lặp, đồng thời vẫn hỗ trợ nhiều thiết bị khác nhau.
   */
  async upsert(data: {
    userId: number
    refreshTokenHash: string
    deviceId: string
    deviceName?: string
    userAgent?: string
    ipAddress?: string
    expiresAt: Date
  }): Promise<UserSession> {
    const existing = await this.repo.findOne({
      where: { userId: data.userId, deviceId: data.deviceId },
    })

    if (existing) {
      existing.refreshTokenHash = data.refreshTokenHash
      existing.expiresAt = data.expiresAt
      existing.isRevoked = false
      existing.lastUsedAt = new Date()
      if (data.userAgent) existing.userAgent = data.userAgent
      if (data.ipAddress) existing.ipAddress = data.ipAddress
      return await this.repo.save(existing)
    }

    const session = this.repo.create({
      ...data,
      isRevoked: false,
      lastUsedAt: new Date(),
    })

    return await this.repo.save(session)
  }

  /** Cập nhật last_used_at sau mỗi lần refresh thành công */
  async touchLastUsed(id: number): Promise<void> {
    await this.repo.update(id, { lastUsedAt: new Date() })
  }

  /** Revoke session theo hash của refresh token */
  async revokeByTokenHash(hash: string): Promise<void> {
    await this.repo.update({ refreshTokenHash: hash }, { isRevoked: true })
  }

  /** Revoke tất cả session của user (đăng xuất toàn bộ thiết bị) */
  async revokeAllByUserId(userId: number): Promise<void> {
    await this.repo.update({ userId }, { isRevoked: true })
  }
}
