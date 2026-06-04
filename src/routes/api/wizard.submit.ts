import { createFileRoute } from "@tanstack/react-router";
import { handleWizardSubmit } from "../../lib/wizard-submit.server";

export const Route = createFileRoute("/api/wizard/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => handleWizardSubmit(request),
    },
  },
});