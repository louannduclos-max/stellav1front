declare module "pdfjs-dist/build/pdf.mjs" {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(options: {
    data: Uint8Array;
    isEvalSupported?: boolean;
    isOffscreenCanvasSupported?: boolean;
  }): { destroy: () => void; promise: Promise<unknown> };
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const workerUrl: string;
  export default workerUrl;
}