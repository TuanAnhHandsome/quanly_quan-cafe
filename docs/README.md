# Documentation 
User: Phân tích cho tôi về nghiệp vụ của 5 role mà bạn đã chia

GitHub Copilot: # Phân Tích Nghiệp Vụ 5 Role trong Hệ Thống Quản Lý Quán Cafe

---

## 1. 👑 Admin

### Chân dung
> Chủ quán hoặc người được chủ quán ủy quyền toàn bộ hệ thống

### Trách nhiệm nghiệp vụ
```
Chiến lược                    Vận hành                    Hệ thống
─────────────────────         ─────────────────────       ─────────────────────
✓ Xem báo cáo tổng hợp        ✓ Quản lý toàn bộ menu      ✓ Tạo/khóa tài khoản
✓ Phân tích doanh thu          ✓ Duyệt khuyến mãi          ✓ Phân quyền nhân viên
✓ Xem lợi nhuận theo           ✓ Cấu hình giá bán          ✓ Xem audit log
  ngày/tuần/tháng              ✓ Quản lý kho nguyên         ✓ Cấu hình hệ thống
✓ Export báo cáo Excel           liệu                       ✓ Backup/restore data
```

### Quyền đặc biệt mà chỉ Admin có
| Quyền | Lý do chỉ Admin |
|-------|----------------|
| `user:manage` | Tạo, sửa, khóa tài khoản nhân viên — ảnh hưởng bảo mật toàn hệ thống |
| `system:config` | Thay đổi cấu hình giá, thuế, in hóa đơn |
| `report:export` | Dữ liệu tài chính nhạy cảm |
| `admin:revoke_token` | Thu hồi token nhân viên khi sa thải khẩn cấp |

### Tình huống thực tế
```
Tình huống: Nhân viên thu ngân vừa bị sa thải
─────────────────────────────────────────────
Admin thao tác:
  1. Khóa tài khoản → is_active = 0
  2. Thu hồi tất cả token → token_version tăng
  3. Xem auth_log kiểm tra hành vi trước khi sa thải
  → Nhân viên bị đăng xuất tức thì trên mọi thiết bị
```

---

## 2. 📊 Manager (Quản lý ca)

### Chân dung
> Trưởng ca / Quản lý cửa hàng — điều hành hoạt động hàng ngày, **không** có quyền cấu hình hệ thống

### Trách nhiệm nghiệp vụ
```
Nhân sự ca làm              Menu & Giá                  Báo cáo ca
─────────────────────       ─────────────────────       ─────────────────────
✓ Phân ca nhân viên         ✓ Bật/tắt món hết           ✓ Xem doanh thu ca
✓ Xem lịch làm việc           nguyên liệu               ✓ Đối soát cuối ca
✓ Ghi chú sự cố ca          ✓ Cập nhật giá theo         ✓ Báo cáo tồn kho
✓ Điều phối nhân sự           chương trình               ✓ Thống kê món bán chạy
  khi bận đột xuất          ✓ Thêm món mới (tạm         ✓ Kiểm tra đơn bị hủy
                               thời, chờ Admin duyệt)
```

### Ranh giới với Admin
```
Manager CÓ THỂ                        Manager KHÔNG THỂ
──────────────────────────────         ──────────────────────────────
✓ Xem danh sách nhân viên             ✗ Tạo/xóa tài khoản nhân viên
✓ Xem báo cáo doanh thu ca            ✗ Xem báo cáo tài chính tổng
✓ Tắt món hết hàng                    ✗ Thay đổi cấu hình hệ thống
✓ Xem log đơn hàng bị hủy            ✗ Export báo cáo tài chính
✓ Quản lý kho ca làm việc             ✗ Chỉnh sửa quyền nhân viên
```

### Tình huống thực tế
```
Tình huống: Ca chiều thiếu nhân viên, khách đông
────────────────────────────────────────────────
Manager thao tác:
  1. Xem sơ đồ bàn → Bàn 80% đầy
  2. Điều phối thêm Barista hỗ trợ phục vụ
  3. Tắt 3 món phức tạp để giảm tải
  4. Ghi nhận sự cố vào log ca
```

