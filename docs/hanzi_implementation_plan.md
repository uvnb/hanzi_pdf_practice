# 📋 Kế Hoạch Triển Khai Chi Tiết — Hanzi Practice Web App

> **Đánh giá PDF gốc:** Mức độ **High-Level / Conceptual** — đủ để định hướng công nghệ và chia giai đoạn.
> **Trạng thái hiện tại (27/05/2026):** Đã hoàn thành MVP Tuần 1-4: luyện viết, tạo PDF client-side có metadata, Google/JWT cookie và sổ tay, Gemini enrichment admin, giao diện tam ngữ (`vi`/`en`/`zh`) và dark mode. Đã chuẩn bị Alembic, Dockerfile và proxy same-origin cho release; việc cấp database/domain/secrets trên Vercel/Railway vẫn cần tài khoản triển khai thực tế.
>
> **Điều chỉnh triển khai:** Frontend dùng **Next.js 15.5.18** thay cho Next.js 14 do nhánh 14 hiện có cảnh báo bảo mật mức cao từ `npm audit`.

---

## 💡 Các Giải Pháp Kỹ Thuật Cốt Lõi Đã Chốt

1. **Nguồn Dữ Liệu Chữ Hán:** Không lưu trữ local toàn bộ. Cài đặt npm package `hanzi-writer` và dữ liệu từ `makemeahanzi`. Tự động fetch data vector chữ Hán qua CDN theo thời gian thực khi search.
2. **Hệ Thống Authentication:** Loại bỏ Email/Password. **Chỉ dùng Google OAuth** qua thư viện Google Identity Services. Bảo mật Token bằng **HTTP-only Cookie** thay vì Local Storage để chống XSS.
3. **Module Tạo PDF (100% Client-Side - Zero Backend Cost):**
   - **Giao diện lưới (Grid):** Hỗ trợ cả 2 chuẩn **Ô Điền (田)** và **Ô Mễ (米)**. Layout chuẩn: 10 ô trống luyện viết/chữ, 10 chữ/trang A4.
   - **Render bằng HTML5 Canvas:** Dùng `CanvasRenderingContext2D` để vẽ thủ công từng pixel khung lưới, nét vẽ SVG của Kanji (`Path2D`) và text chiết tự.
   - **Đóng gói PDF Thủ Công (Manual Byte Encoding):** Chuyển Canvas thành mảng ảnh JPEG, sau đó tự tay lắp ráp mã nhị phân cấu trúc PDF (header, catalog, pages, trailer) mà không cần thư viện jsPDF nặng nề.
   - **Tải Xuống Trực Tiếp:** Gói binary thành `Blob` -> `URL.createObjectURL` -> Trigger thẻ `<a>` ẩn để người dùng tải thẳng về máy, không lưu trữ (No S3).
4. **Quiz Mode Luyện Viết:** Dùng API chấm điểm nét của `hanzi-writer` (tự xử lý đúng/sai) kèm theo nút xem animation toàn bộ nét.

---

## 🗂️ Cấu Trúc Thư Mục Dự Án

```text
hanzi-web/
├── frontend/                    # Next.js 15 App Router
│   ├── app/
│   │   ├── [locale]/            # i18n routing (vi, zh, en)
│   │   │   ├── page.tsx         # Trang chủ / Hero
│   │   │   ├── practice/
│   │   │   │   └── page.tsx     # Luyện viết chữ Hán (HanziWriter)
│   │   │   ├── pdf/
│   │   │   │   └── page.tsx     # Tạo & tải PDF (Client-side)
│   │   │   ├── notebook/
│   │   │   │   └── page.tsx     # Từ vựng yêu thích
│   │   │   └── auth/
│   │   │       └── login/page.tsx # Nút Google Sign In
│   ├── components/
│   │   ├── HanziWriter/         # Canvas tự chấm điểm nét
│   │   ├── PdfBuilder/          # Logic Canvas -> JPEG -> PDF Blob
│   │   ├── ui/                  # Shadcn UI
│   ├── lib/
│   │   ├── pdf-encoder.ts       # Utility tự lắp ráp PDF Bytes
│   │   └── api-client.ts        # Fetch wrapper, tự động gửi kèm cookie
│   └── middleware.ts            # Xử lý next-intl
│
├── backend/                     # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── hanzi.py         # CRUD metadata chữ Hán, gọi Gemini
│   │   │   ├── users.py         # Notebook & History luyện viết
│   │   │   └── auth.py          # Verify Google Credential & Set Cookie
│   │   ├── models/              # SQLAlchemy
│   │   ├── schemas/             # Pydantic
│   │   ├── services/
│   │   │   └── gemini_service.py # API gọi AI tạo ví dụ, giải nghĩa
│   │   └── database.py          # PostgreSQL async engine
│   └── docker-compose.yml       # PostgreSQL local
```

---

## 🗃️ Database Schema (PostgreSQL)

### 1. Bảng `users`
| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID PK | |
| `email` | VARCHAR(255) UNIQUE NOT NULL | |
| `name` | VARCHAR(255) | |
| `avatar_url` | TEXT NULL | Google Avatar |
| `auth_provider`| VARCHAR(50) | "google" |
| `created_at` | TIMESTAMPTZ | |

### 2. Bảng `hanzi_characters`
*Chỉ lưu metadata, pinyin, nghĩa, ví dụ. Data nét vẽ (SVG) load từ CDN makemeahanzi.*
| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID PK | |
| `character` | VARCHAR(4) UNIQUE NOT NULL | "学" |
| `pinyin` | VARCHAR(50) | "xué" |
| `hsk_level` | SMALLINT NULL | 1-7 |
| `meaning_vi` | TEXT | Nghĩa, chiết tự tiếng Việt |
| `example_sentences` | JSONB | Mảng các câu ví dụ (Trung-Việt-Pinyin) |
| `ai_enriched` | BOOLEAN | Trạng thái cào data Gemini |

