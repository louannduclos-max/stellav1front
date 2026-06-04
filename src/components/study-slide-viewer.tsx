import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { toast } from "sonner";

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

async function downloadDeliverableBlob(path: string): Promise<Blob | null> {
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

async function loadPdfJs(): Promise<PdfJsModule> {
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
  const pdfjs = pdfjsLib as unknown as PdfJsModule;
  const workerUrl = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).href;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

export function StudySlideViewer({ deliverables }: { deliverables: Deliverable[] }) {
  const pdf = useMemo(
    () => deliverables.find((d) => d.type === "pdf" || d.mime_type === "application/pdf"),
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

  const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    downloadDeliverableBlob(pdf.file_url).then((blob) => {
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
        task.promise.then((doc) => {
          if (cancel) return;
          setPdfDoc(doc);
          setPageCount(doc.numPages);
          setPage(1);
        }).catch(() => {
          if (!cancel) toast.error("Impossible d'afficher le PDF dans la prévisualisation.");
        });
      });
    });
    return () => {
      cancel = true;
      task?.destroy();
    };
  }, [pdf]);

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
      const padding = fullscreen ? 48 : 24;
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

    // Defer first render to next frame so layout (aspect-ratio) is settled.
    const raf = requestAnimationFrame(() => { void render(); });
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      // Ignore sub-pixel jitter to prevent render loops.
      if (Math.abs(width - lastWidth) < 2 && Math.abs(height - lastHeight) < 2) return;
      void render();
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      try { renderTask?.cancel(); } catch { /* noop */ }
      resizeObserver.disconnect();
    };
  }, [pdfDoc, page, fullscreen]);

  // Fullscreen API
  const enterFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      await el.requestFullscreen();
      setFullscreen(true);
    } catch {
      // ignore
    }
  };
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Keyboard nav inside fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1));
      else if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
      else if (e.key === "Escape" && document.fullscreenElement) document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, pageCount]);

  const handleDownload = async (path: string, label: string) => {
    const blob = await downloadDeliverableBlob(path);
    if (!blob) return;
    saveBlob(blob, label);
  };

  if (!pdf && !pptx) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Aucun livrable disponible pour la prévisualisation.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card p-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pdfDoc || page === 1}
            aria-label="Slide précédente"
          >
            ←
          </Button>
          <span className="text-xs text-muted-foreground px-2 tabular-nums min-w-[60px] text-center">
            Slide {pageCount ? `${page} / ${pageCount}` : page}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1))}
            disabled={!pdfDoc || (pageCount > 0 && page >= pageCount)}
            aria-label="Slide suivante"
          >
            →
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={enterFullscreen} disabled={!pdfDoc}>
            ⛶ Mode présentation
          </Button>
          {pdf && (
            <Button
              size="sm"
              onClick={() => handleDownload(pdf.file_url, pdf.file_name || "etude.pdf")}
            >
              📄 Exporter PDF
            </Button>
          )}
          {pptx && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDownload(pptx.file_url, pptx.file_name || "etude.pptx")}
            >
              🎨 Exporter PPTX
            </Button>
          )}
        </div>
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="relative w-full bg-black rounded-md overflow-hidden border border-border"
        style={{ aspectRatio: fullscreen ? undefined : "16/10", height: fullscreen ? "100vh" : undefined }}
      >
        {pdfDoc ? (
          <div className="absolute inset-0 grid place-items-center bg-neutral-950 p-3">
            <canvas ref={canvasRef} className="max-h-full max-w-full rounded-sm bg-white shadow-2xl" />
          </div>
        ) : pdf ? (
          <div className="absolute inset-0 grid place-items-center text-white/70 text-sm">
            Chargement de l'aperçu…
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-white/70 text-sm text-center px-6">
            Le format PPTX n'est pas prévisualisable en ligne — utilisez le bouton
            <br />« Exporter PPTX » pour le télécharger.
          </div>
        )}

        {fullscreen && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 rounded-full px-3 py-1.5 shadow-lg">
            <button
              className="text-sm px-2"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Précédente"
            >
              ←
            </button>
            <span className="text-xs tabular-nums">Slide {page}</span>
            <button
              className="text-sm px-2"
              onClick={() => setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1))}
              aria-label="Suivante"
            >
              →
            </button>
            <button
              className="text-xs px-2 ml-1 border-l border-border"
              onClick={() => document.exitFullscreen?.()}
            >
              Quitter
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Astuce : utilisez les flèches ← → du clavier en mode présentation.
      </p>
    </div>
  );
}