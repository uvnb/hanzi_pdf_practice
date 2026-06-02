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

  const [isProcessing, setIsProcessing] = useState(false);

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
        setIsProcessing(true);
        void loginWithGoogleCredential(credential)
          .then(() => router.push("/notebook"))
          .catch(() => {
            setError(t("error"));
            setIsProcessing(false);
          });
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

  if (isProcessing) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "40px", color: "var(--ink)", fontWeight: 500 }}>
        <svg style={{ animation: "spin 1s linear infinite", width: "20px", height: "20px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{t("loading") || "Vui lòng chờ..."}</span>
      </div>
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}
