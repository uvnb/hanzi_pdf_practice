"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState, useMemo, useRef } from "react";
import { fetchHskList } from "@/lib/hanzi-api";
import { useAuth } from "@/components/Auth/AuthProvider";
import { HanziMetadata } from "@/lib/pdf-worksheet";
import { HSK_TOPICS } from "@/lib/hsk-topics";

interface Props {
  character: string;
  expectedHskLevel?: number;
  onSelectCharacter: (char: string) => void;
  onListLoaded?: (list: HanziMetadata[]) => void;
}

export default function CharacterSelector({ character, expectedHskLevel, onSelectCharacter, onListLoaded }: Props) {
  const t = useTranslations("Board");
  const [input, setInput] = useState(character);
  const [hskLevel, setHskLevel] = useState<number>(1);
  const [hskList, setHskList] = useState<HanziMetadata[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("Tất cả");
  const selectedBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setInput(character);
  }, [character]);

  useEffect(() => {
    if (expectedHskLevel && expectedHskLevel >= 1 && expectedHskLevel <= 6) {
      setHskLevel(expectedHskLevel);
      setSelectedTopic("Tất cả");
    }
  }, [expectedHskLevel]);

  useEffect(() => {
    if (selectedBtnRef.current) {
      selectedBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [character, hskList, selectedTopic]);

  useEffect(() => {
    fetchHskList(hskLevel).then((list) => {
      setHskList(list);
    }).catch(console.error);
  }, [hskLevel]);

  const availableTopics = useMemo(() => {
    return HSK_TOPICS.filter(t => 
      hskList.some(sample => t.chars.includes(sample.character))
    );
  }, [hskList]);

  const filteredList = useMemo(() => {
    let list = hskList;
    if (selectedTopic !== "Tất cả") {
      const topic = availableTopics.find(t => t.name === selectedTopic);
      if (topic) {
        list = hskList.filter(sample => topic.chars.includes(sample.character));
      }
    }
    // Inject the current character if it's not in the list so it always appears
    if (!list.some(s => s.character === character) && /\p{Script=Han}/u.test(character)) {
      list = [{ character, pinyin: "", meaning_vi: "Tùy chỉnh" }, ...list];
    }
    return list;
  }, [hskList, selectedTopic, availableTopics, character]);

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

  const { subscription } = useAuth();
  const maxAllowedHsk = (subscription && subscription.plan !== 'free') ? 5 : 3;

  return (
    <div className="controls">
      <form className="searchForm" onSubmit={submitCharacter}>
        <div className="inputRow">
          <input
            id="character"
            maxLength={8}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhập 1 chữ..."
          />
          <button type="submit">{t("load")}</button>
        </div>
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
            {[1, 2, 3, 4, 5, 6].map(level => {
              const isLocked = level > maxAllowedHsk && level <= 5;
              const notAvailable = level > 5;
              return (
                <option key={level} value={level} disabled={isLocked || notAvailable}>
                  HSK {level} {isLocked ? "🔒 (Premium)" : (notAvailable ? "(Chưa ra mắt)" : "")}
                </option>
              );
            })}
          </select>
        </div>

        {availableTopics.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Chủ đề</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none", maxWidth: 170 }}
            >
              <option value="Tất cả">Tất cả</option>
              {availableTopics.map(t => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="characterList" aria-label={t("samples")} style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
          {filteredList.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Chưa có dữ liệu</p>
          ) : (
            filteredList.map((sample) => {
              const isSelected = sample.character === character;
              return (
                <button
                  className={isSelected ? "selected" : undefined}
                  key={sample.character}
                  ref={isSelected ? selectedBtnRef : null}
                  onClick={() => {
                    onSelectCharacter(sample.character);
                    setInput(sample.character);
                  }}
                  type="button"
                >
                  {sample.character}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