### 3. Bảng `user_notebooks` (Yêu Thích)
| Cột | Kiểu | Mô tả |
|---|---|---|
| `user_id` | UUID FK | Composite PK |
| `character_id`| UUID FK | Composite PK |
| `added_at` | TIMESTAMPTZ | |

---

## 🔌 API Endpoints (FastAPI)

### Authentication
- `POST /api/auth/google`: Nhận Google credential token từ client, verify bằng thư viện google-auth. Trả về `Set-Cookie` (HTTP-Only) chứa JWT của phiên đăng nhập.
- `GET /api/auth/me`: Decode JWT từ cookie, trả về profile user.
- `POST /api/auth/logout`: Xóa HTTP-Only cookie.

### Hanzi & AI
- `GET /api/hanzi/{char}`: Lấy nghĩa, pinyin, ví dụ đã lưu.
- `GET /api/hanzi/batch?characters=你,好`: Lấy pinyin/nghĩa cho tối đa 100 chữ để render phiếu PDF.
- `GET /api/hanzi/hsk/{level}`: Lấy danh sách chữ Hán theo độ khó HSK.
- `POST /api/ai/enrich-batch`: (Admin, `X-Admin-Key`) Chạy Gemini để làm giàu tối đa 20 chữ mỗi request; việc đọc/PDF không tự gọi AI có tính phí.

### User Data
- `GET /api/users/me/notebook`: Lấy danh sách yêu thích.
- `POST /api/users/me/notebook`: Lưu chữ vào yêu thích.
- `DELETE /api/users/me/notebook/{char}`: Xóa chữ khỏi danh sách yêu thích.

---

## 🔄 Luồng Dữ Liệu Đáng Chú Ý

### Luồng Đăng Nhập & Phân Quyền (Google OAuth + HTTP-Only Cookie)
1. Frontend render nút "Sign in with Google" qua thẻ `<script>` của Google.
2. User click, cấp quyền, Google trả về `credential token` cho Frontend.
3. Frontend gọi `POST /api/auth/google` kèm token.
4. Backend verify token. Tìm hoặc tạo User trong database.
5. Backend tạo JWT của riêng hệ thống.
6. Trong production, frontend proxy `/api/*` tới backend nên trình duyệt nhận `Set-Cookie: auth_token=ey...; HttpOnly; Secure; SameSite=Lax` trên cùng origin ứng dụng.
7. Các request sau đó tự động gửi cookie first-party. Không cần lưu localStorage và không phụ thuộc third-party cookies.

### Luồng Render PDF Zero-Backend
1. User vào trang `/pdf`, chọn danh sách chữ, chọn kiểu lưới (Điền/Mễ).
2. Frontend fetch data vector SVG cho từng chữ từ `makemeahanzi` CDN.
3. Vòng lặp vẽ lên Virtual Canvas ẩn (`document.createElement('canvas')`):
   - Tính toán tọa độ lưới (10 hàng x 10 cột).
   - `ctx.strokeRect`, `ctx.setLineDash` để vẽ viền mờ ô Điền/Mễ.
   - Dùng `Path2D` parse SVG data và `ctx.fill()` để tô đen nét chữ Kanji vào ô đầu tiên.
   - Thêm text Pinyin, chiết tự, tiếng Việt bên lề.
4. Lấy khung hình: `canvas.toBlob("image/jpeg")`.
5. Mã hóa byte array PDF thủ công, chèn JPEG vào.
6. Gói thành Blob: `URL.createObjectURL(new Blob([pdfBytes], {type: 'application/pdf'}))`.
7. Tự động click thẻ `<a>` ẩn để tải xuống ngay lập tức. Xóa object URL.

---

## 📅 Lộ Trình Triển Khai Cập Nhật (4 Tuần)

**Tuần 1: Nền tảng & Hanzi Writer**
- Khởi tạo Next.js, cấu hình FastAPI + PostgreSQL.
- Dựng bảng `hanzi_characters` và script import bộ HSK 1.
- Cài `hanzi-writer`, dựng màn hình luyện viết tương tác (Quiz + Animation). Load data trực tiếp từ CDN.

**Tuần 2: 100% Client-Side PDF Engine**
- Xây dựng component `PdfBuilder`.
- Code logic Canvas2D vẽ lưới ô Điền / ô Mễ (10 chữ/trang, 10 ô/chữ).
- Code logic render `Path2D` từ dữ liệu nét chữ SVG của `makemeahanzi`.
- Code module đóng gói PDF Byte Array thủ công và tính năng xuất Blob tự động tải xuống.

**Tuần 3: Authentication & Notebook**
- Code Backend: Tích hợp Google OAuth verify, phát hành HTTP-only Cookie JWT.
- Code Frontend: Auth Guard, tự động gửi credentials trong axios, nút Google Login.
- Hoàn thiện UI Notebook: Thêm/Xóa danh sách yêu thích cá nhân hóa.

**Tuần 4: Tam ngữ (i18n), AI & Hoàn thiện**
- Đã cài đặt `next-intl` hỗ trợ Tiếng Việt, Tiếng Anh, Tiếng Trung theo route locale.
- Đã tích hợp Gemini API backend với structured output, API admin và giới hạn batch.
- Đã tinh chỉnh giao diện, dark mode và chuyển ngôn ngữ. Deploy Vercel & Railway là bước vận hành còn lại.
