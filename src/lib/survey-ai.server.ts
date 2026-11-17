import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN = "X-Lovable-AIG-Run-ID";

export async function analyseSurveyPhoto(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ error: "AI is not set up yet." }, { status: 500 });
  const body = (await request.json().catch(() => null)) as { area?: string; image?: string } | null;
  if (!body?.image?.startsWith("data:image/") || !body.area) return Response.json({ error: "Please add a photo first." }, { status: 400 });

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN, runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get(RUN) ?? undefined;
      return res;
    },
  });
  try {
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "You are an experienced UK CCTV and intruder alarm surveyor helping a homeowner plan a system from their phone photos. Be practical, specific to what you can see, and brief. Use UK terms (eaves, NVR, PIR, Grade 2). Never invent things not visible; if the photo is unclear say what to re-film.",
      messages: [{ role: "user", content: [
        { type: "text", text: `Survey area: ${body.area}. Look at this photo and reply in under 90 words with: 1) where exactly to place each camera or sensor (height and angle), 2) camera style to use, 3) any cable route or hazard. Use short lines starting with "• ".` },
        { type: "image", image: new URL(body.image) },
      ] }],
      abortSignal: request.signal,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });
    const text = await result.text;
    if (!text.trim()) return Response.json({ error: "The AI couldn't read that photo. Try a clearer one." }, { status: 422 });
    return Response.json({ text });
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode ?? 500;
    const msg = status === 402 ? "AI credits have run out. Top up to keep using the AI survey." : status === 429 ? "The AI is busy. Please wait a moment and try again." : "The AI couldn't check this photo right now.";
    return Response.json({ error: msg }, { status });
  }
}
