import React from "react";
import StellaSlidesViewport from "./StellaSlidesViewport";
import StellaAutoSlidesViewport from "./StellaAutoSlidesViewport";
import "./assets/chrome.css";

function getQueryParam(name: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) || fallback;
}

export default function StellaVisualRoute() {
  const auto =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("auto") === "1";
  const studyId = getQueryParam("studyId", "");
  const baseUrl = getQueryParam(
    "baseUrl",
    (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) || "http://127.0.0.1:8000",
  );
  const debug = getQueryParam("debug", "0") === "1";

  if (auto) {
    return <StellaAutoSlidesViewport baseUrl={baseUrl} debug={debug} />;
  }

  if (!studyId) {
    return (
      <div className="stella-5-0-viewport">
        <p className="stella-5-0-error">Paramètre studyId manquant dans l'URL (ou utiliser ?auto=1).</p>
      </div>
    );
  }

  return <StellaSlidesViewport studyId={studyId} baseUrl={baseUrl} debug={debug} />;
}