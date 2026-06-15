import { useEffect } from "react";
import { setBrand, clearBrand } from "@/lib/stella-brand";

interface BrandThemeProps {
  slug?: string | null;
}

export function BrandTheme({ slug }: BrandThemeProps) {
  useEffect(() => {
    if (!slug) return;
    setBrand(slug);
    return () => clearBrand();
  }, [slug]);
  return null;
}