---

## 3. 💰 Cashier (Thu ngân)

### Chân dung
> Nhân viên tại quầy thanh toán — xử lý **toàn bộ giao dịch tài chính** nhưng không chạm vào cấu hình

### Trách nhiệm nghiệp vụ
```
Đơn hàng                    Thanh toán                  Khách hàng
─────────────────────       ─────────────────────       ─────────────────────
✓ Tạo đơn mới               ✓ Xử lý thanh toán          ✓ Tra cứu thành viên
✓ Sửa đơn chưa thanh          tiền mặt                  ✓ Cộng/trừ điểm
  toán                      ✓ Thanh toán QR/            ✓ Áp dụng voucher
✓ Hủy đơn (có lý do)          chuyển khoản              ✓ Đăng ký thành viên mới
✓ Gộp/tách bàn              ✓ In hóa đơn
✓ Xem tất cả đơn            ✓ Xử lý hoàn tiền
  đang mở                     (cần Manager duyệt)
```

### Điểm nhạy cảm nghiệp vụ
```
⚠️  Rủi ro gian lận cần kiểm soát:
────────────────────────────────────────────────────────
  Hủy đơn sau thanh toán  → Cần Manager duyệt + ghi log
  Giảm giá thủ công       → Chỉ được dùng voucher có sẵn
  Hoàn tiền mặt           → Cần Manager xác nhận
  Không in hóa đơn        → Hệ thống bắt buộc in/gửi
  
→ Mọi giao dịch Cashier đều ghi vào audit log
```

### Tình huống thực tế
```
Tình huống: Khách trả tiền thừa, yêu cầu tiền thối
────────────────────────────────────────────────────
Cashier thao tác:
  1. Tạo đơn từ order của Staff
  2. Nhập số tiền khách đưa → Hệ thống tính tiền thối
  3. Áp điểm thành viên nếu có
  4. Chọn phương thức: Tiền mặt
  5. In hóa đơn → Đơn chuyển trạng thái "done"
  6. Bàn tự động → "available"
```

---

## 4. 🛎️ Staff (Nhân viên phục vụ)

### Chân dung
> Nhân viên tại bàn — **giao tiếp trực tiếp với khách**, ghi nhận order, không xử lý tiền

### Trách nhiệm nghiệp vụ
```
Phục vụ bàn                 Order                       Hỗ trợ
─────────────────────       ─────────────────────       ─────────────────────
✓ Xem sơ đồ bàn             ✓ Tạo order mới             ✓ Thông báo món sắp hết
✓ Cập nhật trạng thái       ✓ Thêm/bớt món trong        ✓ Ghi chú yêu cầu đặc
  bàn (occupied/              order chưa gửi bếp           biệt của khách
  available)                ✓ Gửi order xuống bếp/      ✓ Thông báo khách cần
✓ Nhận bàn mới                bar                          hỗ trợ
✓ Setup bàn cho             ✓ Xem trạng thái món         
  khách đặt trước             đang pha chế              
```

### Giới hạn có chủ đích
```
Staff KHÔNG được:                     Lý do nghiệp vụ
──────────────────────────────         ──────────────────────────────────────
✗ Xử lý thanh toán                    Tách biệt người order và người thu tiền
                                       → Chống gian lận nội bộ
✗ Hủy order đã gửi bếp               Tránh nhầm lẫn làm lãng phí nguyên liệu
                                       → Cần Manager/Cashier confirm
✗ Xem giá vốn / doanh thu            Thông tin tài chính nhạy cảm
✗ Sửa menu                            Chỉ thực hiện theo menu đã được duyệt
```

### Tình huống thực tế
```
Tình huống: Khách bàn 5 gọi thêm đồ
─────────────────────────────────────
Staff thao tác:
  1. Mở app → Chọn Bàn 5 (đang occupied)
  2. Thêm món vào order đang mở
  3. Ghi chú: "Cà phê ít đường, thêm đá"
  4. Gửi order → Barista nhận ngay
  5. Khi xong: Mời khách ra quầy hoặc
     bấm "Yêu cầu thanh toán" → Cashier nhận thông báo
```

