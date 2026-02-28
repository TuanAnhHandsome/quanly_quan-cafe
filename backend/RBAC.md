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



IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'permissions')
BEGIN
    CREATE TABLE permissions (
        id          INT IDENTITY(1,1)   PRIMARY KEY,
        name        VARCHAR(100)        NOT NULL,
        description NVARCHAR(255),
        module      VARCHAR(50)         NOT NULL,

        CONSTRAINT uq_permissions_name UNIQUE (name),
        CONSTRAINT chk_permissions_module CHECK (
            module IN (
                'auth','user','order','payment',
                'menu','table','inventory',
                'customer','shift','report','system'
            )
        )
    );

    PRINT '✓ Table permissions created';
END
ELSE
    PRINT '~ Table permissions already exists, skipping';
GO

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'role_permissions')
BEGIN
    CREATE TABLE role_permissions (
        role            VARCHAR(20)     NOT NULL,
        permission_id   INT             NOT NULL,

        CONSTRAINT pk_role_permissions
            PRIMARY KEY (role, permission_id),
        CONSTRAINT fk_rp_permission
            FOREIGN KEY (permission_id) REFERENCES permissions(id)
            ON DELETE CASCADE,
        CONSTRAINT chk_rp_role CHECK (
            role IN ('admin','manager','cashier','staff','barista')
        )
    );

    CREATE INDEX idx_rp_role ON role_permissions(role);

    PRINT '✓ Table role_permissions created';
END
ELSE
    PRINT '~ Table role_permissions already exists, skipping';
GO


INSERT INTO permissions (name, description, module) VALUES

-- MODULE: AUTH
('auth:login',              N'Đăng nhập hệ thống',                  'auth'),
('auth:logout',             N'Đăng xuất thiết bị hiện tại',         'auth'),
('auth:logout_all',         N'Đăng xuất tất cả thiết bị',           'auth'),
('auth:view_devices',       N'Xem danh sách thiết bị đang đăng nhập','auth'),
('auth:revoke_device',      N'Thu hồi thiết bị cụ thể',             'auth'),
('auth:change_password',    N'Đổi mật khẩu',                        'auth'),

-- MODULE: USER
('user:view_list',          N'Xem danh sách nhân viên',             'user'),
('user:view_detail',        N'Xem chi tiết nhân viên',              'user'),
('user:create',             N'Tạo tài khoản nhân viên',             'user'),
('user:update',             N'Cập nhật thông tin nhân viên',        'user'),
('user:disable',            N'Khóa/mở tài khoản',                   'user'),
('user:revoke_token',       N'Thu hồi token nhân viên khẩn cấp',    'user'),
('user:view_auth_logs',     N'Xem audit log đăng nhập',             'user'),

-- MODULE: ORDER
('order:create',            N'Tạo đơn hàng mới',                    'order'),
('order:view_own',          N'Xem đơn hàng của mình',               'order'),
('order:view_all',          N'Xem tất cả đơn hàng',                 'order'),
('order:update_items',      N'Thêm/sửa món trong đơn chưa gửi',     'order'),
('order:send_to_bar',       N'Gửi đơn xuống pha chế',               'order'),
('order:cancel_pending',    N'Hủy đơn chưa pha chế',                'order'),
('order:cancel_processing', N'Hủy đơn đang pha chế (cần duyệt)',    'order'),
('order:view_queue',        N'Xem hàng đợi pha chế (barista)',       'order'),
('order:update_item_status',N'Cập nhật trạng thái từng món',         'order'),

-- MODULE: PAYMENT
('payment:process',         N'Xử lý thanh toán đơn hàng',           'payment'),
('payment:view_own',        N'Xem giao dịch của mình',              'payment'),
('payment:view_all',        N'Xem tất cả giao dịch',                'payment'),
('payment:refund',          N'Thực hiện hoàn tiền',                  'payment'),
('payment:approve_refund',  N'Duyệt yêu cầu hoàn tiền',             'payment'),

-- MODULE: MENU
('menu:view',               N'Xem thực đơn (giá)',                   'menu'),
('menu:view_barista',       N'Xem thực đơn không có giá',           'menu'),
('menu:create',             N'Thêm món mới',                         'menu'),
('menu:update',             N'Cập nhật món',                         'menu'),
('menu:toggle_available',   N'Bật/tắt trạng thái còn món',          'menu'),
('menu:delete',             N'Xóa món khỏi menu',                    'menu'),

