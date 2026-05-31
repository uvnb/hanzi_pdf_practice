"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/Auth/AuthProvider";
import { consumePdfQuota } from "@/lib/payment-api";
import {
  buildWorksheet,
  collectHanzi,
  GridStyle,
  HanziMetadata,
} from "@/lib/pdf-worksheet";
import { fetchHanziMetadata } from "@/lib/hanzi-api";
import { Link } from "@/i18n/navigation";

const DEFAULT_CHARACTERS = "你 好 我 学 中 文 人 大 小 国";
const MAX_CHARACTERS = 100; // Will be overridden by subscription

function triggerDownload(bytes: Uint8Array) {
  const pdfBuffer = new Uint8Array(bytes).buffer;
  const url = URL.createObjectURL(
    new Blob([pdfBuffer], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "hanzi-practice-worksheet.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function PdfBuilder() {
  const t = useTranslations("Pdf");
  const searchParams = useSearchParams();
  const { user, subscription, refresh } = useAuth();
  const router = useRouter();
  
  const [text, setText] = useState(
    () => searchParams.get("characters") || DEFAULT_CHARACTERS,
  );
  const [style, setStyle] = useState<GridStyle>("tian");
  const [background, setBackground] = useState<string>("1.jpeg");
  const [bgOpacity, setBgOpacity] = useState<number>(70);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const characters = useMemo(() => collectHanzi(text), [text]);

  const [metadataCount, setMetadataCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (characters.length === 0) {
      setPreviewUrls([]);
      setPdfBytes(null);
      setStatus(t("invalid"));
      return;
    }
    
    let charLimit = 22; // Guest & Free
    if (subscription) {
      if (subscription.plan === 'yearly') charLimit = 9999;
      else if (subscription.plan !== 'free') charLimit = 110;
    }
    
    if (characters.length > charLimit) {
      setPreviewUrls([]);
      setPdfBytes(null);
      setStatus(`Vượt quá giới hạn của gói hiện tại (Tối đa ${charLimit} chữ/lần). Hãy giảm bớt số chữ hoặc Nâng cấp tài khoản.`);
      return;
    }

    const timer = setTimeout(() => {
      generatePreview();
    }, 800);

    return () => clearTimeout(timer);
  }, [characters, style, background, customBackgroundUrl, bgOpacity, subscription]);

  async function generatePreview() {
    setBusy(true);
    try {
      setStatus(t("metadata"));
      let metadata: HanziMetadata[] = [];
      try {
        metadata = await fetchHanziMetadata(characters);
      } catch {
        setStatus(t("fallback"));
      }
      const activeBackground = background === "custom" && customBackgroundUrl 
        ? customBackgroundUrl 
        : background;
      const generated = await buildWorksheet(
        characters,
        style,
        activeBackground,
        bgOpacity,
        {
          title: t("worksheetTitle"),
          subtitleTian: t("worksheetSubtitleTian"),
          subtitleMi: t("worksheetSubtitleMi"),
          page: (page, pages) => t("worksheetPage", { page, pages }),
          sample: t("sample"),
          trace: t("trace"),
          selfPractice: t("selfPractice"),
          footer: t("footer"),
          loading: (page, pages) => t("progressLoad", { page, pages }),
          rendering: (page, pages) => t("progressRender", { page, pages }),
          packaging: t("progressPack"),
          strokeMissing: (character) => t("strokeMissing", { character }),
          strokeInvalid: (character) => t("strokeInvalid", { character }),
          canvasError: t("canvasError"),
          imageError: t("imageError"),
          emptyError: t("invalid"),
        },
        metadata,
        setStatus,
      );
      setPreviewUrls(generated.previewUrls);
      setPdfBytes(generated.pdfBytes);
      setPageCount(generated.pageCount);
      setMetadataCount(metadata.length);
      setStatus(""); // clear status after generation
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("error"));
      setPreviewUrls([]);
      setPdfBytes(null);
    } finally {
      setBusy(false);
    }
  }

  async function downloadPdf() {
    if (!user) {
      setStatus("Vui lòng đăng nhập để tạo và tải PDF.");
      return;
    }

    if (pdfBytes) {
      try {
        setBusy(true);
        setStatus("Đang kiểm tra lượt tải...");
        await consumePdfQuota();
        
        triggerDownload(pdfBytes);
        setStatus(
          metadataCount > 0
            ? t("downloadedAnnotated", {
                pages: pageCount,
                count: characters.length,
                metadata: metadataCount,
              })
            : t("downloaded", {
                pages: pageCount,
                count: characters.length,
              }),
        );
        await refresh(); // Refresh to update PDF quota counter
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
      <div className="pdfControls">
        <label className="fieldLabel" htmlFor="worksheetCharacters">
          {t("characters")}
        </label>
        <textarea
          id="worksheetCharacters"
          onChange={(event) => setText(event.target.value)}
          rows={5}
          value={text}
        />
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", marginTop: "16px" }}>
          <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Kiểu lưới</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as GridStyle)}
            style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
          >
            <option value="tian">{t("tian")}</option>
            <option value="mi">{t("mi")}</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
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
              onClick={() => document.getElementById("customFileInput")?.click()}
            >
              <input
                id="customFileInput"
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

        <button disabled={busy || !pdfBytes} onClick={downloadPdf} type="button">
          {busy ? t("generating") : t("generate")}
        </button>
        {status && (
          <p className="feedback pdfStatus" aria-live="polite">
            {status === "QUOTA_EXCEEDED" ? (
              <span style={{ color: "#ef4444" }}>
                Bạn đã dùng hết lượt tải PDF hôm nay. 
                <br />
                <button onClick={() => router.push("/premium")} style={{ marginTop: "8px", padding: "8px 16px", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                  Nâng cấp tài khoản
                </button>
              </span>
            ) : status}
          </p>
        )}
      </div>

      <div className="previewPanel">
        <p className="previewTitle">{t("preview")}</p>
        {previewUrls.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "calc(100vh - 180px)", overflowY: "auto", paddingRight: "8px" }}>
            {previewUrls.map((url, i) => (
              <img key={i} alt={`${t("preview")} ${i + 1}`} src={url} style={{ display: "block", width: "100%", border: "1px solid var(--line)" }} />
            ))}
          </div>
        ) : (
          <div className={`emptyPreview ${style}`}>
            <span>{style === "tian" ? "田" : "米"}</span>
          </div>
        )}
      </div>
    </section>
  );
}