---

## 5. ☕ Barista (Pha chế)

### Chân dung
> Nhân viên pha chế — **chỉ tập trung vào sản xuất**, nhìn thấy đủ thông tin để làm việc, không hơn

### Trách nhiệm nghiệp vụ
```
Pha chế                     Kho nguyên liệu             Trạng thái
─────────────────────       ─────────────────────       ─────────────────────
✓ Xem hàng đợi order        ✓ Báo nguyên liệu           ✓ Cập nhật món "đang
✓ Xem chi tiết từng           sắp hết                     pha" / "hoàn thành"
  món cần pha               ✓ Xem tồn kho               ✓ Trả món lỗi (ghi lý do)
✓ Xem ghi chú đặc             nguyên liệu của           ✓ Xem lịch sử order
  biệt của khách              mình
✓ Sắp xếp ưu tiên           
  theo thứ tự               
```

### Thông tin Barista nhìn thấy vs không nhìn thấy
```
Barista NHÌN THẤY                     Barista KHÔNG NHÌN THẤY
──────────────────────────────         ──────────────────────────────
✓ Tên món + số lượng                  ✗ Giá tiền của từng món
✓ Ghi chú pha chế                     ✗ Tổng tiền đơn hàng
✓ Số bàn (để giao đúng)               ✗ Thông tin khách hàng
✓ Thứ tự ưu tiên                      ✗ Doanh thu / báo cáo
✓ Tồn kho nguyên liệu                 ✗ Thông tin nhân viên khác
  của bar
```

### Tình huống thực tế
```
Tình huống: Rush hour 8:00 sáng, 10 order cùng lúc
────────────────────────────────────────────────────
Barista thao tác:
  1. Màn hình hiển thị queue 10 order
  2. Filter: Ưu tiên "Take away" trước
  3. Bấm "Đang pha" → Bàn 3: 2 Cà phê sữa đá
  4. Phát hiện sữa gần hết → Bấm báo Manager
  5. Hoàn thành → Bấm "Done" → Staff nhận thông báo mang ra bàn
```

---

## 📊 Ma Trận So Sánh Tổng Hợp

```
Chức năng              Admin   Manager  Cashier  Staff   Barista
────────────────────────────────────────────────────────────────
Tạo đơn hàng             ✓       ✓        ✓        ✓       ✗
Hủy đơn hàng             ✓       ✓        ✓        ✗       ✗
Thanh toán               ✓       ✓        ✓        ✗       ✗
Xem tất cả đơn           ✓       ✓        ✓        ✗       ✓ (*)
Xem hàng đợi pha chế     ✓       ✓        ✗        ✗       ✓
Quản lý menu             ✓       ✓        ✗        ✗       ✗
Quản lý nhân viên        ✓       ✗        ✗        ✗       ✗
Báo cáo doanh thu        ✓       ✓        ✗        ✗       ✗
Quản lý kho              ✓       ✓        ✗        ✗       ✓ (**)
Cấu hình hệ thống        ✓       ✗        ✗        ✗       ✗
Phân ca làm việc         ✓       ✓        ✗        ✗       ✗

(*) Barista chỉ xem đơn liên quan đến pha chế, không thấy giá
(**) Barista chỉ xem/báo tồn kho nguyên liệu bar, không sửa
```

---

## ⚠️ Những Điểm Cần Lưu Ý Khi Implement

> **1. Cashier & Staff tách biệt hoàn toàn việc order và thanh toán**
> → Đây là nguyên tắc kiểm soát nội bộ (Internal Control) quan trọng nhất

> **2. Barista không thấy giá tiền**
> → Bảo vệ thông tin kinh doanh, Barista không cần biết để làm việc

> **3. Manager không tạo được tài khoản mới**
> → Chỉ Admin mới biết ai được vào hệ thống — tránh tạo tài khoản "ma"

> **4. Mọi hủy đơn / hoàn tiền đều cần ghi log**
> → Đây là điểm gian lận phổ biến nhất trong F&B
