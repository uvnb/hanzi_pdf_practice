"use client";

import { useMemo, useState } from "react";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState(
    () => t("initialStatus"),
  );
  const [busy, setBusy] = useState(false);
  const characters = useMemo(() => collectHanzi(text), [text]);

  async function generatePdf() {
    if (characters.length === 0) {
      setStatus(t("invalid"));
      return;
    }
    if (characters.length > MAX_CHARACTERS) {
      setStatus(t("limit", { count: MAX_CHARACTERS }));
      return;
    }

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
      setPreviewUrl(generated.previewUrl);
      triggerDownload(generated.pdfBytes);
      setStatus(
        metadata.length > 0
          ? t("downloadedAnnotated", {
              pages: generated.pageCount,
              count: characters.length,
              metadata: metadata.length,
            })
          : t("downloaded", {
              pages: generated.pageCount,
              count: characters.length,
            }),
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : t("error"),
      );
    } finally {
      setBusy(false);
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
        <p className="fieldHint">
          {t("summary", {
            count: characters.length,
            pages: Math.max(1, Math.ceil(characters.length / 10)),
          })}
        </p>

        <fieldset className="gridChoice">
          <legend>{t("gridStyle")}</legend>
          <label className={style === "tian" ? "checked" : undefined}>
            <input
              checked={style === "tian"}
              name="gridStyle"
              onChange={() => setStyle("tian")}
              type="radio"
            />
            <span className="gridIcon">田</span>
            {t("tian")}
          </label>
          <label className={style === "mi" ? "checked" : undefined}>
            <input
              checked={style === "mi"}
              name="gridStyle"
              onChange={() => setStyle("mi")}
              type="radio"
            />
            <span className="gridIcon">米</span>
            {t("mi")}
          </label>
        </fieldset>

        <button disabled={busy} onClick={generatePdf} type="button">
          {busy ? t("generating") : t("generate")}
        </button>
        <p className="feedback pdfStatus" aria-live="polite">
          {status}
        </p>
        <p className="privacyNote">
          {t("privacy")}
        </p>
      </div>

      <div className="previewPanel">
        <p className="previewTitle">{t("preview")}</p>
        {previewUrl ? (
          // The preview is generated from the same local canvas as the PDF.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={t("preview")} src={previewUrl} />
        ) : (
          <div className={`emptyPreview ${style}`}>
            <span>{style === "tian" ? "田" : "米"}</span>
            <p>{t("emptyPreview")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
