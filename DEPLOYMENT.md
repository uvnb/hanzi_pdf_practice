# Triển khai Hanzi Practice

Tài liệu này chọn luồng deploy để vận hành ổn định cho đăng nhập:

- PostgreSQL: Neon hoặc Supabase.
- API: Railway hoặc Render chạy Dockerfile trong `backend/`.
- Web: Vercel chạy Next.js trong `frontend/`.
- Trình duyệt chỉ gọi `/api/*` trên domain frontend. Next.js proxy request đến
  FastAPI qua `API_PROXY_TARGET`, do đó cookie đăng nhập là first-party.

## 1. Database PostgreSQL

Tạo database và lấy connection string. Backend tự động chuyển URL dạng
`postgresql://...?...sslmode=require` thành SQLAlchemy asyncpg URL tương thích
(`postgresql+asyncpg://...?...ssl=require`).

Nếu URL pooler có tham số riêng không được `asyncpg` hỗ trợ, ví dụ
`channel_binding=require`, xóa tham số đó nếu log kết nối báo lỗi unexpected
keyword argument.

Migration được chạy bởi container backend trước khi khởi động API:

```bash
alembic upgrade head
python -m scripts.seed_hsk1
```

`seed_hsk1` chỉ thêm chữ chưa tồn tại, không ghi đè metadata đã được Gemini làm
giàu. Chỉ dùng `python -m scripts.seed_hsk1 --refresh` khi có chủ ý muốn khôi
phục starter data.

## 2. Backend trên Railway

Tạo service từ repository và đặt **Root Directory** là `backend`. Railway sẽ
dùng [backend/Dockerfile](backend/Dockerfile) và
[backend/railway.toml](backend/railway.toml). Cấu hình health check
`/api/health` nếu dashboard chưa tự nhận config file.

Đặt các biến môi trường:

```env
APP_NAME=Hanzi Practice API
DATABASE_URL=<postgres connection string>
FRONTEND_ORIGIN=https://<vercel-project>.vercel.app
AUTO_CREATE_TABLES=false
GOOGLE_CLIENT_ID=<google web oauth client id>
JWT_SECRET=<random secret ít nhất 32 bytes>
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
GEMINI_API_KEY=<gemini api key>
GEMINI_MODEL=gemini-2.5-flash
ADMIN_API_KEY=<random secret riêng cho enrich-batch>
```

Với Render, tạo Docker Web Service với root `backend`, health check
`/api/health`, và dùng cùng bộ biến môi trường trên. Render thường cấp biến
`PORT`; Dockerfile đã lắng nghe biến này.

## 3. Frontend trên Vercel

Import cùng repository vào Vercel và đặt **Root Directory** là `frontend`.
Cấu hình biến môi trường Production:

```env
API_PROXY_TARGET=https://<backend-public-domain>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google web oauth client id>
```

Không đặt `NEXT_PUBLIC_API_URL` trong luồng production này. Nếu đặt biến đó,
browser sẽ gọi API domain trực tiếp và cookie sẽ trở thành cross-site.

Sau khi deploy, mở Google Cloud Console và thêm frontend origin vào OAuth Web
client:

```text
https://<vercel-project>.vercel.app
https://<custom-domain>        # nếu sử dụng
```

## 4. Chế độ gọi API trực tiếp

Nếu chủ động bỏ proxy và đặt `NEXT_PUBLIC_API_URL=https://<backend-domain>`,
backend cần:

```env
COOKIE_SECURE=true
COOKIE_SAMESITE=none
FRONTEND_ORIGIN=https://<frontend-domain>
```

Một số trình duyệt chặn third-party cookie dù đã đặt `SameSite=None`; proxy
cùng origin vẫn là lựa chọn nên dùng cho đăng nhập.

## 5. Kiểm tra sau deploy

```bash
curl -fsS https://<backend-domain>/api/health
curl -I https://<frontend-domain>/
```

Trong trình duyệt:

1. Mở `/vi/auth/login`, đăng nhập Google, sau đó tải lại trang notebook.
2. Thêm một chữ vào notebook và tạo PDF từ notebook.
3. Đổi ngôn ngữ trên trang PDF, xác nhận danh sách `characters` vẫn còn.
4. Chạy enrichment admin một batch nhỏ và kiểm tra metadata trên trang PDF.

## Thông tin cần để deploy thật

Workspace hiện chưa có Git repository hoặc phiên đăng nhập Vercel/Railway.
Để tiếp tục deploy lên dịch vụ thật, cần:

1. GitHub repository/remote để push source, hoặc quyền tạo repository mới.
2. Lựa chọn backend: Railway hay Render; lựa chọn database: Neon hay Supabase.
3. Domain Vercel dự kiến và OAuth Client ID Google.
4. Các secret được điền trực tiếp trong dashboard dịch vụ:
   `DATABASE_URL`, `JWT_SECRET`, `ADMIN_API_KEY`, `GEMINI_API_KEY`.
