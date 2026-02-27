import { NotAcceptableException } from "@nestjs/common"
import * as bcrypt from "bcrypt"

export const hashPassword = (password: string): string => {
  try {
    return bcrypt.hashSync(password, 10)
  } catch (error) {
    throw new NotAcceptableException(error)
  }
}

export const comparePassword = (
  plainPassword: string,
  hashedPassword: string
): boolean => {
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword)
  } catch (error) {
    throw new NotAcceptableException(error)
  }
}
