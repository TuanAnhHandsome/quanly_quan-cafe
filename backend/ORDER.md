# ORDER MODULE — Gọi món theo bàn, treo order, thanh toán mới trừ kho

## 1. Tổng quan

Module Order quản lý toàn bộ luồng gọi món tại quán cafe theo mô hình:

- Chọn bàn
- Tạo order đang treo tại bàn
- Thêm/sửa/xóa món trong order
- Gửi món sang quầy/bar để pha chế
- Thanh toán order
- Chỉ khi thanh toán thành công mới cập nhật tồn kho

### Mục tiêu nghiệp vụ

- Mỗi bàn có thể có 0 hoặc 1 order đang mở tại cùng một thời điểm.
- Món đã gọi phải được lưu trên backend để nhiều thiết bị cùng nhìn thấy.
- Frontend chỉ hiển thị và thao tác UI; dữ liệu order phải do backend quản lý.
- Tồn kho chỉ bị trừ khi order được thanh toán thành công.

### Các thực thể chính

| Entity | Mô tả |
| --- | --- |
| `Table` | Bàn phục vụ khách |
| `Order` | Phiếu gọi món đang treo hoặc đã hoàn tất |
| `OrderItem` | Từng món trong order |
| `Payment` | Giao dịch thanh toán của order |
| `Product` | Hàng hóa được gọi món |

---

## 2. Luồng nghiệp vụ chuẩn

```text
[Frontend]                              [Backend]

1. Chọn bàn 5
2. GET /orders?tableId=5&status=pending -> Trả order đang treo ở bàn 5
                                           (nếu có thì hiển thị món đã gọi)
3. Chọn thêm món (Cà phê x2, Bánh x1)
4. POST /orders hoặc                    -> Lưu order + items vào DB
   PATCH /orders/:id/items                 (status = pending)
                                            KHÔNG trừ kho ở bước này
5. Hiển thị món treo ở bàn             <- Response: order + items

   ... khách dùng xong ...

6. Nhấn Thanh toán
7. POST /orders/:id/payment            -> Tạo payment record
                                            Trừ kho tại thời điểm thanh toán
                                            Cập nhật order status = completed
8. Hiển thị hóa đơn                    <- Response: payment + receipt
```

---

## 3. Business Rules

### 3.1 Trạng thái order

Giá trị đề xuất:

- `pending`: order đang treo tại bàn, chưa thanh toán
- `processing`: đã gửi quầy/bar, đang chuẩn bị món
- `completed`: đã thanh toán xong
- `cancelled`: order bị hủy

### 3.2 Order treo theo bàn

- Một bàn chỉ có tối đa 1 order `pending` hoặc `processing` tại cùng thời điểm.
- Khi mở bàn, frontend phải gọi API để lấy order đang treo theo `tableId`.
- Nếu chưa có order treo, frontend mới cho phép tạo order mới.
- Không được để frontend tự giữ order cục bộ mà không lưu backend.

### 3.3 Gọi món và thêm món vào bàn

- Khi người dùng chọn món, frontend phải gọi API backend để lưu thay đổi.
- Không được xử lý hoàn toàn ở frontend vì sẽ gây lệch dữ liệu giữa nhiều thiết bị.
- Có thể hỗ trợ 2 luồng:
1. `POST /orders`: tạo order mới kèm danh sách món đầu tiên
2. `PATCH /orders/:id/items`: thêm/sửa/xóa món trên order đã tồn tại

### 3.4 Tồn kho

- Ở bước gọi món: chỉ kiểm tra cảnh báo tồn thấp, chưa trừ kho.
- Ở bước thanh toán: mới thực hiện trừ kho thật.
- Nếu thanh toán thất bại hoặc rollback payment, không được trừ kho.

### 3.5 Cảnh báo tồn thấp khi gọi món

- API danh sách sản phẩm active nên trả thêm `stock` và `minStock`.
- Frontend có thể tự hiển thị dấu `!` khi `stock <= minStock`.
- Đây là cảnh báo UI, không phải cam kết còn hàng tuyệt đối.
- Khi lưu order hoặc thanh toán, backend vẫn phải validate lại dữ liệu.

### 3.6 Gửi quầy/bar

- Sau khi xác nhận món, order có thể chuyển sang trạng thái `processing`.
- Barista chỉ nhìn thấy các item đã được gửi quầy.
- Nếu có sửa món sau khi đã gửi quầy, hệ thống phải tách rõ:
1. món đã gửi trước đó
2. món mới thêm
3. món bị hủy

### 3.7 Thanh toán

