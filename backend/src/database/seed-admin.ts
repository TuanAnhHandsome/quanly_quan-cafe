import { DataSource } from "typeorm"
import * as bcrypt from "bcrypt"
import { User, UserRole } from "../users/entities/user.entity"

/**
 * Seed admin mẫu để frontend test.
 *
 * Chạy:  npx ts-node -r tsconfig-paths/register src/database/seed-admin.ts
 *
 * Biến môi trường cần: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 * (đọc từ file .env nếu có dotenv hoặc truyền trực tiếp)
 */
async function seedAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config() // load .env

  const dataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "quanly_quan_cafe",
    entities: [User],
    synchronize: false,
  })

  await dataSource.initialize()
  console.log("✓ Database connected")

  const repo = dataSource.getRepository(User)

  const email = "admin@gmail.com"
  const existing = await repo.findOne({ where: { email } })

  if (existing) {
    console.log(`~ Admin "${email}" already exists (id=${existing.id}), skipping.`)
  } else {
    const password = await bcrypt.hash("12345678", 10)

    const admin = repo.create({
      fullName: "Administrator",
      email,
      password,
      role: UserRole.ADMIN,
      isActive: true,
      tokenVersion: 0,
    })

    await repo.save(admin)
    console.log(`✓ Admin "${email}" created successfully`)
  }

  await dataSource.destroy()
  console.log("✓ Done")
}

seedAdmin().catch((err) => {
  console.error("✗ Seed failed:", err)
  process.exit(1)
})
