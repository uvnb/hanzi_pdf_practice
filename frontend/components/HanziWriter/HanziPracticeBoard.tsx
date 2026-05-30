"use client";

import HanziWriter from "hanzi-writer";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import FavoriteButton from "@/components/Notebook/FavoriteButton";
import CharacterSelector from "./CharacterSelector";
import CharacterInfo from "./CharacterInfo";
import { playCorrectStroke, playMistake, playFanfare } from "@/lib/audio";
import { fetchHanziDetail, logAttempt, HanziDetail } from "@/lib/hanzi-api";
import { HanziMetadata } from "@/lib/pdf-worksheet";
import PracticeStatsPanel from "./PracticeStatsPanel";

const DATA_CDN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/";

export default function HanziPracticeBoard() {
  const t = useTranslations("Board");
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  
  const [character, setCharacter] = useState("学");
  const [detail, setDetail] = useState<HanziDetail | null>(null);
  const [message, setMessage] = useState(() => t("defaultMessage"));
  const [loading, setLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [hskList, setHskList] = useState<HanziMetadata[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Fetch character details when character changes
  useEffect(() => {
    setIsComplete(false);
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
        
        setIsComplete(true);
        setMistakesCount(totalMistakes);

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

  function goNext() {
    if (!hskList.length) return;
    const currentIndex = hskList.findIndex(c => c.character === character);
    if (currentIndex >= 0 && currentIndex < hskList.length - 1) {
      setCharacter(hskList[currentIndex + 1].character);
    }
  }

  function goPrev() {
    if (!hskList.length) return;
    const currentIndex = hskList.findIndex(c => c.character === character);
    if (currentIndex > 0) {
      setCharacter(hskList[currentIndex - 1].character);
    }
  }

  return (
    <section className="practiceCard">
      <CharacterSelector character={character} onSelectCharacter={setCharacter} onListLoaded={setHskList} />

      <div className="writerPanel">
        <div className="navGridContainer">
          <button 
            type="button"
            className="navButton prevBtn"
            onClick={goPrev} 
            disabled={hskList.findIndex(c => c.character === character) <= 0}
            title="Chữ trước đó"
          >
            ←
          </button>

          <div className="gridWrapper">
            <div
              className={`tianGrid ${isShaking ? "shake" : ""}`}
              ref={targetRef}
              aria-label={t("writer", { character })}
            />
            {isComplete && (
              <div className="completionOverlay">
                <div className="starIcon">⭐</div>
                <h2>Hoàn thành!</h2>
                <p>{detail?.stroke_count || 0} nét • {mistakesCount} lần sai</p>
                <button type="button" onClick={goNext} className="nextCharBtn" disabled={hskList.findIndex(c => c.character === character) >= hskList.length - 1}>
                  CHỮ TIẾP THEO <span>→</span>
                </button>
              </div>
            )}
          </div>

          <button 
            type="button"
            className="navButton nextBtn"
            onClick={goNext}
            disabled={hskList.findIndex(c => c.character === character) >= hskList.length - 1}
            title="Chữ tiếp theo"
          >
            →
          </button>
          
          <p className="currentCharacter">{character}</p>
        </div>
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

      <div className="infoPanel" style={{ display: "flex", flexDirection: "column" }}>
        <CharacterInfo character={character} detail={detail} />
        <PracticeStatsPanel />
      </div>
    </section>
  );
}
