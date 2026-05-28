# Hanzi Practice Web App

Mã nguồn khởi đầu theo `hanzi_implementation_plan.md`, gồm:

- `frontend/`: Next.js App Router, trang luyện viết tương tác bằng `hanzi-writer`
  và trình tạo PDF client-side, hỗ trợ `vi`/`en`/`zh` cùng dark mode.
- `backend/`: FastAPI + SQLAlchemy async + PostgreSQL, API metadata chữ Hán,
  đăng nhập Google/notebook và Gemini enrichment dành cho admin.

## Chạy frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Trong `.env.local`, `API_PROXY_TARGET=http://localhost:8000` để `/api/*`
được Next.js proxy tới FastAPI và cookie đăng nhập luôn là cookie cùng origin.
Mở `http://localhost:3000/vi/practice` để luyện nét hoặc
`http://localhost:3000/vi/pdf` để tạo phiếu luyện viết PDF. Truy cập `/`
được middleware chuyển về locale mặc định; menu cho phép chuyển sang `/en`
hoặc `/zh`.

## Chạy backend

```bash
cd backend
cp .env.example .env
docker compose up -d db
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed_hsk1
uvicorn app.main:app --reload
```

API mặc định ở `http://localhost:8000/docs`.
Trang tạo PDF sẽ gọi `GET /api/hanzi/batch` để đưa pinyin và nghĩa tiếng
Việt vào phiếu; nếu backend không chạy, việc xuất lưới và chữ mẫu vẫn hoạt
động.

## Google Login

Tạo OAuth 2.0 Client ID dạng Web application trong Google Cloud Console, thêm
`http://localhost:3000` vào Authorized JavaScript origins, rồi điền cùng
Client ID vào:

- `backend/.env`: `GOOGLE_CLIENT_ID=...`
- `frontend/.env.local`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...`

Backend phát hành JWT nội bộ qua cookie `auth_token` với cờ `HttpOnly` và
`SameSite=Lax`. Luồng deploy khuyến nghị proxy `/api/*` qua Vercel để cookie
vẫn first-party. Khi deploy HTTPS, cấu hình `COOKIE_SECURE=true`,
`AUTO_CREATE_TABLES=false` và thay `JWT_SECRET` bằng secret ngẫu nhiên đủ dài.

## Gemini Enrichment

Điền `GEMINI_API_KEY`, `GEMINI_MODEL` và một `ADMIN_API_KEY` riêng trong
`backend/.env`. Dữ liệu chỉ được tạo khi admin chủ động gọi endpoint, không
được kích hoạt bởi luồng xem chữ/PDF:

```bash
curl -X POST http://localhost:8000/api/ai/enrich-batch \
  -H 'Content-Type: application/json' \
  -H 'X-Admin-Key: replace-this-with-a-separate-admin-key' \
  -d '{"characters":["学","你"],"force":false}'
```

Mỗi request giới hạn 20 chữ; response Gemini được xác thực theo schema trước
khi ghi `pinyin`, nghĩa Việt/Hán Việt và câu ví dụ vào database.

## Deploy

Checklist database, Railway/Render, Vercel, Google OAuth và kiểm tra
production nằm trong [DEPLOYMENT.md](DEPLOYMENT.md).

## Kiểm tra

```bash
cd frontend && npm run lint && npm run build
cd ../backend
DATABASE_URL=sqlite+aiosqlite:///./migration_test.db .venv/bin/alembic upgrade head
DATABASE_URL=sqlite+aiosqlite:///./test_hanzi.db PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/pytest -q
rm -f migration_test.db test_hanzi.db
```