- Chỉ order `pending` hoặc `processing` mới được thanh toán.
- Khi thanh toán thành công:
1. tạo bản ghi payment
2. khóa thay đổi order
3. trừ tồn kho
4. cập nhật trạng thái order thành `completed`
- Không cho sửa item sau khi order đã `completed`.

### 3.9 Phương thức thanh toán

Hệ thống hỗ trợ 3 phương thức:

| Phương thức | Enum | Mô tả |
| --- | --- | --- |
| Tiền mặt | `cash` | Thu ngân nhận tiền, tính tiền thừa |
| Chuyển khoản thủ công | `bank_transfer` | Khách chuyển khoản, thu ngân xác nhận tay |
| QR động (PayOS) | `payos_qr` | Tạo QR code theo đúng số tiền, tự xác nhận khi nhận tiền |

### 3.10 Thanh toán QR động — VietQR + PayOS

VietQR là chuẩn QR chung của Ngân hàng Nhà nước Việt Nam. PayOS là cổng thanh toán trung gian hỗ trợ tạo QR động theo chuẩn VietQR với callback tự động.

#### Luồng thanh toán QR động

```text
[Frontend]                          [Backend]                          [PayOS]

1. Nhấn "Thanh toán QR"
2. POST /orders/:id/payment      -> Validate order
   { method: "payos_qr" }           Gọi PayOS API tạo link thanh toán
                                                                    -> Trả checkoutUrl + qrCode
3. Hiển thị mã QR               <- { qrCode, checkoutUrl,
   trên màn hình thu ngân            paymentLinkId }

   ... khách quét QR, chuyển khoản ...

4.                                  Webhook nhận callback          <- PayOS gọi webhook
                                    Xác minh chữ ký (signature)
                                    Nếu success:
                                      - Cập nhật payment status
                                      - Trừ kho
                                      - Chuyển order -> completed

5. Frontend polling hoặc           <- Trả trạng thái payment
   WebSocket nhận thông báo
   Hiển thị "Thanh toán thành công"
```

#### Tại sao dùng PayOS?

- Hỗ trợ VietQR chuẩn — tương thích mọi app ngân hàng Việt Nam
- QR động theo từng giao dịch — mỗi order có 1 mã QR riêng với đúng số tiền
- Có webhook callback tự động — không cần thu ngân xác nhận tay
- Có API cancel link nếu khách đổi ý
- Miễn phí hoặc phí rất thấp cho nhận tiền

#### Thông tin cấu hình PayOS (.env)

```text
PAYOS_CLIENT_ID=xxx
PAYOS_API_KEY=xxx
PAYOS_CHECKSUM_KEY=xxx
PAYOS_WEBHOOK_URL=https://your-domain.com/api/v1/payments/webhook
```

#### Business Rules cho QR động

- Khi tạo payment `payos_qr`, backend gọi PayOS tạo payment link, lưu `paymentLinkId` vào Payment record.
- Payment record ban đầu có `paymentStatus = pending`.
- Chỉ khi webhook xác nhận thành công mới chuyển `paymentStatus = paid`, trừ kho, chuyển order sang `completed`.
- Nếu webhook báo thất bại hoặc hết hạn QR, cập nhật `paymentStatus = failed`, order giữ nguyên trạng thái.
- Frontend polling `GET /orders/:id/payment-status` mỗi 3–5s để biết kết quả, hoặc dùng WebSocket nếu có.
- Một order chỉ tạo 1 payment link tại một thời điểm. Nếu muốn tạo QR mới, phải cancel link cũ trước.
- Thu ngân có thể nhấn "Hủy QR" để cancel payment link nếu khách đổi sang tiền mặt.

### 3.8 Hủy order

- Chỉ được hủy order khi chưa thanh toán.
- Nếu order đã gửi quầy, cần rule rõ ai được hủy và có cần xác nhận hay không.
- Hủy order không làm thay đổi tồn kho nếu trước đó chưa trừ kho.

---

## 4. Ranh giới Frontend và Backend

### Frontend chịu trách nhiệm

- Hiển thị sơ đồ bàn
- Hiển thị order đang treo tại bàn
- Chọn món, tăng/giảm số lượng, nhập ghi chú
- Hiển thị cảnh báo tồn thấp bằng dấu `!`
- Gọi API tạo order, cập nhật item, gửi quầy, thanh toán

### Backend chịu trách nhiệm

