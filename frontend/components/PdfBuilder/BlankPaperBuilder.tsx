"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/Auth/AuthProvider";
import { consumePdfQuota } from "@/lib/payment-api";
import { PDFDocument, BlendMode } from "pdf-lib";
import { Link } from "@/i18n/navigation";

const TEMPLATES = {
  tian: [
    { id: "tian_10c_13h.pdf", name: "10 cột - 13 hàng" },
    { id: "tian_14c_20h.pdf", name: "14 cột - 20 hàng" },
  ],
  mi: [
    { id: "mi_11c_16h.pdf", name: "11 cột - 16 hàng" },
  ],
  square: [
    { id: "square_8c_12h.pdf", name: "8 cột - 12 hàng" },
    { id: "square_10c_14h.pdf", name: "10 cột - 14 hàng" },
    { id: "square_11c_15h.pdf", name: "11 cột - 15 hàng" },
    { id: "square_12c_16h.pdf", name: "12 cột - 16 hàng" },
    { id: "square_13c_17h.pdf", name: "13 cột - 17 hàng" },
    { id: "square_horizontal.pdf", name: "Ô vuông ngang" },
  ],
  jiugong: [
    { id: "jiugong_thi.pdf", name: "Giấy thi" },
  ],
  vertical: [
    { id: "vertical_7c.pdf", name: "7 cột" },
    { id: "vertical_10c.pdf", name: "10 cột" },
    { id: "vertical_12c.pdf", name: "12 cột" },
  ],
  horizontal: [
    { id: "horizontal_13h.pdf", name: "13 hàng" },
    { id: "horizontal_15h.pdf", name: "15 hàng" },
    { id: "horizontal_vertical.pdf", name: "Ngang - Dọc" },
  ]
};

const GRID_TYPES = [
  { id: "tian", name: "Ô điền" },
  { id: "mi", name: "Ô mễ" },
  { id: "square", name: "Ô vuông" },
  { id: "jiugong", name: "Ô cửu cung" },
  { id: "vertical", name: "Ô dọc" },
  { id: "horizontal", name: "Ô ngang" },
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
  
  const [gridType, setGridType] = useState<keyof typeof TEMPLATES>("tian");
  const [templateId, setTemplateId] = useState<string>(TEMPLATES.tian[0].id);
  const [background, setBackground] = useState<string>("1.jpeg");
  const [bgOpacity, setBgOpacity] = useState<number>(70);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update available templates when gridType changes
  useEffect(() => {
    const list = TEMPLATES[gridType];
    if (list && list.length > 0) {
      setTemplateId(list[0].id);
    }
  }, [gridType]);

  // We no longer generate a live PDF preview, we use native HTML rendering instead for instant feedback!

  let canDownload = false;
  if (subscription) {
    canDownload = true;
  }

  async function fetchImageBytes(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load background image");
    return res.arrayBuffer();
  }

  async function generatePdf() {
    if (!templateId) return;
    
    try {
      setBusy(true);
      setStatus("Đang tạo PDF...");
      
      // Load the PDF template
      const templateRes = await fetch(`/templates/${templateId}`);
      if (!templateRes.ok) throw new Error("Template not found");
      const templateBytes = await templateRes.arrayBuffer();
      
      const templateDoc = await PDFDocument.load(templateBytes);
      const pdfDoc = await PDFDocument.create();
      
      // Embed the first page of the template
      const [embeddedTemplate] = await pdfDoc.embedPdf(templateDoc, [0]);
      
      // Prepare background image
      let embeddedBg = null;
      if (background !== "none") {
        const activeBackground = background === "custom" && customBackgroundUrl 
          ? customBackgroundUrl 
          : `/background_pdf/${background}`;
          
        const bgBytes = await fetchImageBytes(activeBackground);
        // Determine type
        if (activeBackground.toLowerCase().endsWith('.png') || activeBackground.startsWith('data:image/png')) {
          embeddedBg = await pdfDoc.embedPng(bgBytes);
        } else {
          embeddedBg = await pdfDoc.embedJpg(bgBytes);
        }
      }
      
      const numPages = 1;
      
      for (let i = 0; i < numPages; i++) {
        const page = pdfDoc.addPage([embeddedTemplate.width, embeddedTemplate.height]);
        
        // Draw the template first. If it has a white background, it will be the base.
        page.drawPage(embeddedTemplate, {
          x: 0,
          y: 0,
          width: embeddedTemplate.width,
          height: embeddedTemplate.height,
        });
        
        // Draw the background image ON TOP with Multiply blend mode.
        // This makes the white areas of the template transparent to the background,
        // while the dark grid lines remain dark.
        if (embeddedBg) {
          page.drawImage(embeddedBg, {
            x: 0,
            y: 0,
            width: embeddedTemplate.width,
            height: embeddedTemplate.height,
            opacity: bgOpacity / 100,
            blendMode: BlendMode.Multiply,
          });
        }
      }
      
      const finalBytes = await pdfDoc.save();
      
      return finalBytes;
    } catch (err: any) {
      setStatus("Lỗi khi tạo PDF: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (!canDownload) {
      setStatus("Vui lòng đăng nhập để tải PDF.");
      return;
    }

    setBusy(true);
    setStatus("Đang kiểm tra lượt tải...");
    try {
      await consumePdfQuota();
      
      const bytes = await generatePdf();
      if (bytes) {
        triggerDownload(bytes, `hanzi-blank-paper-${templateId}`);
        setStatus("Tải thành công!");
        await refresh();
      }
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
          Hãy chọn một loại lưới chuyên nghiệp, kết hợp cùng hình nền để in ra giấy hoặc dùng trên các ứng dụng ghi chú (GoodNotes, Notability...).
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Kiểu lưới</label>
            <select
              value={gridType}
              onChange={(e) => setGridType(e.target.value as keyof typeof TEMPLATES)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
            >
              {GRID_TYPES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Loại</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
            >
              {TEMPLATES[gridType]?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
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

        <button disabled={busy || !canDownload} onClick={handleDownload} type="button">
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
          {/* Chỉ hiển thị 1 trang xem trước vì các trang trắng là hoàn toàn giống nhau */}
          {Array.from({ length: 1 }).map((_, i) => (
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
              {background !== "none" && (
                <div 
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${background === "custom" && customBackgroundUrl ? customBackgroundUrl : `/background_pdf/${background}`})`,
                    backgroundSize: "100% 100%", // stretches nicely just like PDF
                    backgroundPosition: "center",
                    opacity: bgOpacity / 100,
                  }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/templates_preview/${templateId.replace('.pdf', '.png')}`} 
                alt={`${t("preview")} ${i + 1}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  position: "relative",
                  zIndex: 1,
                  mixBlendMode: "multiply",
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
            <div 
              style={{ 
                position: "relative", 
                width: "100%", 
                backgroundColor: "#fff",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {background !== "none" && (
                <div 
                  style={{
                    position: "absolute",
                    top: 0, left: 0, width: "100%", height: "100%",
                    backgroundImage: `url(${background === "custom" && customBackgroundUrl ? customBackgroundUrl : `/background_pdf/${background}`})`,
                    backgroundSize: "100% 100%",
                    backgroundPosition: "center",
                    opacity: bgOpacity / 100,
                  }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/templates_preview/${templateId.replace('.pdf', '.png')}`} 
                alt={`${t("preview")} fullscreen`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  position: "relative",
                  zIndex: 1,
                  mixBlendMode: "multiply",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
