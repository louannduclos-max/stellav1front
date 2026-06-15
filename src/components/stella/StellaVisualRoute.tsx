import React from "react";
import StellaSlidesViewport from "./StellaSlidesViewport";
import "./assets/chrome.css";

function getQueryParam(name: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return new URLSearchParams(window.location.search).get(name) || fallback;
}

export default function StellaVisualRoute() {
  const studyId = getQueryParam("studyId", "");
  const baseUrl = getQueryParam(
    "baseUrl",
    (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) || "http://127.0.0.1:8000",
  );
  const debug = getQueryParam("debug", "0") === "1";

  if (!studyId) {
    return (
      <div className="stella-5-0-viewport">
        <p className="stella-5-0-error">Paramètre studyId manquant dans l'URL.</p>
      </div>
    );
  }

  return <StellaSlidesViewport studyId={studyId} baseUrl={baseUrl} debug={debug} />;
}