import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ConfigService } from "@nestjs/config"
import cookieParser from "cookie-parser"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Lấy ConfigService để truy cập biến môi trường
  const configService = app.get(ConfigService)

  const port = configService.get<number>("PORT") || 3000

  // Sử dụng cookie-parser để xử lý cookie
  app.use(cookieParser())

  // Cấu hình CORS để cho phép frontend truy cập
  app.enableCors({
    origin: configService.get("CLIENT_DOMAIN_DEV"),
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: "Content-Type, Authorization",
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Tự động chuyển đổi payload thành các DTO đã định nghĩa
    })
  ) // Sử dụng ValidationPipe để tự động validate dữ liệu đầu vào

  // Cấu hình Swagger để tạo tài liệu API
  const config = new DocumentBuilder()
    .setTitle("NestJS API")
    .setDescription("The API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config) // Tạo tài liệu API từ cấu hình
  SwaggerModule.setup("api", app, documentFactory) // Thiết lập đường dẫn để truy cập tài liệu API

  app.setGlobalPrefix("api/v1") // Thiết lập prefix cho tất cả các route

  await app.listen(port)
}
bootstrap()