- Quản lý nguồn dữ liệu order chuẩn duy nhất
- Kiểm tra bàn có hợp lệ, đang hoạt động hay không
- Kiểm tra sản phẩm có tồn tại, còn active hay không
- Kiểm soát 1 bàn chỉ có 1 order mở
- Tính giá, tổng tiền, giảm giá, phụ thu
- Tạo payment và trừ kho đúng thời điểm
- Chống xung đột khi nhiều thiết bị cùng thao tác một bàn

### Kết luận kỹ thuật

- Bước gọi món cho bàn bắt buộc cần API backend.
- Frontend không được tự xử lý order hoàn toàn cục bộ.
- Việc hiện dấu `!` có thể làm ở frontend từ dữ liệu `stock`, nhưng dữ liệu gốc vẫn phải đến từ backend.

---

## 5. API đề xuất

### 5.1 Lấy order đang treo của bàn

`GET /api/v1/orders?tableId=5&status=pending`

Mục đích:
- Lấy order hiện tại của bàn để mở lại từ bất kỳ thiết bị nào.

Response đề xuất:

```json
{
  "data": [
    {
      "id": 120,
      "tableId": 5,
      "status": "pending",
      "subtotal": 125000,
      "items": [
        {
          "id": 1,
          "productId": 10,
          "productName": "Ca phe sua",
          "quantity": 2,
          "unitPrice": 30000,
          "lineTotal": 60000,
          "note": "it da"
        }
      ]
    }
  ]
}
```

### 5.2 Tạo order mới cho bàn

`POST /api/v1/orders`

Body đề xuất:

```json
{
  "tableId": 5,
  "items": [
    {
      "productId": 10,
      "quantity": 2,
      "note": "it da"
    },
    {
      "productId": 20,
      "quantity": 1,
      "note": ""
    }
  ]
}
```

Rule:
- Nếu bàn đã có order mở thì reject hoặc trả order hiện tại để frontend chuyển sang chế độ update.

### 5.3 Cập nhật item trong order

`PATCH /api/v1/orders/:id/items`

Body đề xuất:

```json
{
  "items": [
    {
      "productId": 10,
      "quantity": 3,
      "note": "it da"
    },
    {
      "productId": 25,
      "quantity": 1,
      "note": "khong duong"
    }
  ]
}
```

Rule:
- Backend phải tính lại subtotal từ giá sản phẩm trong DB.
- Không tin giá do frontend gửi lên.

### 5.4 Gửi quầy/bar

`POST /api/v1/orders/:id/send-to-bar`

Mục đích:
- Xác nhận danh sách món chính thức được chuyển sang barista.

### 5.5 Thanh toán order (tiền mặt / chuyển khoản thủ công)

`POST /api/v1/orders/:id/payment`

Body đề xuất:

```json
{
  "method": "cash",
  "receivedAmount": 150000,
  "note": "khach dua tien mat"
}
```

Rule:
- Tạo payment
- Trừ kho trong transaction
- Chuyển order sang `completed`
- Trả dữ liệu hóa đơn để frontend in bill

### 5.7 Thanh toán QR động (PayOS)

#### 5.7.1 Tạo payment link QR

`POST /api/v1/orders/:id/payment`

Body:

```json
{
  "method": "payos_qr"
}
```

Response đề xuất:

```json
{
  "payment": {
    "id": 45,
    "orderId": 120,
    "method": "payos_qr",
    "amount": 125000,
    "paymentStatus": "pending",
    "paymentLinkId": "pl_abc123",
    "checkoutUrl": "https://pay.payos.vn/web/pl_abc123",
    "qrCode": "00020101021238..." 
  }
}
```

Rule:
- Backend gọi PayOS API `POST /v2/payment-requests` với `amount`, `orderCode`, `description`, `cancelUrl`, `returnUrl`.
- Lưu `paymentLinkId`, `checkoutUrl`, `qrCode` vào Payment record.
- CHƯA trừ kho, CHƯA chuyển order sang completed.
- Frontend nhận `qrCode` để render mã QR trên màn hình.

#### 5.7.2 Webhook nhận kết quả từ PayOS

`POST /api/v1/payments/webhook`

