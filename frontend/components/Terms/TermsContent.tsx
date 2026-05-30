export default function TermsContent() {
  return (
    <div style={{ padding: "40px", backgroundColor: "#f0f6fc", fontFamily: "var(--font-sans)", borderRadius: "16px" }}>
      <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
        Chính sách sử dụng
      </h2>
      <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "32px" }}>
        Vui lòng đọc kỹ trước khi sử dụng website.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Item 1 */}
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#991b1b", margin: 0 }}>Hành vi xâm nhập & crawl dữ liệu</h3>
          </div>
          <p style={{ fontSize: "14px", color: "#451a1a", lineHeight: 1.6, margin: 0 }}>
            Mọi hành vi tấn công, dò quét, khai thác lỗ hổng, crawl/scrape dữ liệu tự động từ website đều bị <strong style={{ color: "#dc2626" }}>nghiêm cấm</strong>. Người vi phạm sẽ bị ban tài khoản vĩnh viễn, đồng thời có thể bị chặn IP truy cập.
          </p>
        </div>

        {/* Item 2 */}
        <div style={{ backgroundColor: "#fefce8", border: "1px solid #fef08a", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#92400e", margin: 0 }}>Tài liệu phục vụ học tập cá nhân</h3>
          </div>
          <p style={{ fontSize: "14px", color: "#713f12", lineHeight: 1.6, margin: 0 }}>
            Toàn bộ tài liệu, file PDF, nội dung học tập trên website được cung cấp <strong>cho mục đích học tập cá nhân</strong>. Nghiêm cấm mọi hình thức mua bán, thương mại hoá, đăng tải lại dưới danh nghĩa cá nhân hoặc tổ chức khác.
          </p>
        </div>

        {/* Item 3 */}
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#9a3412", margin: 0 }}>Cấm mua bán, phân phối lại</h3>
          </div>
          <p style={{ fontSize: "14px", color: "#7c2d12", lineHeight: 1.6, margin: 0 }}>
            Bạn không được sao chép, phát tán, rao bán hoặc sử dụng tài liệu của website cho bất kỳ mục đích thương mại nào. Các hành vi này sẽ bị xử lý.
          </p>
        </div>

        {/* Item 4 */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="23" y2="12"/><line x1="23" y1="8" x2="19" y2="12"/></svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>Chính sách xử lý vi phạm</h3>
          </div>
          <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
            Khi phát hiện hành vi vi phạm các quy định trên, chúng tôi có quyền <strong>ban tài khoản ngay lập tức mà không cần thông báo trước</strong>. Mọi dữ liệu, lượt truy cập và quyền sử dụng của tài khoản bị ban sẽ bị huỷ bỏ và không được hoàn lại (bao gồm cả các gói premium/lifetime).
          </p>
        </div>
      </div>

      <div style={{ marginTop: "32px", textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
        Bằng việc sử dụng website, bạn đồng ý tuân thủ các điều khoản trên.
      </div>
    </div>
  );
}
