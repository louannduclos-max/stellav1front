import { createFileRoute } from "@tanstack/react-router";
import StellaVisualRoute from "../components/stella/StellaVisualRoute";

export const Route = createFileRoute("/stella-visual")({
  component: StellaVisualRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    // Params existants
    studyId: typeof search.studyId === "string" ? search.studyId : "",
    brand: typeof search.brand === "string" ? search.brand : "o2",
    baseUrl: typeof search.baseUrl === "string" ? search.baseUrl : "",
    debug: search.debug === 1 || search.debug === "1" ? 1 : 0,
    auto: search.auto === 1 || search.auto === "1" ? 1 : 0,
    // Params formulaire utilisateur
    city: typeof search.city === "string" ? search.city : "",
    country: typeof search.country === "string" ? search.country : "",
    brand_name: typeof search.brand_name === "string" ? search.brand_name : "",
    business_model: typeof search.business_model === "string" ? search.business_model : "",
  }),
});
