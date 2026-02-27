# Backend - Quản Lý Quán Cafe

NestJS + TypeORM + MySQL

---

## 1. Cài đặt

```bash
npm install
```

## 2. Cấu hình môi trường

Sao chép `.env.example` thành `.env` và điền đầy đủ thông tin:

```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=quanly_quan_cafe

# JWT - Access Token (secret tùy ý, VD: uuid)
JWT_ACCESS_SECRET=fdddeb31-0f51-4d60-976d-f1cd1b93ab98
JWT_ACCESS_EXPIRES_IN=15m

NODE_ENV=development
CLIENT_DOMAIN_DEV=http://localhost:5173
```

## 3. Tạo database

Tạo database MySQL với tên trùng với `DB_NAME`:

```sql
CREATE DATABASE quanly_quan_cafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Bảng sẽ tự được tạo nhờ `synchronize: true` khi chạy server lần đầu.

## 4. Seed admin test

Sau khi server chạy lần đầu (để các bảng được tạo), chạy lệnh này để tạo tài khoản admin mẫu:

```bash
npm run seed:admin
```

**Tài khoản admin test:**

| Field    | Value              |
| -------- | ------------------ |
| Email    | `admin@gmail.com`  |
| Password | `12345678`         |
| Role     | `admin`            |
| isActive | `true`             |

## 5. Chạy server

```bash
# Development (auto-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server khởi động tại `http://localhost:8080`

---

## API Authentication

> Tất cả token được lưu trong HTTP-only cookie, client không cần xử lý thủ công.
> Frontend chỉ cần đảm bảo gửi request với `credentials: 'include'` (fetch) hoặc `withCredentials: true` (axios).

Base URL: `http://localhost:8080/api/v1`

### POST `/auth/login`

Đăng nhập và nhận cookie chứa access_token + refresh_token.

**Request body:**
```json
{
  "email": "admin@gmail.com",
  "password": "12345678"
}
```

**Response `200 OK`:**
```json
{
  "user": {
    "id": 1,
    "fullName": "Administrator",
    "email": "admin@gmail.com",
    "role": "admin"
  }
}
```

**Cookie được set:**
- `access_token` — JWT, httpOnly, 15 phút
- `refresh_token` — opaque token, httpOnly, 7 ngày

### POST `/auth/refresh`

Tự động đọc refresh_token từ cookie, trả về access_token mới (cookie được rotate).

**Request body:** không cần

**Response `200 OK`:**
```json
{
  "message": "Token refreshed"
}
```

### POST `/auth/logout`

Revoke session thiết bị hiện tại, xóa cookie.

**Response `200 OK`:**
```json
{
  "message": "Logged out successfully"
}
```

### POST `/auth/logout-all`

Revoke toàn bộ sessions trên mọi thiết bị. **Yêu cầu đã đăng nhập** (cần access_token cookie hợp lệ).

**Response `200 OK`:**
```json
{
  "message": "Logged out from all devices"
}
```

---

## Lưu ý cho Frontend

### Axios
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true, // Bắt buộc để gửi/nhận cookie
})

// Login
const { data } = await api.post('/auth/login', {
  email: 'admin@gmail.com',
  password: '12345678',
})
console.log(data.user) // { id, fullName, email, role }

// Gọi API bảo vệ (cookie tự gửi kèm)
const users = await api.get('/users')

// Khi nhận 401 → gọi refresh
await api.post('/auth/refresh')
// Sau đó retry request ban đầu
```

### Swagger

Truy cập `http://localhost:8080/api` để xem tài liệu API tự động.
 
