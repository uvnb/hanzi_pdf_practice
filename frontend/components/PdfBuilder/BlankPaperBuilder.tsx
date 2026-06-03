"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/Auth/AuthProvider";
import { consumePdfQuota } from "@/lib/payment-api";
import { buildBlankWorksheet, GridStyle } from "@/lib/pdf-worksheet";
import { Link } from "@/i18n/navigation";

const GRID_TYPES = [
  { id: "tian", name: "Ô điền" },
  { id: "mi", name: "Ô mễ" },
  { id: "square", name: "Ô vuông" },
  { id: "zhonggong", name: "Trung cung" },
  { id: "huigong", name: "Hồi cung" },
  { id: "jiugong", name: "Ô cửu cung" },
];

function triggerDownload(bytes: Uint8Array, filename: string) {
  const pdfBuffer = new Uint8Array(bytes).buffer;
  const url = URL.createObjectURL(new Blob([pdfBuffer], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function BlankPaperBuilder() {
  const t = useTranslations("Pdf");
  const { user, subscription, refresh } = useAuth();
  
  const [gridType, setGridType] = useState<GridStyle>("tian");
  const [columns, setColumns] = useState(10);
  const [rows, setRows] = useState(13);
  
  const [background, setBackground] = useState<string>("1.jpeg");
  const [bgOpacity, setBgOpacity] = useState<number>(60);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  let canDownload = false;
  if (subscription) {
    canDownload = true;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview();
    }, 800);

    return () => clearTimeout(timer);
  }, [gridType, columns, rows, background, customBackgroundUrl, bgOpacity]);

  async function generatePreview() {
    setBusy(true);
    try {
      setStatus("Đang tạo bản xem trước...");
      const activeBackground = background === "custom" && customBackgroundUrl 
        ? customBackgroundUrl 
        : background;
      
      const generated = await buildBlankWorksheet(
        gridType,
        columns,
        rows,
        activeBackground,
        bgOpacity,
        {
          title: "",
          subtitleTian: "",
          subtitleMi: "",
          page: () => "",
          sample: "",
          trace: "",
          selfPractice: "",
          footer: "",
          loading: () => "",
          rendering: () => "",
          packaging: "",
          strokeMissing: () => "",
          strokeInvalid: () => "",
          canvasError: t("canvasError"),
          imageError: t("imageError"),
          emptyError: "",
        },
        setStatus
      );
      
      setPreviewUrls(generated.previewUrls);
      setPdfBytes(generated.pdfBytes);
      setStatus("");
    } catch (err: any) {
      setStatus(err.message || "Lỗi");
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (!canDownload) {
      setStatus("Vui lòng đăng nhập để tải PDF.");
      return;
    }

    if (pdfBytes) {
      setBusy(true);
      setStatus("Đang kiểm tra lượt tải...");
      try {
        await consumePdfQuota();
        triggerDownload(pdfBytes, `hanzi-blank-paper.pdf`);
        setStatus("Tải thành công!");
        await refresh();
      } catch (err: any) {
        if (err.message === "PDF_QUOTA_EXCEEDED") {
          setStatus("QUOTA_EXCEEDED");
        } else {
          setStatus("Có lỗi xảy ra khi kiểm tra lượt tải.");
        }
      } finally {
        setBusy(false);
      }
    }
  }

  return (
    <section className="pdfBuilder">
      <div className="pdfControls" style={{ display: "flex", flexDirection: "column" }}>
        
        <label className="fieldLabel" style={{ marginBottom: "8px" }}>
          Hướng dẫn sử dụng
        </label>
        <div style={{
          width: "100%",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid var(--line)",
          background: "var(--paper)",
          color: "var(--ink)",
          fontSize: "14px",
          lineHeight: 1.6,
          minHeight: "155px",
          marginBottom: "16px",
        }}>
          Chế độ <b>Giấy Trắng</b> giúp bạn luyện viết tự do mà không bị gò bó bởi chữ mẫu. <br/><br/>
          Hãy chọn một loại lưới chuyên nghiệp, thiết lập số dòng và số cột mong muốn, kết hợp cùng hình nền để in ra giấy hoặc dùng trên các ứng dụng ghi chú (GoodNotes, Notability...).
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Kiểu lưới</label>
            <select
              value={gridType}
              onChange={(e) => setGridType(e.target.value as GridStyle)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
            >
              {GRID_TYPES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Số cột</label>
            <input
              type="number"
              min={1}
              max={30}
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", width: "170px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Số dòng</label>
            <input
              type="number"
              min={1}
              max={40}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", width: "170px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Độ mờ ảnh nền</label>
            <select
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
            >
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                <option key={val} value={val}>{val}%</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Background</label>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
            >
              <option value="none">Trắng (Mặc định)</option>
              <option value="custom">Tải ảnh của bạn</option>
              <option value="1.jpeg">Mẫu 1</option>
              <option value="2.jpeg">Mẫu 2</option>
              <option value="3.jpeg">Mẫu 3</option>
              <option value="4.jpeg">Mẫu 4</option>
              <option value="5.jpeg">Mẫu 5</option>
              <option value="6.jpeg">Mẫu 6</option>
              <option value="7.jpeg">Mẫu 7</option>
            </select>
          </div>
          {background === "custom" && (
            <div 
              style={{ 
                padding: "24px 12px", 
                border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--line)'}`, 
                borderRadius: "8px", 
                textAlign: "center", 
                background: isDragging ? 'rgba(0,0,0,0.02)' : 'var(--paper)',
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  if (customBackgroundUrl) URL.revokeObjectURL(customBackgroundUrl);
                  setCustomBackgroundUrl(URL.createObjectURL(file));
                  setCustomFileName(file.name);
                }
              }}
              onClick={() => document.getElementById("customFileInputBlank")?.click()}
            >
              <input
                id="customFileInputBlank"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (customBackgroundUrl) URL.revokeObjectURL(customBackgroundUrl);
                    setCustomBackgroundUrl(URL.createObjectURL(file));
                    setCustomFileName(file.name);
                  }
                }}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: "14px", color: "var(--ink)", opacity: 0.7 }}>
                {customFileName ? `Đã chọn: ${customFileName}` : "Kéo thả ảnh hoặc bấm để chọn file."}
              </div>
            </div>
          )}
        </div>

        <button disabled={busy || !canDownload || !pdfBytes} onClick={handleDownload} type="button">
          {busy ? t("generating") : "Tải PDF Giấy Trắng"}
        </button>
        {status && (
          <p className="feedback pdfStatus" aria-live="polite">
            {status === "QUOTA_EXCEEDED" ? (
              <span style={{ color: "#ef4444" }}>
                Bạn đã dùng hết lượt tải PDF hôm nay. 
                <br />
                <Link href="/premium" style={{ display: "inline-block", marginTop: "8px", padding: "8px 16px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", textDecoration: "none" }}>
                  Nâng cấp tài khoản
                </Link>
              </span>
            ) : status}
          </p>
        )}
      </div>

      <div className="previewPanel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p className="previewTitle" style={{ margin: 0 }}>{t("preview")}</p>
          <button 
            onClick={() => setIsFullscreen(true)}
            title="Phóng to"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "var(--ink)",
              opacity: 0.7,
              padding: "4px"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "calc(100vh - 180px)", overflowY: "auto", paddingRight: "8px" }}>
          {previewUrls.map((url, i) => (
            <div 
              key={i}
              style={{ 
                position: "relative", 
                width: "100%", 
                border: "1px solid var(--line)",
                backgroundColor: "#fff",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`${t("preview")} ${i + 1}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {isFullscreen && (
        <div 
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "24px",
            overflowY: "auto"
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <div style={{ width: "100%", maxWidth: "900px", display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button 
              onClick={() => setIsFullscreen(false)}
              style={{ background: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", color: "#333" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ width: "100%", maxWidth: "900px", display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}
          >
            {previewUrls.map((url, i) => (
              <div 
                key={i}
                style={{ 
                  position: "relative", 
                  width: "100%", 
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={url} 
                  alt={`${t("preview")} fullscreen`}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
