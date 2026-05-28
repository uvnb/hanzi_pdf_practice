"use client";

import Script from "next/script";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { useRouter } from "@/i18n/navigation";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: string; size: string; text: string; width: number },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");
  const { loginWithGoogleCredential } = useAuth();
  const router = useRouter();
  const t = useTranslations("Login");

  useEffect(() => {
    if (!scriptReady || !GOOGLE_CLIENT_ID || !window.google || !containerRef.current) {
      return;
    }
    const target = containerRef.current;
    target.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => {
        setError("");
        void loginWithGoogleCredential(credential)
          .then(() => router.push("/notebook"))
          .catch(() => setError(t("error")));
      },
    });
    window.google.accounts.id.renderButton(target, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      width: 280,
    });
  }, [loginWithGoogleCredential, router, scriptReady, t]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="authError">
        {t("missingConfig")}
      </p>
    );
  }

  return (
    <>
      <Script
        onReady={() => setScriptReady(true)}
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
      <div className="googleButton" ref={containerRef} />
      {error ? <p className="authError">{error}</p> : null}
    </>
  );
}
