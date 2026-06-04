import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { toast } from "sonner";
import "./study-result-view.css";

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: unknown) => { cancel: () => void; promise: Promise<unknown> };
  }>;
};

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: {
    data: Uint8Array;
    isEvalSupported?: boolean;
    isOffscreenCanvasSupported?: boolean;
  }) => { destroy: () => void; promise: Promise<PdfDocument> };
};

type Deliverable = {
  id: string;
  type: string;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
};

type Study = {
  id: string;
  title: string | null;
  city_name: string | null;
  country_code: string | null;
  version_number: number;
  created_at?: string | null;
  generation_completed_at?: string | null;
};

async function downloadBlob(path: string): Promise<Blob | null> {
  const { data, error } = await supabaseBrowser.storage.from("deliverables").download(path);
  if (error || !data) {
    toast.error(error?.message ?? "Fichier indisponible");
    return null;
  }
  return data;
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

async function loadPdfJs(): Promise<PdfJsModule> {
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
  const pdfjs = pdfjsLib as unknown as PdfJsModule;
  const workerUrl = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).href;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

export function StudyResultView({
  study,
  deliverables,
}: {
  study: Study;
  deliverables: Deliverable[];
}) {
  const pdf = useMemo(
    () =>
      deliverables.find(
        (d) =>
          d.type !== "notice" &&
          (d.type === "pdf" ||
            d.type === "pdf_native" ||
            (d.mime_type === "application/pdf" && d.type !== "notice")),
      ),
    [deliverables],
  );
  const pptx = useMemo(
    () =>
      deliverables.find(
        (d) =>
          d.type === "pptx" ||
          d.mime_type ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ),
    [deliverables],
  );
  const html = useMemo(
    () =>
      deliverables.find(
        (d) => d.type === "html" || d.type === "other" || d.mime_type === "text/html",
      ),
    [deliverables],
  );
  const notice = useMemo(() => deliverables.find((d) => d.type === "notice"), [deliverables]);

  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load PDF document
  useEffect(() => {
    let cancel = false;
    let task: { destroy: () => void; promise: Promise<PdfDocument> } | null = null;
    if (!pdf) {
      setPdfDoc(null);
      setPageCount(0);
      return;
    }
    setPdfDoc(null);
    setPageCount(0);
    downloadBlob(pdf.file_url).then((blob) => {
      if (cancel || !blob) return;
      blob.arrayBuffer().then(async (buffer) => {
        if (cancel) return;
        const pdfjsLib = await loadPdfJs();
        if (cancel) return;
        task = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          isEvalSupported: false,
          isOffscreenCanvasSupported: false,
        });
        task.promise
          .then((doc) => {
            if (cancel) return;
            setPdfDoc(doc);
            setPageCount(doc.numPages);
            setPage(1);
          })
          .catch(() => {
            if (!cancel) toast.error("Impossible d'afficher le PDF.");
          });
      });
    });
    return () => {
      cancel = true;
      task?.destroy();
    };
  }, [pdf]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
    let cancelled = false;
    let renderTask: { cancel: () => void; promise: Promise<unknown> } | null = null;
    let rendering = false;
    let pending = false;
    let lastWidth = 0;
    let lastHeight = 0;

    const render = async () => {
      if (cancelled) return;
      if (rendering) {
        pending = true;
        return;
      }
      rendering = true;
      const pdfPage = await pdfDoc.getPage(Math.min(Math.max(page, 1), pdfDoc.numPages));
      if (cancelled || !canvasRef.current || !containerRef.current) {
        rendering = false;
        return;
      }
      const container = containerRef.current;
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const padding = 24;
      const cw = container.clientWidth || container.getBoundingClientRect().width;
      const ch = container.clientHeight || container.getBoundingClientRect().height;
      const availableWidth = Math.max(100, cw - padding);
      const availableHeight = Math.max(100, ch - padding);
      const fitScale = Math.min(
        availableWidth / baseViewport.width,
        availableHeight / baseViewport.height,
      );
      if (!Number.isFinite(fitScale) || fitScale <= 0) {
        rendering = false;
        return;
      }
      const viewport = pdfPage.getViewport({ scale: fitScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) {
        rendering = false;
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, viewport.width, viewport.height);
      lastWidth = cw;
      lastHeight = ch;
      renderTask = pdfPage.render({ canvas, canvasContext: context, viewport } as never);
      await renderTask.promise.catch(() => undefined);
      renderTask = null;
      rendering = false;
      if (pending && !cancelled) {
        pending = false;
        void render();
      }
    };

    const raf = requestAnimationFrame(() => {
      void render();
    });
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (Math.abs(width - lastWidth) < 2 && Math.abs(height - lastHeight) < 2) return;
      void render();
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      try {
        renderTask?.cancel();
      } catch {
        /* noop */
      }
      resizeObserver.disconnect();
    };
  }, [pdfDoc, page]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      if (e.key === "ArrowRight")
        setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1));
      else if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pageCount]);

  const downloadDeliverable = async (d: Deliverable, fallback: string) => {
    const blob = await downloadBlob(d.file_url);
    if (!blob) return;
    saveBlob(blob, d.file_name || fallback);
    toast.success("Téléchargement démarré");
  };

  const studyDate = new Date(
    study.generation_completed_at || study.created_at || Date.now(),
  ).toLocaleDateString("fr-FR");
  const studyIdShort = study.id.slice(0, 8).toUpperCase();

  return (
    <div className="srv">
      {/* Top nav */}
      <nav className="srv-topnav">
        <Link to="/app/studies" className="srv-brand">
          stella<span className="srv-brand-dot" />
        </Link>
        <div className="srv-nav-right">
          <Link to="/app/studies" className="srv-nav-link">
            ← Mes études
          </Link>
        </div>
      </nav>

      <div className="srv-result">
        {/* Header */}
        <header className="srv-header">
          <div>
            <div className="srv-eyebrow-mono">
              Étude générée · {studyDate} · ID #{studyIdShort} · v{study.version_number}
            </div>
            <h1>
              {study.city_name ? `${study.city_name} · ` : ""}
              {study.title || "Étude sans titre"}
            </h1>
          </div>
          <div className="srv-header-actions">
            <Link to="/app/studies" className="srv-btn srv-btn-ghost">
              ← Retour aux études
            </Link>
          </div>
        </header>

        {/* Main : thumbs + preview */}
        <div className="srv-main">
          <aside className="srv-thumbs">
            {pdfDoc ? (
              Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
                const hasChart = n === 3 || n === 9;
                const isActive = n === page;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`srv-thumb${isActive ? " is-active" : ""}`}
                    onClick={() => setPage(n)}
                    aria-label={`Slide ${n}`}
                  >
                    <span className="srv-thumb-nb">{String(n).padStart(2, "0")}</span>
                    <div className="srv-bar srv-bar-lg" />
                    <div className="srv-bar srv-bar-accent" />
                    <div className="srv-bar srv-bar-med" />
                    {hasChart ? (
                      <div className="srv-thumb-chart">
                        <div className="srv-thumb-col" style={{ height: "40%" }} />
                        <div className="srv-thumb-col" style={{ height: "60%" }} />
                        <div className="srv-thumb-col" style={{ height: "50%" }} />
                        <div className="srv-thumb-col" style={{ height: "80%" }} />
                      </div>
                    ) : (
                      <div className="srv-thumb-blk" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="srv-thumbs-loading">Chargement…</div>
            )}
          </aside>

          <div className="srv-preview">
            <button
              type="button"
              className="srv-nav-arrow srv-nav-left"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pdfDoc || page <= 1}
              aria-label="Slide précédente"
            >
              ‹
            </button>
            <button
              type="button"
              className="srv-nav-arrow srv-nav-right"
              onClick={() =>
                setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1))
              }
              disabled={!pdfDoc || (pageCount > 0 && page >= pageCount)}
              aria-label="Slide suivante"
            >
              ›
            </button>

            <div ref={containerRef} className="srv-slide-canvas">
              {pdfDoc ? (
                <canvas key={page} ref={canvasRef} className="srv-canvas" />
              ) : (
                <div className="srv-loading">Chargement de l'aperçu…</div>
              )}
            </div>

            {pdfDoc && (
              <div className="srv-page-counter">
                {String(page).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
              </div>
            )}
          </div>
        </div>

        {/* Download dock */}
        <div className="srv-dl-dock">
          {pptx && (
            <button
              type="button"
              className="srv-dl-btn"
              onClick={() => downloadDeliverable(pptx, "etude.pptx")}
            >
              <div className="srv-dl-ico srv-dl-ico-ppt">PPT</div>
              <div className="srv-dl-meta">
                <span className="srv-dl-name">PPTX</span>
                <span className="srv-dl-desc">
                  {formatSize(pptx.file_size)} · éditable PowerPoint
                </span>
              </div>
            </button>
          )}

          {pdf && (
            <button
              type="button"
              className="srv-dl-btn srv-dl-recommended"
              onClick={() => downloadDeliverable(pdf, "etude.pdf")}
            >
              <span className="srv-dl-badge">★ Format recommandé</span>
              <div className="srv-dl-ico srv-dl-ico-pdf">PDF</div>
              <div className="srv-dl-meta">
                <span className="srv-dl-name">PDF natif</span>
                <span className="srv-dl-desc">
                  vectoriel · ultra-net · {formatSize(pdf.file_size)}
                </span>
              </div>
            </button>
          )}

          {html && (
            <button
              type="button"
              className="srv-dl-btn"
              onClick={() => downloadDeliverable(html, "etude.html")}
            >
              <div className="srv-dl-ico srv-dl-ico-html">&lt;/&gt;</div>
              <div className="srv-dl-meta">
                <span className="srv-dl-name">HTML</span>
                <span className="srv-dl-desc">
                  preview navigateur · {formatSize(html.file_size)}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Admin-only notice */}
        {notice && (
          <div className="srv-notice">
            <span className="srv-notice-badge">🔒 Admin uniquement</span>
            <div className="srv-notice-body">
              <div className="srv-notice-title">Notice méthodologique</div>
              <div className="srv-notice-desc">
                Sources, méthode de calcul et limites par slide. Usage interne FLEXIBIA —
                ne pas transmettre au client.
              </div>
            </div>
            <button
              type="button"
              className="srv-btn srv-btn-ghost"
              onClick={() => downloadDeliverable(notice, "notice.pdf")}
            >
              📥 Télécharger notice.pdf · {formatSize(notice.file_size)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}