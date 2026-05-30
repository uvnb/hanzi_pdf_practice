"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState, useMemo } from "react";
import { fetchHskList } from "@/lib/hanzi-api";
import { HanziMetadata } from "@/lib/pdf-worksheet";
import { HSK_TOPICS } from "@/lib/hsk-topics";

interface Props {
  character: string;
  onSelectCharacter: (char: string) => void;
  onListLoaded?: (list: HanziMetadata[]) => void;
}

export default function CharacterSelector({ character, onSelectCharacter, onListLoaded }: Props) {
  const t = useTranslations("Board");
  const [input, setInput] = useState(character);
  const [hskLevel, setHskLevel] = useState<number>(1);
  const [hskList, setHskList] = useState<HanziMetadata[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("Tất cả");

  useEffect(() => {
    fetchHskList(hskLevel).then((list) => {
      setHskList(list);
    }).catch(console.error);
  }, [hskLevel]);

  const topics = HSK_TOPICS[hskLevel] || [];

  const filteredList = useMemo(() => {
    if (selectedTopic === "Tất cả") return hskList;
    const topic = topics.find(t => t.name === selectedTopic);
    if (!topic) return hskList;
    return hskList.filter(sample => topic.chars.includes(sample.character));
  }, [hskList, selectedTopic, topics]);

  useEffect(() => {
    if (onListLoaded) onListLoaded(filteredList);
  }, [filteredList, onListLoaded]);

  function submitCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCharacter = Array.from(input.trim()).find((char) =>
      /\p{Script=Han}/u.test(char)
    );
    if (nextCharacter) {
      onSelectCharacter(nextCharacter);
      setInput(nextCharacter);
    }
  }

  return (
    <div className="controls">
      <form className="searchForm" onSubmit={submitCharacter}>
        <label htmlFor="character">{t("label")}</label>
        <div className="inputRow">
          <input
            id="character"
            maxLength={8}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            aria-describedby="characterHint"
          />
          <button type="submit">{t("load")}</button>
        </div>
        <p id="characterHint">{t("hint")}</p>
      </form>
      
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Danh sách HSK</label>
          <select 
            value={hskLevel} 
            onChange={(e) => {
              setHskLevel(Number(e.target.value));
              setSelectedTopic("Tất cả");
            }}
            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none" }}
          >
            {[1, 2, 3, 4, 5, 6].map(level => (
              <option key={level} value={level}>HSK {level}</option>
            ))}
          </select>
        </div>

        {topics.length > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: 16 }}>
            <button 
              type="button" 
              onClick={() => setSelectedTopic("Tất cả")}
              style={{ padding: "4px 10px", fontSize: 12, borderRadius: 14, border: "1px solid var(--line)", background: selectedTopic === "Tất cả" ? "var(--accent)" : "var(--paper)", color: selectedTopic === "Tất cả" ? "#fff" : "var(--ink)", cursor: "pointer", transition: "all 0.2s" }}
            >
              Tất cả
            </button>
            {topics.map(t => (
              <button 
                key={t.name}
                type="button" 
                onClick={() => setSelectedTopic(t.name)}
                style={{ padding: "4px 10px", fontSize: 12, borderRadius: 14, border: "1px solid var(--line)", background: selectedTopic === t.name ? "var(--accent)" : "var(--paper)", color: selectedTopic === t.name ? "#fff" : "var(--ink)", cursor: "pointer", transition: "all 0.2s" }}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        <div className="characterList" aria-label={t("samples")} style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
          {filteredList.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Chưa có dữ liệu</p>
          ) : (
            filteredList.map((sample) => (
              <button
                className={sample.character === character ? "selected" : undefined}
                key={sample.character}
                onClick={() => {
                  onSelectCharacter(sample.character);
                  setInput(sample.character);
                }}
                type="button"
              >
                {sample.character}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