-- MODULE: TABLE
('table:view',              N'Xem sơ đồ bàn',                       'table'),
('table:update_status',     N'Cập nhật trạng thái bàn',             'table'),
('table:manage',            N'Thêm/sửa/xóa bàn',                    'table'),

-- MODULE: INVENTORY
('inventory:view_bar',      N'Xem tồn kho nguyên liệu bar',         'inventory'),
('inventory:view_all',      N'Xem toàn bộ kho (có giá vốn)',        'inventory'),
('inventory:report_low',    N'Báo nguyên liệu sắp hết',             'inventory'),
('inventory:update',        N'Cập nhật số lượng tồn kho',           'inventory'),
('inventory:import',        N'Nhập kho',                             'inventory'),

-- MODULE: CUSTOMER
('customer:view',           N'Tra cứu khách hàng thành viên',       'customer'),
('customer:create',         N'Đăng ký thành viên mới',              'customer'),
('customer:update_points',  N'Cộng/trừ điểm thành viên',            'customer'),
('customer:manage',         N'Quản lý đầy đủ khách hàng',           'customer'),

-- MODULE: SHIFT
('shift:view_own',          N'Xem ca làm việc của mình',            'shift'),
('shift:view_all',          N'Xem tất cả ca làm việc',              'shift'),
('shift:manage',            N'Tạo/phân ca làm việc',                'shift'),
('shift:close',             N'Đóng ca, tổng hợp doanh thu',         'shift'),

-- MODULE: REPORT
('report:view_shift',       N'Xem báo cáo ca',                      'report'),
('report:view_daily',       N'Xem báo cáo ngày',                    'report'),
('report:view_full',        N'Xem báo cáo đầy đủ (tháng/năm)',      'report'),
('report:export',           N'Xuất báo cáo Excel/PDF',              'report'),
('report:view_cost',        N'Xem giá vốn và lợi nhuận',            'report'),

-- MODULE: SYSTEM
('system:config',           N'Cấu hình hệ thống',                   'system'),
('system:view_logs',        N'Xem system logs',                      'system');
GO

PRINT CONCAT('✓ Inserted ', @@ROWCOUNT, ' permissions');
GO

-- -------------------------------------------------------
-- MAPPING ROLE → PERMISSIONS
-- -------------------------------------------------------
INSERT INTO role_permissions (role, permission_id)
SELECT role, p.id FROM permissions p
CROSS JOIN (VALUES
-- ════════════════════════════
-- ADMIN: Toàn quyền
-- ════════════════════════════
    ('admin')
) AS roles(role)
WHERE p.name IN (
    'auth:login','auth:logout','auth:logout_all',
    'auth:view_devices','auth:revoke_device','auth:change_password',
    'user:view_list','user:view_detail','user:create',
    'user:update','user:disable','user:revoke_token','user:view_auth_logs',
    'order:create','order:view_own','order:view_all',
    'order:update_items','order:send_to_bar',
    'order:cancel_pending','order:cancel_processing',
    'order:view_queue','order:update_item_status',
    'payment:process','payment:view_own','payment:view_all',
    'payment:refund','payment:approve_refund',
    'menu:view','menu:view_barista','menu:create',
    'menu:update','menu:toggle_available','menu:delete',
    'table:view','table:update_status','table:manage',
    'inventory:view_bar','inventory:view_all','inventory:report_low',
    'inventory:update','inventory:import',
    'customer:view','customer:create',
    'customer:update_points','customer:manage',
    'shift:view_own','shift:view_all','shift:manage','shift:close',
    'report:view_shift','report:view_daily',
    'report:view_full','report:export','report:view_cost',
    'system:config','system:view_logs'
);
GO

