import React from 'react';
import StellaManifestPage from '@/components/stella/StellaManifestPage';

type StellaVisualRouteProps = {
  studyId?: string;
  brand?: string;
  baseUrl?: string;
};

export default function StellaVisualRoute({ studyId, brand, baseUrl }: StellaVisualRouteProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#EEF3FA' }} data-testid="stella-visual-route">
      <StellaManifestPage
        studyId={studyId ?? 'std_demo_replace_me'}
        brandSlug={brand ?? 'o2'}
        baseUrl={baseUrl ?? (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) ?? 'http://127.0.0.1:8000'}
      />
    </div>
  );
}