PayOS gửi body:

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 120,
    "amount": 125000,
    "description": "Thanh toan order #120",
    "accountNumber": "1234567890",
    "reference": "FT123456",
    "transactionDateTime": "2026-03-10 14:30:00",
    "paymentLinkId": "pl_abc123"
  },
  "signature": "sha256_hmac_string"
}
```

Rule:
- Xác minh `signature` bằng `PAYOS_CHECKSUM_KEY` (HMAC SHA256).
- Nếu `code = "00"` (thành công):
  1. Cập nhật Payment `paymentStatus = paid`, lưu `transactionRef`
  2. Trừ kho trong transaction
  3. Chuyển order sang `completed`
- Nếu thất bại: cập nhật `paymentStatus = failed`.
- Webhook endpoint phải **public** (không qua JwtAuthGuard).
- Trả `200 OK` ngay cả khi xử lý lỗi (để PayOS không retry liên tục).

#### 5.7.3 Polling trạng thái thanh toán

`GET /api/v1/orders/:id/payment-status`

Response:

```json
{
  "orderId": 120,
  "paymentStatus": "pending",
  "method": "payos_qr"
}
```

Frontend polling mỗi 3–5 giây. Khi `paymentStatus = paid` thì hiển thị thành công và in bill.

#### 5.7.4 Hủy payment link QR

`POST /api/v1/orders/:id/cancel-payment`

Rule:
- Gọi PayOS API cancel payment link.
- Cập nhật `paymentStatus = cancelled`.
- Order vẫn giữ trạng thái cũ (pending/processing), cho phép thanh toán lại bằng phương thức khác.

### 5.6 Lấy menu active để frontend cảnh báo tồn thấp

`GET /api/v1/products?status=active`

Mỗi sản phẩm nên có:
- `stock`
- `minStock`
- `status`
- `isLowStock` hoặc để frontend tự tính từ `stock <= minStock`

---

## 6. Validation & Error Handling

Các lỗi nghiệp vụ chính:

- Bàn không tồn tại hoặc đã inactive -> `404` hoặc `400`
- Bàn đã có order mở -> `409 Conflict`
- Sản phẩm không tồn tại -> `404 Not Found`
- Sản phẩm đã ngừng kinh doanh -> `400 Bad Request`
- Quantity <= 0 -> `400 Bad Request`
- Order đã completed nhưng vẫn sửa item -> `400 Bad Request`
- Thanh toán 2 lần cùng một order -> `409 Conflict`
- Tồn kho không đủ tại thời điểm thanh toán -> `400 Bad Request`

---

## 7. Các vấn đề thực tế cần giải quyết

### 7.1 Nhiều thiết bị cùng sửa một bàn

Tình huống:
- Thu ngân sửa order trên máy A
- Nhân viên phục vụ sửa cùng order trên máy B

Rủi ro:
- Ghi đè dữ liệu của nhau
- Tổng tiền sai
- Mất item vừa thêm

Hướng xử lý:
- Dùng `updatedAt` hoặc version number để phát hiện xung đột
- Backend reject nếu dữ liệu đang cũ
- Frontend reload order mới nhất khi có conflict

### 7.2 Tồn kho hiển thị còn nhưng thanh toán lại thiếu

Tình huống:
- Frontend thấy stock = 5 nên cho gọi món
- Trong lúc đó order khác đã thanh toán và trừ mất 4

Kết quả:
- Đến lúc thanh toán order hiện tại thì không đủ tồn

Hướng xử lý:
- Chấp nhận `stock` ở frontend chỉ là dữ liệu tham khảo
- Validate lại tồn kho khi thanh toán
- Nếu thiếu hàng, trả lỗi rõ món nào không đủ để nhân viên xử lý với khách

### 7.3 Giá sản phẩm thay đổi sau khi khách đã gọi món

Tình huống:
- Khách gọi món lúc 9h với giá cũ
- Quản lý sửa giá lúc 10h
- Khách thanh toán lúc 11h

Vấn đề cần chốt:
- Order giữ giá tại lúc gọi món
- Hay lấy giá mới tại lúc thanh toán

Khuyến nghị:
- Chốt `unitPrice` vào `OrderItem` ngay khi gọi món
- Thanh toán dựa trên giá đã chốt, không lấy giá hiện tại từ Product

### 7.4 Hủy món sau khi đã gửi bar

Tình huống:
- Món đã được barista pha hoặc đang pha
- Khách đổi ý muốn hủy

Vấn đề cần chốt:
- Có cho hủy không
- Ai có quyền hủy
- Có cần xác nhận từ Manager không
- Có ghi log lý do hủy không

Khuyến nghị:
- Phân biệt `cancelledBeforePrepare` và `cancelledAfterPrepare`
- Có audit log cho các món hủy sau khi đã gửi quầy

### 7.5 Tách bàn, gộp bàn, chuyển bàn

Tình huống:
- Khách đổi chỗ ngồi
- 2 bàn muốn gộp hóa đơn
- 1 bàn muốn tách 1 phần món sang bàn khác

Đây là nghiệp vụ rất phổ biến trong quán thực tế, nhưng phức tạp.

Khuyến nghị:
- Không làm ngay ở phase đầu
- Thiết kế data model để có thể mở rộng sau

### 7.6 Mất mạng hoặc refresh giữa lúc gọi món

Tình huống:
- Nhân viên đã bấm thêm món nhưng mạng chập chờn
- Không rõ backend đã lưu hay chưa

Hướng xử lý:
- API phải trả response rõ ràng
- Frontend nên disable nút trong lúc submit
- Khi có nghi ngờ, frontend reload lại order từ server thay vì tự suy đoán

### 7.7 Trạng thái bàn đồng bộ với order như thế nào

Vấn đề cần chốt:
- Bàn đang có order mở thì xem là "đang sử dụng"
- Hay chỉ là trạng thái hiển thị riêng trên UI

Khuyến nghị:
- Không lưu occupancy riêng ở phase đầu
- Frontend suy ra bàn đang có khách nếu tồn tại order `pending` hoặc `processing`

### 7.8 In bill nhiều lần

Tình huống:
- Thu ngân in lại bill cho khách
- Cần biết đây là bill gốc hay bản in lại

Khuyến nghị:
- Payment nên lưu số lần in hoặc log sự kiện in bill

### 7.9 Thanh toán QR — các tình huống đặc biệt

#### 7.9.1 Khách quét QR nhưng chuyển sai số tiền

PayOS chỉ xác nhận khi nhận đúng số tiền trong payment link. Nếu khách chuyển sai, PayOS không gửi webhook success. Thu ngân có thể:
- Chờ khách chuyển bổ sung (PayOS hỗ trợ partial → full)
- Hủy QR, chuyển sang tiền mặt

#### 7.9.2 QR hết hạn

- PayOS payment link có expiry (mặc định 15 phút, có thể cấu hình).
- Khi hết hạn, webhook báo expired → backend cập nhật `paymentStatus = expired`.
- Thu ngân tạo QR mới hoặc chuyển phương thức.

#### 7.9.3 Webhook bị miss (mạng backend lỗi)

Tình huống:
- PayOS đã nhận tiền, gọi webhook nhưng backend không nhận được.

Hướng xử lý:
- PayOS tự retry webhook nhiều lần.
- Backend có API chủ động kiểm tra: gọi PayOS `GET /v2/payment-requests/{id}` để xác minh trạng thái.
- Nên có cron job hoặc nút "Kiểm tra lại" cho thu ngân gọi API verify thủ công.

#### 7.9.4 Khách đã chuyển tiền nhưng muốn hoàn

- Hoàn tiền qua PayOS hoặc chuyển khoản thủ công — nằm ngoài scope tự động.
- Cần ghi nhận `refund` record riêng (phase sau).

#### 7.9.5 Hai thiết bị cùng tạo QR cho 1 order

- Backend chặn: nếu order đã có payment record `pending`, không cho tạo thêm.
- Thu ngân phải hủy QR cũ trước khi tạo mới.

---

## 8. Phạm vi phase đầu

Phase đầu nên làm trước:

- Tạo order theo bàn
- Lấy order treo theo bàn
- Thêm/sửa/xóa item
- Gửi quầy/bar
- Thanh toán tiền mặt / chuyển khoản thủ công
- Thanh toán QR động qua PayOS (tạo QR, webhook, polling status)
- Trừ kho tại thời điểm thanh toán (cả cash lẫn QR webhook)
- Trả stock, minStock để frontend cảnh báo tồn thấp

Chưa làm ngay ở phase đầu:

- WebSocket realtime push kết quả thanh toán QR
- Giữ hàng tạm thời theo order
- Tách bàn / gộp bàn / chuyển bàn
- Khuyến mãi phức tạp
- Split bill nhiều người trả
- Đồng bộ máy in bếp/bar nâng cao
- Hoàn tiền tự động qua PayOS

---

## 9. Kết luận

- Bước gọi món cho bàn bắt buộc cần API backend.
- Frontend chỉ dùng dữ liệu `stock`, `minStock` để hiển thị cảnh báo, không tự quyết định dữ liệu nghiệp vụ cuối cùng.
- Tồn kho chỉ trừ khi thanh toán thành công — dù là tiền mặt hay QR.
- Thanh toán QR động (PayOS + VietQR) giúp giảm sai sót tiền mặt, tự xác nhận qua webhook, không cần thu ngân kiểm tra thủ công.
- Muốn vận hành ổn ngoài thực tế, phải chốt sớm các rule về conflict nhiều thiết bị, giá chốt theo thời điểm nào, xử lý món đã gửi quầy, và xử lý edge case QR (hết hạn, miss webhook, chuyển sai tiền).