"use client";

import { useState } from "react";
import PdfBuilder from "./PdfBuilder";
import { useTranslations } from "next-intl";

export default function PdfTabs() {
  const [activeTab, setActiveTab] = useState<"practice" | "blank">("practice");
  const t = useTranslations("Pdf"); // We can reuse some translations or just hardcode if the user prefers

  return (
    <div className="pdfTabsContainer">
      <div className="pdfTabsHeader">
        <button 
          className={`pdfTab ${activeTab === "practice" ? "active" : ""}`}
          onClick={() => setActiveTab("practice")}
        >
          Giấy luyện chữ
        </button>
        <button 
          className={`pdfTab ${activeTab === "blank" ? "active" : ""}`}
          onClick={() => setActiveTab("blank")}
        >
          Giấy trắng
        </button>
      </div>
      
      <div className="pdfTabContent">
        {activeTab === "practice" && <PdfBuilder />}
        {activeTab === "blank" && (
          <section className="pdfBuilder">
            <div className="pdfControls">
              <p style={{ color: "var(--muted)" }}>Phần nội dung Giấy Trắng sẽ được cập nhật sau...</p>
            </div>
            <div className="previewPanel">
              <p className="previewTitle">{t("preview")}</p>
              <div className="pdfPreview empty">
                <span className="emptyPreview square">
                  <span>口</span>
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
