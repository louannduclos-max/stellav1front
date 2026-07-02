const LINK_ID = "stella-theme";

function getBase(): string {
  // Sprint 14e3 — fallback prod (le localhost cassait le viewer déployé)
  const envUrl = import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined;
  const envOk =
    envUrl && envUrl.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(envUrl);
  return envOk ? (envUrl as string) : "https://stella-backend-mtap.onrender.com";
}

export function setBrand(slug: string): void {
  if (typeof document === "undefined") return;
  const href = `${getBase()}/integration/css-vars.css?brand_slug=${encodeURIComponent(slug)}`;
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

export function clearBrand(): void {
  if (typeof document === "undefined") return;
  document.getElementById(LINK_ID)?.remove();
}

if (typeof window !== "undefined") {
  (window as unknown as { setBrand: typeof setBrand }).setBrand = setBrand;
}