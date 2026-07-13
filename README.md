# MA-Nexus-Platform (M&A Deal & Compliance Platform)

**MA-Nexus-Platform** là hệ thống công nghệ kết nối và quản lý giao dịch Sáp nhập & Mua bán doanh nghiệp (M&A) hiện đại, tích hợp Trí tuệ Nhân tạo (Gemini AI) và cơ chế bảo mật tối đa (Firebase & KYC Layer). Nền tảng được thiết kế nhằm giúp các Nhà đầu tư (Buyers), Doanh nghiệp bán (Sellers) và Cố vấn tài chính (Advisors) thực hiện giao dịch một cách an toàn, minh bạch và hiệu quả.

Live demo: https://ma-nexus-platform.vercel.app

---

## 🚀 Các Tính Năng Cốt Lõi

1. **Marketplace (Chợ Giao Dịch M&A)**:
   - Nơi liệt kê các thương vụ gọi vốn, thoái vốn hoặc chuyển nhượng cổ phần.
   - Bộ lọc nâng cao theo ngành nghề, quy mô doanh nghiệp, doanh thu, và trạng thái giao dịch.
2. **Interactive Dashboard (Bảng Điều Khiển)**:
   - Theo dõi chi tiết tiến trình của từng thương vụ theo dòng đời (Deal Lifecycle): _Listing -> Matching -> Diligence -> Negotiation -> Legal -> Closing_.
   - Trực quan hóa số liệu tài chính qua biểu đồ trực quan (sử dụng Recharts).
3. **Secure Data Room (Phòng Lưu Trữ Bảo Mật)**:
   - Lưu trữ các tài liệu thẩm định pháp lý và tài chính (Due Diligence).
   - Cơ chế ký kết NDA (Thỏa thuận bảo mật thông tin) trực tuyến trước khi mở khóa tài liệu nhạy cảm.
4. **AI-Powered Analytics (Tích hợp Gemini AI)**:
   - Phân tích, tóm tắt các thỏa thuận bảo mật NDA.
   - Gợi ý đánh giá rủi ro pháp lý và phân tích số liệu tài chính tự động.
5. **KYC & Role-Based Access Control (Phân Quyền & Xác Thực)**:
   - Phân quyền chặt chẽ các nhóm người dùng: _Buyer (Bên mua)_, _Seller (Bên bán)_, _Advisor (Cố vấn)_, và _Admin (Quản trị viên)_.
   - Quy trình xác minh danh tính (KYC) bắt buộc để truy cập vào các phòng tài liệu nhạy cảm.
6. **Multi-language Support (Đa Ngôn Ngữ)**:
   - Hỗ trợ chuyển đổi ngôn ngữ linh hoạt giữa Tiếng Việt và Tiếng Anh (i18next).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 1. Frontend

- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4.0
- **Animations**: Framer Motion (hiệu ứng mượt mà, cao cấp)
- **Icons**: Lucide React
- **Charts**: Recharts (vẽ biểu đồ tài chính)

### 2. Backend & Middleware

- **Server**: Express.js (Node.js) chạy song song hỗ trợ các API Endpoint Mock (như tạo NDA PDF) và tích hợp middleware dev-server của Vite.

### 3. Database & Cloud Services

- **Database**: Cloud Firestore (Cấu hình bảo mật qua `firestore.rules`)
- **Authentication**: Firebase Authentication (Email/Password, Google SSO, và OTP)
- **Hosting / Deployment**: Vercel

### 4. AI Engine

- **SDK**: `@google/genai` (Kết nối trực tiếp tới Google Gemini AI API)

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
ma-nexus-platform/
├── .github/                 # Cấu hình GitHub Actions (CI/CD)
├── functions/               # Cloud Functions của Firebase (nếu có)
├── public/                  # Các tài nguyên tĩnh (logo, images, html)
├── src/                     # Mã nguồn Frontend React
│   ├── components/          # Các Component dùng chung (AuthContext, UI components)
│   ├── hooks/               # Custom React Hooks
│   ├── lib/                 # Cấu hình thư viện liên kết (Firebase client, Gemini API)
│   ├── pages/               # Các trang giao diện chính:
│   │   ├── Marketplace.tsx      # Giao diện chợ giao dịch
│   │   ├── Dashboard.tsx        # Bảng điều khiển giao dịch
│   │   ├── DealDetail.tsx       # Chi tiết thương vụ
│   │   ├── DataRoom.tsx         # Phòng tài liệu bảo mật
│   │   ├── CreateDeal.tsx       # Tạo thương vụ mới
│   │   ├── Profile.tsx          # Trang hồ sơ & xác thực KYC
│   │   └── AdminDashboard.tsx   # Trang quản trị hệ thống
│   ├── App.tsx              # Router chính và Layout hệ thống
│   ├── index.css            # File styles Tailwind CSS
│   └── main.tsx             # Entrypoint khởi tạo React
├── server.ts                # Server Express tích hợp chạy Development & Production
├── firebase.json            # Cấu hình Firebase services
├── firestore.rules          # Quy tắc bảo mật dữ liệu Firestore
├── package.json             # Danh sách dependencies và scripts khởi chạy
└── vercel.json              # Cấu hình deploy URL rewrite cho Vercel
```

---

## 💻 Hướng Dẫn Khởi Chạy Dự Án (Local Development)

### 1. Yêu cầu hệ thống

- Đã cài đặt **Node.js** (Phiên bản v18 trở lên).

### 2. Các bước cài đặt

**Bước 1: Tải dependencies**
Mở terminal tại thư mục dự án và chạy:

```bash
npm install
```

**Bước 2: Cấu hình biến môi trường**

1. Nhân bản file `.env.example` thành file `.env`:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` vừa tạo và điền giá trị cho API Key của bạn:
   ```env
   VITE_GEMINI_API_KEY="Điền_Gemini_API_Key_Của_Bạn_Vào_Đây"
   VITE_APP_URL="http://localhost:3000"
   ```

**Bước 3: Khởi chạy Server Development**
Chạy lệnh sau để khởi chạy cả Express Server và giao diện React:

```bash
npm run dev
```

Sau đó, truy cập ứng dụng tại địa chỉ: **`http://localhost:3000`**

**Bước 4: Build ứng dụng cho Production**
Để biên dịch tối ưu hóa mã nguồn trước khi deploy:

```bash
npm run build
```

Bản build hoàn chỉnh sẽ được tạo ra tại thư mục `dist/`.
