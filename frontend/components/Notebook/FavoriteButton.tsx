"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Link } from "@/i18n/navigation";
import { fetchNotebook, removeCharacter, saveCharacter } from "@/lib/notebook-api";

export default function FavoriteButton({ character }: { character: string }) {
  const t = useTranslations("Favorite");
  const { loading: authLoading, user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setMessage("");
    if (!user) {
      setSaved(false);
      return;
    }
    fetchNotebook()
      .then((entries) => {
        if (active) {
          setSaved(entries.some((entry) => entry.character === character));
        }
      })
      .catch(() => {
        if (active) {
          setMessage(t("checkError"));
        }
      });
    return () => {
      active = false;
    };
  }, [character, t, user]);

  if (!authLoading && !user) {
    return (
      <p className="favoritePrompt">
        <Link href="/auth/login">{t("loginPrompt")}</Link>
      </p>
    );
  }

  async function toggleSaved() {
    setSaving(true);
    setMessage("");
    try {
      if (saved) {
        await removeCharacter(character);
        setSaved(false);
        setMessage(t("removed"));
      } else {
        await saveCharacter(character);
        setSaved(true);
        setMessage(t("saved"));
      }
    } catch {
      setMessage(t("updateError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="favoriteAction">
      <button
        className="secondary"
        disabled={authLoading || saving}
        onClick={() => void toggleSaved()}
        type="button"
      >
        {saved ? t("remove") : t("add")}
      </button>
      {message ? <p className="favoriteMessage">{message}</p> : null}
    </div>
  );
}
