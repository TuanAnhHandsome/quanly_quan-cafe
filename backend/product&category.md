# PRODUCT & CATEGORY MODULE — Quản lý Hàng hóa

## 1. Tổng quan

Module quản lý toàn bộ dữ liệu hàng hóa trong hệ thống quán cafe, bao gồm:
- Danh mục hàng hóa (`Category`)
- Hàng hóa (`Product`)
- Import/Export Excel
- Ảnh sản phẩm qua Cloudinary

### Hai thực thể chính

| Entity | Mô tả |
| --- | --- |
| `Category` | Danh mục sản phẩm (Cà phê, Trà, Sinh tố...) |
| `Product` | Thông tin hàng hóa: mã, tên, loại, giá, tồn kho, trạng thái |

---

## 2. Business Rules

### 2.1 Loại thực đơn (`menuType`)

Giá trị hợp lệ:
- `food` (Đồ ăn)
- `beverage` (Đồ uống)
- `other` (Khác)

### 2.2 Danh mục (`Category`)

- Tên danh mục là duy nhất.
- Danh mục có `isActive` để bật/tắt sử dụng.
- Không được xóa danh mục nếu còn sản phẩm đang thuộc danh mục đó.

### 2.3 Trạng thái hàng hóa (`status`)

Giá trị hợp lệ:
- `active` (Đang kinh doanh)
- `inactive` (Ngừng kinh doanh)

### 2.4 Mã hàng hóa (`code`)

- Mã hàng là duy nhất.
- Khi tạo sản phẩm:
1. Nếu có `code` thì dùng mã nhập tay, kiểm tra không trùng.
2. Nếu không có `code` thì tự sinh theo format `SP000001`, `SP000002`, ...

### 2.5 Giá và tồn kho

- `costPrice >= 0`
- `sellingPrice >= 0`
- `stock >= 0`
- `minStock >= 0`
- `maxStock >= 0`
- Nếu có `maxStock` thì phải thỏa:
1. `minStock <= maxStock`
2. `stock <= maxStock`

### 2.6 Ảnh sản phẩm (Cloudinary)

- Ảnh được upload lên Cloudinary, lưu `imageUrl` + `imagePublicId`.
- Khi cập nhật ảnh mới cho sản phẩm:
1. Upload ảnh mới
2. Xóa ảnh cũ (nếu có)
3. Cập nhật thông tin ảnh mới
- Khi xóa sản phẩm: nếu có `imagePublicId` thì xóa ảnh trên Cloudinary.

### 2.7 Import Excel

- Hệ thống hỗ trợ parse + validate dữ liệu trước khi import.
- Import theo cơ chế partial success:
1. Dòng hợp lệ được insert
2. Dòng lỗi trả về danh sách lỗi
- Cột Excel hỗ trợ:
1. Mã hàng
2. Tên hàng
3. Loại thực đơn
4. Danh mục
5. Giá vốn
6. Giá bán
7. Tồn kho
8. Trạng thái

### 2.8 Export Excel

- Export toàn bộ sản phẩm hiện có trong DB.
- Chuyển enum nội bộ sang nhãn tiếng Việt khi xuất file.

---

## 3. Permissions

| Permission | Roles | Mô tả |
| --- | --- | --- |
| `product:view` | Tất cả 5 roles | Xem danh sách/chi tiết sản phẩm và danh mục |
| `product:manage` | Admin, Manager | Thêm/sửa/xóa sản phẩm, danh mục, import/export |

---

## 4. API Endpoints

### 4.1 Categories — `/api/v1/categories`

| Method | Path | Permission | Mô tả |
| --- | --- | --- | --- |
| GET | `/` | `product:view` | Danh sách danh mục active |
| GET | `/all` | `product:manage` | Tất cả danh mục (kể cả inactive) |
| GET | `/:id` | `product:view` | Chi tiết danh mục |
| POST | `/` | `product:manage` | Tạo danh mục |
| PATCH | `/:id` | `product:manage` | Cập nhật danh mục |
| DELETE | `/:id` | `product:manage` | Xóa danh mục |

### 4.2 Products — `/api/v1/products`

| Method | Path | Permission | Mô tả |
| --- | --- | --- | --- |
| GET | `/` | `product:view` | Danh sách sản phẩm (search/filter/pagination) |
| GET | `/:id` | `product:view` | Chi tiết sản phẩm |
| POST | `/` | `product:manage` | Tạo sản phẩm (hỗ trợ upload ảnh) |
| PATCH | `/:id` | `product:manage` | Cập nhật sản phẩm (hỗ trợ upload ảnh) |
| DELETE | `/:id` | `product:manage` | Xóa sản phẩm |
| GET | `/template/excel` | `product:manage` | Tải file mẫu import |
| POST | `/import/excel` | `product:manage` | Import Excel |
| GET | `/export/excel` | `product:manage` | Export Excel |

---

## 5. Query & Filter danh sách sản phẩm

`GET /products` hỗ trợ:
- `search`: tìm theo `name` hoặc `code`
- `menuType`: lọc theo loại thực đơn
- `categoryId`: lọc theo danh mục
- `status`: lọc theo trạng thái
- `page`: trang hiện tại (default: 1)
- `limit`: số bản ghi/trang (default: 20)

Response trả về dạng phân trang:
- `data`
- `total`
- `page`
- `limit`
- `totalPages`

---

## 6. Cấu trúc thư mục

```text
src/products/
├── entities/
│   ├── category.entity.ts
│   └── product.entity.ts
├── dto/
│   ├── create-category.dto.ts
│   ├── update-category.dto.ts
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── query-product.dto.ts
├── repositories/
│   ├── categories.repository.ts
│   └── products.repository.ts
├── services/
│   ├── categories.service.ts
│   ├── products.service.ts
│   ├── cloudinary.service.ts
│   └── excel.service.ts
├── categories.controller.ts
├── products.controller.ts
└── products.module.ts
```

---

## 7. Validation & Error Handling

Các lỗi nghiệp vụ chính:
- Trùng mã sản phẩm → `409 Conflict`
- Trùng tên danh mục → `409 Conflict`
- Danh mục không tồn tại khi tạo/sửa sản phẩm → `400 Bad Request`
- Xóa danh mục có sản phẩm ràng buộc → `400 Bad Request`
- Giá/tồn kho âm hoặc vi phạm min-max → `400 Bad Request`
- Không tìm thấy sản phẩm/danh mục theo id → `404 Not Found`

---

## 8. Seed liên quan

Permission cần có trong seed:
- `product:view`
- `product:manage`

Role mapping:
- `product:view`: Admin, Manager, Cashier, Staff, Barista
- `product:manage`: Admin, Manager
