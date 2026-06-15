import type { StellaSlide5_0, StellaQAReport } from "./types";

function rectsOverlap(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number },
) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

const NON_OVERLAP_EXEMPT_TYPES = new Set(["shape"]);

export function auditSlide(slide: StellaSlide5_0): StellaQAReport {
  const overlapViolations: Array<{ a: string; b: string }> = [];
  const positioned = slide.objects.map((o) => ({
    id: o.id,
    type: o.data_object_type,
    left: o.left,
    top: o.top,
    right: o.left + o.width,
    bottom: o.top + o.height,
  }));

  for (let i = 0; i < positioned.length; i++) {
    for (let j = i + 1; j < positioned.length; j++) {
      const a = positioned[i];
      const b = positioned[j];
      if (a.id === "slide-separator" || b.id === "slide-separator") continue;
      if (NON_OVERLAP_EXEMPT_TYPES.has(a.type) && NON_OVERLAP_EXEMPT_TYPES.has(b.type)) {
        if (a.id.startsWith("kpi-card") && b.id.startsWith("kpi-card")) {
          if (rectsOverlap(a, b)) overlapViolations.push({ a: a.id, b: b.id });
        }
        continue;
      }
      if (rectsOverlap(a, b)) overlapViolations.push({ a: a.id, b: b.id });
    }
  }

  const renderedStrings = new Set<string>();
  for (const obj of slide.objects) {
    if (obj.text) renderedStrings.add(obj.text.trim());
    if (obj.children) {
      for (const c of obj.children) {
        if (c.text) renderedStrings.add(c.text.trim());
      }
    }
  }

  const textViolations: string[] = [];
  for (const expected of slide.expected_strings) {
    if (!expected) continue;
    if (![...renderedStrings].some((s) => s.includes(expected))) {
      textViolations.push(expected);
    }
  }

  return {
    slide_id: slide.slide_id,
    overlap_violations: overlapViolations,
    text_violations: textViolations,
    whitespace_compliant: slide.whitespace_compliant,
    whitespace_ratio: slide.whitespace_ratio,
  };
}

export function auditAllSlides(slides: StellaSlide5_0[]): StellaQAReport[] {
  return slides.map(auditSlide);
}