INSERT INTO role_permissions (role, permission_id)
SELECT role, p.id FROM permissions p
CROSS JOIN (VALUES ('manager')) AS roles(role)
WHERE p.name IN (
-- ════════════════════════════
-- MANAGER: Điều hành, không cấu hình hệ thống
-- ════════════════════════════
    'auth:login','auth:logout','auth:logout_all',
    'auth:view_devices','auth:revoke_device','auth:change_password',
    'user:view_list','user:view_detail',        -- Xem nhân viên, KHÔNG tạo/xóa
    'order:create','order:view_own','order:view_all',
    'order:update_items','order:send_to_bar',
    'order:cancel_pending','order:cancel_processing',   -- Được hủy cả đơn đang pha
    'order:view_queue','order:update_item_status',
    'payment:process','payment:view_own','payment:view_all',
    'payment:refund','payment:approve_refund',           -- Được duyệt hoàn tiền
    'menu:view','menu:create','menu:update',
    'menu:toggle_available',                             -- KHÔNG xóa món
    'table:view','table:update_status','table:manage',
    'inventory:view_all','inventory:report_low',
    'inventory:update','inventory:import',
    'customer:view','customer:create',
    'customer:update_points','customer:manage',
    'shift:view_own','shift:view_all','shift:manage','shift:close',
    'report:view_shift','report:view_daily',
    'report:view_full','report:export','report:view_cost'
    -- KHÔNG có: user:create/disable/revoke, menu:delete, system:*
);
GO

INSERT INTO role_permissions (role, permission_id)
SELECT role, p.id FROM permissions p
CROSS JOIN (VALUES ('cashier')) AS roles(role)
WHERE p.name IN (
-- ════════════════════════════
-- CASHIER: Thanh toán + Tạo đơn, KHÔNG quản lý
-- ════════════════════════════
    'auth:login','auth:logout','auth:logout_all',
    'auth:view_devices','auth:revoke_device','auth:change_password',
    'order:create','order:view_own','order:view_all',
    'order:update_items','order:send_to_bar',
    'order:cancel_pending',                     -- KHÔNG hủy đơn đang pha
    'payment:process','payment:view_own',
    'payment:refund',                           -- Thực hiện hoàn tiền (Manager duyệt)
    'menu:view',                                -- Xem giá để tạo đơn
    'table:view','table:update_status',
    'customer:view','customer:create','customer:update_points',
    'shift:view_own'
    -- KHÔNG có: order:cancel_processing, payment:approve_refund
    -- KHÔNG có: menu:*, inventory:*, report:*, system:*
);
GO

INSERT INTO role_permissions (role, permission_id)
SELECT role, p.id FROM permissions p
CROSS JOIN (VALUES ('staff')) AS roles(role)
WHERE p.name IN (
-- ════════════════════════════
-- STAFF: Phục vụ bàn, tạo order, KHÔNG đụng tiền
-- ════════════════════════════
    'auth:login','auth:logout','auth:logout_all',
    'auth:view_devices','auth:revoke_device','auth:change_password',
    'order:create','order:view_own',
    'order:update_items',                       -- Thêm/sửa khi chưa gửi bếp
    'order:send_to_bar',                        -- Gửi bếp/bar
    -- KHÔNG có: order:cancel_*, order:view_all
    'menu:view',
    'table:view','table:update_status',
    'customer:view',                            -- Tra cứu thành viên
    'shift:view_own'
    -- KHÔNG có: payment:*, inventory:*, report:*, system:*
);
GO

INSERT INTO role_permissions (role, permission_id)
SELECT role, p.id FROM permissions p
CROSS JOIN (VALUES ('barista')) AS roles(role)
WHERE p.name IN (
-- ════════════════════════════
-- BARISTA: Pha chế, chỉ thấy những gì cần để làm việc
-- ════════════════════════════
    'auth:login','auth:logout','auth:logout_all',
    'auth:view_devices','auth:revoke_device','auth:change_password',
    'order:view_queue',                         -- Xem hàng đợi
    'order:update_item_status',                 -- Cập nhật đang pha / xong
    'menu:view_barista',                        -- Xem menu KHÔNG có giá
    'inventory:view_bar',                       -- Xem kho nguyên liệu bar
    'inventory:report_low',                     -- Báo hết nguyên liệu
    'shift:view_own'
    -- KHÔNG có: order:view_all, payment:*, menu:view (có giá)
    -- KHÔNG có: customer:*, report:*, system:*
);
GO

PRINT '✓ Role permissions seeded successfully';
GO