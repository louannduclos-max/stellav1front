interface Props {
  src?: string;
  title?: string;
  height?: number | string;
}

export function StudyPreview({ src, title = "Aperçu de l'étude", height = 600 }: Props) {
  if (!src) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">
        Aucun aperçu disponible.
      </div>
    );
  }
  return (
    <iframe
      src={src}
      title={title}
      className="w-full rounded-lg border bg-background"
      style={{ height }}
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
}