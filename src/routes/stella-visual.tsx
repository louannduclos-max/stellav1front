import { createFileRoute } from "@tanstack/react-router";
import StellaVisualRoute from "../components/stella/StellaVisualRoute";

export const Route = createFileRoute("/stella-visual")({
  component: StellaVisualRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    studyId: typeof search.studyId === "string" ? search.studyId : "",
    brand: typeof search.brand === "string" ? search.brand : "o2",
    baseUrl: typeof search.baseUrl === "string" ? search.baseUrl : "",
    debug: typeof search.debug === "string" ? search.debug : "0",
  }),
});
