# SHIFT MODULE — Quản lý Ca làm việc & Phân ca

## 1. Tổng quan

Module quản lý ca làm việc (Shifts) và phân ca cho nhân viên (Shift Assignments)
trong hệ thống quản lý quán cafe.

### Hai thực thể chính

| Entity            | Mô tả                                        |
| ----------------- | --------------------------------------------- |
| `Shift`           | Ca mẫu (template): tên, giờ bắt đầu/kết thúc |
| `ShiftAssignment` | Phân ca cụ thể: user + shift + ngày           |

---

## 2. Business Rules

### 2.1 Shift (Ca mẫu)

- **Tên ca** phải unique.
- **startTime ≠ endTime**.
- `isOvernight` tự động tính: `true` nếu `endTime <= startTime`.
- `totalHours` tự động tính (DECIMAL 4,1).
- `maxStaff` tối thiểu = 3 (1 barista + 1 cashier + 1 staff).
- Không được **sửa giờ** nếu có assignment tương lai (workDate >= today).
- Không được **xóa** nếu có assignment tương lai.

### 2.2 Shift Assignment (Phân ca)

5 validation khi tạo phân ca:
1. **User tồn tại & isActive** — nhân viên phải đang hoạt động.
2. **Ngày không phải quá khứ** — workDate >= today.
3. **Không trùng** — unique(userId, shiftId, workDate).
4. **Không vượt maxStaff** — đếm assignment hiện có < maxStaff.
5. **Không overlap giờ** — kiểm tra trùng giờ ca (bao gồm ca qua đêm, check D-1/D/D+1).

### 2.3 Cảnh báo nhân lực tối thiểu (Warnings)

Khi phân ca, hệ thống **cảnh báo** (không reject) nếu ca còn thiếu:
- Ít nhất 1 **Barista**
- Ít nhất 1 **Thu ngân (Cashier)**
- Ít nhất 1 **Nhân viên phục vụ (Staff)**

### 2.4 Phân ca hàng loạt (Bulk)

- Gửi `shiftId` + `userIds[]` + `workDates[]` → tạo cross-product.
- Partial success: bỏ qua lỗi, trả về `{ created, errors, warnings }`.

### 2.5 Đánh dấu vắng mặt

- Chỉ cho phép đổi status → `absent` với workDate <= today.
- Ngày tương lai không cho phép đánh dấu vắng.

---

## 3. Permissions

| Permission       | Roles          | Mô tả                     |
| ---------------- | -------------- | -------------------------- |
| `shift:view_own` | Tất cả 5 roles | Xem ca active + lịch cá nhân |
| `shift:view_all` | Admin, Manager | Xem tất cả phân ca, lịch tuần |
| `shift:manage`   | Admin, Manager | Tạo/sửa/xóa ca và phân ca |
| `shift:close`    | Admin, Manager | (Dành cho phase sau)       |

---

## 4. API Endpoints

### 4.1 Shifts — `/api/v1/shifts`

| Method | Path          | Permission       | Mô tả                        |
| ------ | ------------- | ---------------- | ----------------------------- |
| GET    | `/`           | `shift:view_own` | Danh sách ca active           |
| GET    | `/all`        | `shift:manage`   | Tất cả ca (cả inactive)      |
| GET    | `/:id`        | `shift:view_own` | Chi tiết 1 ca                 |
| POST   | `/`           | `shift:manage`   | Tạo ca mới                    |
| PATCH  | `/:id`        | `shift:manage`   | Cập nhật ca                   |
| DELETE | `/:id`        | `shift:manage`   | Xóa ca (nếu không có phân ca) |

### 4.2 Shift Assignments — `/api/v1/shift-assignments`

| Method | Path      | Permission       | Mô tả                       |
| ------ | --------- | ---------------- | ---------------------------- |
| GET    | `/`       | `shift:view_all` | Danh sách phân ca (filter)   |
| GET    | `/my`     | `shift:view_own` | Lịch cá nhân (by JWT sub)   |
| GET    | `/week`   | `shift:view_all` | Lịch tuần Mon–Sun grid      |
| GET    | `/:id`    | `shift:view_all` | Chi tiết phân ca             |
| POST   | `/`       | `shift:manage`   | Phân ca đơn lẻ               |
| POST   | `/bulk`   | `shift:manage`   | Phân ca hàng loạt            |
| PATCH  | `/:id`    | `shift:manage`   | Cập nhật phân ca             |
| DELETE | `/:id`    | `shift:manage`   | Xóa phân ca                  |

---

## 5. Cấu trúc thư mục

```
src/shifts/
├── entities/
│   ├── shift.entity.ts
│   └── shift-assignment.entity.ts
├── dto/
│   ├── create-shift.dto.ts
│   ├── update-shift.dto.ts
│   ├── create-shift-assignment.dto.ts
│   ├── bulk-create-shift-assignment.dto.ts
│   ├── update-shift-assignment.dto.ts
│   └── query-shift-assignment.dto.ts
├── repositories/
│   ├── shifts.repository.ts
│   └── shift-assignments.repository.ts
├── services/
│   ├── shifts.service.ts
│   └── shift-assignments.service.ts
├── shifts.controller.ts
├── shift-assignments.controller.ts
└── shifts.module.ts
```

---

## 6. Ca qua đêm (Overnight)

Ca bắt đầu buổi tối, kết thúc sáng hôm sau (VD: 22:00–06:00).

- `isOvernight = true` khi `endTime <= startTime`.
- Khi check overlap, hệ thống convert sang **absolute minute range** và check
  assignment D-1 / D / D+1 để phát hiện trùng.

---