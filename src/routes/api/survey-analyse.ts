import { createFileRoute } from "@tanstack/react-router";
import { analyseSurveyPhoto } from "@/lib/survey-ai.server";

export const Route = createFileRoute("/api/survey-analyse")({
  server: { handlers: { POST: ({ request }) => analyseSurveyPhoto(request) } },
});
