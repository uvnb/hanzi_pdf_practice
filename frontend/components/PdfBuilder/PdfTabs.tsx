"use client";

import { useState } from "react";
import PdfBuilder from "./PdfBuilder";
import BlankPaperBuilder from "./BlankPaperBuilder";

export default function PdfTabs() {
  const [activeTab, setActiveTab] = useState<"practice" | "blank">("practice");

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
        {activeTab === "blank" && <BlankPaperBuilder />}
      </div>
    </div>
  );
}
