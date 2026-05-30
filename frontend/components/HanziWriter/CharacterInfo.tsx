"use client";

import { HanziDetail } from "@/lib/hanzi-api";
import { speakCharacter } from "@/lib/audio";

interface Props {
  character: string;
  detail: HanziDetail | null;
}

export default function CharacterInfo({ character, detail }: Props) {
  return (
    <div className="infoContent">
      {detail ? (
        <>
          <div className="detailItem">
            <h3>Phiên âm & Nghĩa</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <p className="pinyin" style={{ margin: 0 }}>{detail.pinyin}</p>
              <button 
                onClick={() => speakCharacter(character)}
                title="Phát âm"
                style={{ background: "var(--input)", color: "var(--ink)", padding: "4px 8px", fontSize: 14, cursor: "pointer", border: "1px solid var(--line)", borderRadius: 8 }}
                type="button"
              >
                🔊
              </button>
            </div>
            <p className="meaning" style={{ marginTop: 6 }}>{detail.meaning_vi}</p>
          </div>
          
          {detail.etymology_vi && (
            <div className="detailItem">
              <h3>Chiết tự</h3>
              <p className="etymology">{detail.etymology_vi}</p>
            </div>
          )}
          
          {(detail.radicals && detail.radicals.length > 0) && (
            <div className="detailItem">
              <h3>Bộ thủ</h3>
              <p className="meaning">{detail.radicals.join(", ")}</p>
            </div>
          )}
        </>
      ) : (
        <div className="detailItem">
          <p className="meaning">Đang tải thông tin...</p>
        </div>
      )}
    </div>
  );
}
