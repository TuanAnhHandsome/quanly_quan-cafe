import { ConflictException, Injectable } from "@nestjs/common"
import { CreateUserDto } from "../dto/create-user.dto"
import { UpdateUserDto } from "../dto/update-user.dto"
import { UsersRepository } from "../repositories/users.repository"
import { hashPassword } from "utils"

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.usersRepository.findOneByEmail(
      createUserDto.email
    )
    if (existingEmail) {
      throw new ConflictException("Email already exists")
    }

    createUserDto.password = hashPassword(createUserDto.password)

    return await this.usersRepository.createOne(createUserDto)
  }

  findAll() {
    return `This action returns all users`
  }

  findOne(id: number) {
    return `This action returns a #${id} user`
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
