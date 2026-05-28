"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Link } from "@/i18n/navigation";
import {
  fetchNotebook,
  NotebookEntry,
  removeCharacter,
} from "@/lib/notebook-api";

export default function NotebookView() {
  const t = useTranslations("Notebook");
  const { loading: authLoading, user } = useAuth();
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchNotebook()
      .then((result) => {
        if (active) {
          setEntries(result);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMessage(t("loadError"));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [t, user]);

  const pdfLink = useMemo(
    () => `/pdf?characters=${encodeURIComponent(entries.map((entry) => entry.character).join(""))}`,
    [entries],
  );

  if (authLoading) {
    return <p className="emptyState">{t("sessionLoading")}</p>;
  }
  if (!user) {
    return (
      <section className="emptyState">
        <p>{t("signInRequired")}</p>
        <Link className="primaryButton" href="/auth/login">
          {t("signInGoogle")}
        </Link>
      </section>
    );
  }

  async function remove(entry: NotebookEntry) {
    try {
      await removeCharacter(entry.character);
      setEntries((current) =>
        current.filter((item) => item.character !== entry.character),
      );
      setMessage(t("removed", { character: entry.character }));
    } catch (error) {
      setMessage(t("removeError"));
    }
  }

  return (
    <section className="notebookContent">
      <div className="notebookTools">
        <p>
          {t("count", { name: user.name, count: entries.length })}
        </p>
        {entries.length > 0 ? (
          <Link className="primaryButton" href={pdfLink}>
            {t("makePdf")}
          </Link>
        ) : null}
      </div>
      {message ? <p className="notebookMessage">{message}</p> : null}
      {loading ? <p className="emptyState">{t("loading")}</p> : null}
      {!loading && entries.length === 0 ? (
        <p className="emptyState">
          {t("empty")}
        </p>
      ) : null}
      <div className="notebookGrid">
        {entries.map((entry) => (
          <article className="notebookCard" key={entry.character}>
            <span>{entry.character}</span>
            <strong>{entry.pinyin}</strong>
            <p>{entry.meaning_vi}</p>
            <button
              className="textButton"
              onClick={() => void remove(entry)}
              type="button"
            >
              {t("remove")}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
