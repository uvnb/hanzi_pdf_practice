"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  buildWorksheet,
  collectHanzi,
  GridStyle,
  HanziMetadata,
} from "@/lib/pdf-worksheet";
import { fetchHanziMetadata } from "@/lib/hanzi-api";

const DEFAULT_CHARACTERS = "你 好 我 学 中 文 人 大 小 国";
const MAX_CHARACTERS = 100;

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
  const [text, setText] = useState(
    () => searchParams.get("characters") || DEFAULT_CHARACTERS,
  );
  const [style, setStyle] = useState<GridStyle>("tian");
  const [background, setBackground] = useState<string>("1.jpeg");
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
    if (characters.length > MAX_CHARACTERS) {
      setPreviewUrls([]);
      setPdfBytes(null);
      setStatus(t("limit", { count: MAX_CHARACTERS }));
      return;
    }

    const timer = setTimeout(() => {
      generatePreview();
    }, 800);

    return () => clearTimeout(timer);
  }, [characters, style, background]);

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
      const generated = await buildWorksheet(
        characters,
        style,
        background,
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

  function downloadPdf() {
    if (pdfBytes) {
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", margin: 0 }}>Nền giấy (Background)</label>
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", fontSize: "14px", cursor: "pointer", maxWidth: 170 }}
          >
            <option value="none">Trắng (Mặc định)</option>
            <option value="1.jpeg">Mẫu cổ phong</option>
          </select>
        </div>

        <button disabled={busy || !pdfBytes} onClick={downloadPdf} type="button">
          {busy ? t("generating") : t("generate")}
        </button>
        {status && (
          <p className="feedback pdfStatus" aria-live="polite">
            {status}
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
