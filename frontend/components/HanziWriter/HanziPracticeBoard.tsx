"use client";

import HanziWriter from "hanzi-writer";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useRef, useState } from "react";
import FavoriteButton from "@/components/Notebook/FavoriteButton";
import PracticeStatsPanel from "@/components/HanziWriter/PracticeStatsPanel";
import { playCorrectStroke, playMistake, playFanfare, speakCharacter } from "@/lib/audio";

import { fetchHanziDetail, fetchHskList, logAttempt, HanziDetail } from "@/lib/hanzi-api";
import { HanziMetadata } from "@/lib/pdf-worksheet";

const DATA_CDN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/";

function firstHanzi(value: string): string | undefined {
  return Array.from(value.trim()).find((char) =>
    /\p{Script=Han}/u.test(char),
  );
}

export default function HanziPracticeBoard() {
  const t = useTranslations("Board");
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [input, setInput] = useState("学");
  const [character, setCharacter] = useState("学");
  const [detail, setDetail] = useState<HanziDetail | null>(null);
  const [hskList, setHskList] = useState<HanziMetadata[]>([]);
  const [message, setMessage] = useState(() => t("defaultMessage"));
  const [loading, setLoading] = useState(true);

  // Fetch HSK 1 list on mount
  useEffect(() => {
    fetchHskList(1).then(setHskList).catch(console.error);
  }, []);

  // Fetch character details when character changes
  useEffect(() => {
    fetchHanziDetail(character)
      .then(setDetail)
      .catch((err) => {
        console.error(err);
        setDetail(null); // fallback if not in DB
      });
  }, [character]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) {
      return;
    }

    setLoading(true);
    setMessage(t("loading"));
    target.innerHTML = "";

    const writer = HanziWriter.create(target, character, {
      width: 320,
      height: 320,
      padding: 18,
      showOutline: true,
      showCharacter: false,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 120,
      charDataLoader: (char, onComplete, onError) => {
        fetch(`${DATA_CDN}${encodeURIComponent(char)}.json`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`No stroke data for ${char}`);
            }
            return response.json();
          })
          .then(onComplete)
          .catch(onError);
      },
      onLoadCharDataSuccess: () => {
        setLoading(false);
        setMessage(t("defaultMessage"));
      },
      onLoadCharDataError: () => {
        setLoading(false);
        setMessage(t("loadError"));
      },
    });

    writerRef.current = writer;

    return () => {
      writerRef.current = null;
      target.replaceChildren();
    };
  }, [character, t]);

  function selectCharacter(nextCharacter: string) {
    setInput(nextCharacter);
    setCharacter(nextCharacter);
  }

  function submitCharacter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextCharacter = firstHanzi(input);
    if (!nextCharacter) {
      setMessage(t("invalid"));
      return;
    }
    setCharacter(nextCharacter);
    setInput(nextCharacter);
  }

  const [isShaking, setIsShaking] = useState(false);

  function triggerConfetti() {
    import("canvas-confetti").then((confetti) => {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#f97316", "#3b82f6", "#eab308"],
      });
    });
  }

  function startQuiz() {
    writerRef.current?.quiz({
      onMistake: () => {
        setMessage(t("mistake"));
        playMistake();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      },
      onCorrectStroke: () => {
        setMessage(t("correct"));
        playCorrectStroke();
      },
      onComplete: ({ totalMistakes }) => {
        // Log attempt to backend silently (fails gracefully if unauthenticated)
        logAttempt({ character, mistakes: totalMistakes }).catch(() => {});
        
        if (totalMistakes === 0) {
          setMessage(t("completePerfect"));
          playFanfare();
          triggerConfetti();
        } else {
          setMessage(t("completeMistakes", { count: totalMistakes }));
        }
      },
    });
  }

  function animate() {
    setMessage(t("animating"));
    writerRef.current?.animateCharacter({
      onComplete: () => setMessage(t("animationComplete")),
    });
  }

  return (
    <section className="practiceCard">
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
          <label style={{ fontSize: 14, fontWeight: 700 }}>HSK 1 Starter</label>
          <div className="characterList" aria-label={t("samples")}>
            {hskList.map((sample) => (
              <button
                className={sample.character === character ? "selected" : undefined}
                key={sample.character}
                onClick={() => selectCharacter(sample.character)}
                type="button"
              >
                {sample.character}
              </button>
            ))}
          </div>
        </div>

        <PracticeStatsPanel />
      </div>

      <div className="writerPanel">
        <div
          className={`tianGrid ${isShaking ? "shake" : ""}`}
          ref={targetRef}
          aria-label={t("writer", { character })}
        />
        <p className="currentCharacter">{character}</p>
        <div className="actions">
          <button disabled={loading} onClick={startQuiz} type="button">
            {t("start")}
          </button>
          <button
            className="secondary"
            disabled={loading}
            onClick={animate}
            type="button"
          >
            {t("animate")}
          </button>
          <FavoriteButton character={character} />
        </div>
        <p className="feedback" aria-live="polite" style={{ marginTop: 12, textAlign: "center" }}>
          {message}
        </p>
      </div>

      <div className="infoPanel">
        {detail ? (
          <>
            <div className="detailItem">
              <h3>Phiên âm & Nghĩa</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <p className="pinyin" style={{ margin: 0 }}>{detail.pinyin}</p>
                <button 
                  onClick={() => speakCharacter(character)}
                  title="Phát âm"
                  style={{ background: "var(--input)", color: "var(--ink)", padding: "4px 8px", fontSize: 14 }}
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
    </section>
  );
}
