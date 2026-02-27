import { Injectable } from "@nestjs/common"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"
import { CreateUserDto } from "../dto/create-user.dto"
import { User } from "../entities/user.entity"

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(User)
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.repo.findOne({ where: { email } })
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async createOne(createUserDto: CreateUserDto) {
    const user = this.repo.create(createUserDto)
    const result = await this.repo.save(user)
    const { id, email, password, role, ...data } = result
    return data
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.repo.update(id, { lastLoginAt: new Date() })
  }
}
