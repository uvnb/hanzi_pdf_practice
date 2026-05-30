"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";
import { fetchHskList } from "@/lib/hanzi-api";
import { HanziMetadata } from "@/lib/pdf-worksheet";
import PracticeStatsPanel from "./PracticeStatsPanel";

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

  useEffect(() => {
    fetchHskList(hskLevel).then((list) => {
      setHskList(list);
      if (onListLoaded) onListLoaded(list);
    }).catch(console.error);
  }, [hskLevel, onListLoaded]);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 700 }}>Danh sách HSK</label>
          <select 
            value={hskLevel} 
            onChange={(e) => setHskLevel(Number(e.target.value))}
            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink)", outline: "none" }}
          >
            {[1, 2, 3, 4, 5, 6].map(level => (
              <option key={level} value={level}>HSK {level}</option>
            ))}
          </select>
        </div>
        <div className="characterList" aria-label={t("samples")} style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
          {hskList.map((sample) => (
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
          ))}
        </div>
      </div>

      <PracticeStatsPanel />
    </div>
  );
}
